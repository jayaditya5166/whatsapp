import React, { useEffect, useState } from "react";
import { fetchLeads, updateLead, fetchSettings } from "../services/api";
import LeadDetailsModal from "./LeadDetailsModal";
import io from "socket.io-client";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://your-render-app-name.onrender.com";

const LeadsTable = ({ tenantId }) => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leadStages, setLeadStages] = useState([]);

  useEffect(() => {
    let interval;
    let socket;
    if (tenantId) {
      const fetchAndSetLeads = () => {
        fetchLeads(tenantId).then((leadsData) => {
          setLeads(leadsData);
          setLoading(false);
        });
      };
      fetchAndSetLeads();
      interval = setInterval(fetchAndSetLeads, 15000); // Poll every 15 seconds
      // Fetch lead stages from settings
      fetchSettings(tenantId).then((settings) => {
        setLeadStages(settings.leadStages || []);
      });
      // --- Socket.io for real-time updates ---
      socket = io(SOCKET_URL, { transports: ["websocket"] });
      socket.emit("join-tenant", tenantId);
      socket.on("lead-updated", (updatedLead) => {
        setLeads((prev) => {
          const idx = prev.findIndex(l => l._id === updatedLead._id);
          if (idx !== -1) {
            // Update existing lead
            const newLeads = [...prev];
            newLeads[idx] = { ...prev[idx], ...updatedLead };
            return newLeads;
          } else {
            // Add new lead if not present
            return [updatedLead, ...prev];
          }
        });
      });
    }
    return () => {
      interval && clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [tenantId, refresh]);

  const handleEdit = (lead) => setSelectedLead(lead);
  const handleClose = () => setSelectedLead(null);
  const handleSave = () => {
    setSelectedLead(null);
    setRefresh((r) => !r);
  };

  const handleStageChange = async (lead, newStage) => {
    await updateLead(tenantId, lead._id, { detectedStage: newStage });
    setLeads((prev) => prev.map(l => l._id === lead._id ? { ...l, detectedStage: newStage } : l));
  };

  // Add manual refresh handler
  const handleManualRefresh = async () => {
    setLoading(true);
    const leadsData = await fetchLeads(tenantId);
    setLeads(leadsData);
    setLoading(false);
  };

  if (loading) return <div>Loading leads...</div>;

  return (
    <div>
      <h2>Leads</h2>
      <button className="btn btn-primary mb-2" onClick={handleManualRefresh} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Source</th>
              <th>Stage</th>
              <th>Initial Msg Sent</th>
              <th>Initial Msg Time</th>
              <th>Follow-up Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const sentCount = (lead.followupStatuses || []).filter(f => f && f.sent).length;
              const maxFollowups = (lead.followupStatuses || []).length;
              return (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.email}</td>
                  <td>{lead.status}</td>
                  <td>{lead.source}</td>
                  <td>
                    <select
                      className="form-select"
                      value={lead.detectedStage || ""}
                      onChange={e => handleStageChange(lead, e.target.value)}
                    >
                      <option value="">Select stage</option>
                      {leadStages.map((stage) => (
                        <option key={stage.stage} value={stage.stage}>{stage.stage} - {stage.description}</option>
                      ))}
                    </select>
                  </td>
                  <td>{lead.initialMessageSent ? "Yes" : "No"}</td>
                  <td>{lead.initialMessageTimestamp ? new Date(lead.initialMessageTimestamp).toLocaleString() : ""}</td>
                  <td>{sentCount > 0 ? `Follow-ups sent: ${sentCount}/${maxFollowups}` : "No follow-ups sent"}</td>
                  <td style={{ maxWidth: 120, whiteSpace: "pre-wrap" }}>{lead.notes}</td>
                  <td>
                    <button className="btn btn-sm btn-info" onClick={() => handleEdit(lead)}>Edit</button>
                    {lead.sendFailed && (<span className="text-danger ml-2">Send Failed</span>)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={handleClose}
          onSave={handleSave}
          tenantId={tenantId}
        />
      )}
    </div>
  );
};

export default LeadsTable;
