import React, { useState } from "react";
import { updateLead } from "../services/api";

const LeadDetailsModal = ({ lead, onClose, onSave, tenantId }) => {
  const [notes, setNotes] = useState(lead.notes || "");
  const [autoFollowupEnabled, setAutoFollowupEnabled] = useState(
    lead.autoFollowupEnabled || false
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tenantId) return;

    setSaving(true);
    try {
      await updateLead(tenantId, lead._id, {
        notes,
        autoFollowupEnabled,
      });
      onSave();
    } catch (error) {
      console.error("Failed to update lead:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Lead: {lead.name}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
              />
            </div>
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="autoFollowup"
                checked={autoFollowupEnabled}
                onChange={(e) => setAutoFollowupEnabled(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="autoFollowup">
                Enable Auto Follow-up for this lead
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
