import React, { useState, useEffect } from "react";
import {
  fetchTenants,
  approveTenant,
  blockTenant,
  unblockTenant,
  fetchPlans,
  createPlan,
  updatePlan,
  deletePlan,
  fetchTenantStats,
  createOrUpdatePlan,
  fetchPlanRequests,
  deleteTenant,
  approvePlanRequest,
  resetTenantUsage,
  deduplicateLeads,
  fetchLeads,
} from "../services/api";

const SuperAdmin = () => {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [planRequests, setPlanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tenants");
  const [message, setMessage] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [tenantStats, setTenantStats] = useState(null);
  const [leads, setLeads] = useState([]); // Added leads state

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tenantsData, plansData, planRequestsData] = await Promise.all([
        fetchTenants(),
        fetchPlans(),
        fetchPlanRequests(),
      ]);
      setTenants(tenantsData);
      setPlans(plansData);
      setPlanRequests(planRequestsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantAction = async (action, tenantId) => {
    try {
      let response;
      switch (action) {
        case "approve":
          response = await approveTenant(tenantId);
          break;
        case "block":
          response = await blockTenant(tenantId);
          break;
        case "unblock":
          response = await unblockTenant(tenantId);
          break;
        case "delete":
          response = await deleteTenant(tenantId);
          break;
        case "reset-usage":
          response = await resetTenantUsage(tenantId);
          break;
        case "deduplicate-leads":
          response = await deduplicateLeads(tenantId);
          // Optionally show a toast/alert
          alert(response.message || "Leads deduplicated");
          // Refresh leads list for this tenant (implement fetchLeads if not present)
          await fetchLeads(tenantId);
          break;
        default:
          return;
      }
      setMessage(response.message || "Action completed successfully");
      loadData(); // Reload data
    } catch (error) {
      setMessage("Action failed. Please try again.");
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const planData = {
      planId: formData.get("planId"),
      planName: formData.get("planName"),
      price: Number(formData.get("price")),
      initialMessageLimit: Number(formData.get("initialMessageLimit")),
      conversationLimit: Number(formData.get("conversationLimit")),
      followupLimit: Number(formData.get("followupLimit")),
      features: formData
        .get("features")
        .split(",")
        .map((f) => f.trim()),
    };

    try {
      await createOrUpdatePlan(planData);
      setMessage("Plan updated successfully");
      loadData();
    } catch (error) {
      setMessage("Failed to update plan");
    }
  };

  const handlePlanRequest = async (tenantId, approve) => {
    try {
      const data = await approvePlanRequest(tenantId, approve);
      setMessage(data.message || "Plan request processed");
      loadData();
    } catch (error) {
      setMessage("Failed to process plan request");
    }
  };

  // Plan CRUD handlers
  const handleEditPlan = (plan) => setEditingPlan(plan);
  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      await deletePlan(planId);
      setMessage("Plan deleted successfully");
      loadData();
    }
  };
  const handlePlanFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const planData = {
      planId: formData.get("planId"),
      planName: formData.get("planName"),
      price: Number(formData.get("price")),
      initialMessageLimit: Number(formData.get("initialMessageLimit")),
      conversationLimit: Number(formData.get("conversationLimit")),
      followupLimit: Number(formData.get("followupLimit")),
      features: formData.get("features").split(",").map((f) => f.trim()),
    };
    if (editingPlan) {
      await updatePlan(editingPlan.planId, planData);
      setMessage("Plan updated successfully");
    } else {
      await createPlan(planData);
      setMessage("Plan created successfully");
    }
    setEditingPlan(null);
    loadData();
  };
  // Tenant stats handler
  const handleShowStats = async (tenantId) => {
    const stats = await fetchTenantStats(tenantId);
    setTenantStats(stats);
    setShowStats(true);
  };

  // Add fetchLeads function to refresh leads after deduplication
  async function fetchLeads(tenantId) {
    // Fetch leads and update state if you have a leads state variable
    if (typeof setLeads === 'function') {
      const leads = await fetchLeads(tenantId);
      setLeads(leads);
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">Super Admin Dashboard</h2>

      {message && (
        <div
          className="alert alert-info alert-dismissible fade show"
          role="alert"
        >
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "tenants" ? "active" : ""}`}
            onClick={() => setActiveTab("tenants")}
          >
            Tenants
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "plans" ? "active" : ""}`}
            onClick={() => setActiveTab("plans")}
          >
            Subscription Plans
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "planRequests" ? "active" : ""
            }`}
            onClick={() => setActiveTab("planRequests")}
          >
            Plan Requests{" "}
            {planRequests.length > 0 && (
              <span className="badge bg-danger">{planRequests.length}</span>
            )}
          </button>
        </li>
      </ul>

      {activeTab === "planRequests" && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Pending Plan Change Requests</h5>
            {planRequests.length === 0 ? (
              <div>No pending requests.</div>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Current Plan</th>
                    <th>Requested Plan</th>
                    <th>Requested At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {planRequests.map((req) => (
                    <tr key={req.tenantId}>
                      <td>{req.businessName}</td>
                      <td>{req.ownerName}</td>
                      <td>{req.email}</td>
                      <td>{req.currentPlan}</td>
                      <td>{req.requestedPlan}</td>
                      <td>{new Date(req.requestedAt).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handlePlanRequest(req.tenantId, true)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handlePlanRequest(req.tenantId, false)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "tenants" && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Manage Tenants</h5>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Approved</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.tenantId}>
                      <td>{tenant.businessName}</td>
                      <td>{tenant.ownerName}</td>
                      <td>{tenant.email}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            tenant.subscriptionPlan === "gold"
                              ? "warning"
                              : tenant.subscriptionPlan === "silver"
                              ? "secondary"
                              : "info"
                          }`}
                        >
                          {tenant.subscriptionPlan}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            tenant.isActive ? "success" : "danger"
                          }`}
                        >
                          {tenant.isActive ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            tenant.isApproved ? "success" : "warning"
                          }`}
                        >
                          {tenant.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleShowStats(tenant.tenantId)}
                          >
                            Stats
                          </button>
                          {!tenant.isApproved && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                handleTenantAction("approve", tenant.tenantId)
                              }
                            >
                              Approve
                            </button>
                          )}
                          {tenant.isActive ? (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleTenantAction("block", tenant.tenantId)
                              }
                            >
                              Block
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() =>
                                handleTenantAction("unblock", tenant.tenantId)
                              }
                            >
                              Unblock
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleTenantAction("reset-usage", tenant.tenantId)}
                          >
                            Reset Usage
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleTenantAction("delete", tenant.tenantId)
                            }
                          >
                            Delete
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() =>
                              handleTenantAction('deduplicate-leads', tenant.tenantId)
                            }
                          >
                            Deduplicate Leads
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Tenant Stats Modal */}
      {showStats && tenantStats && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tenant Stats</h5>
                <button type="button" className="btn-close" onClick={() => setShowStats(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Business:</strong> {tenantStats.tenant.businessName}</p>
                <p><strong>Plan:</strong> {tenantStats.plan?.planName}</p>
                <p><strong>Leads:</strong> {tenantStats.leadCount}</p>
                <p><strong>Initial Messages Sent:</strong> {tenantStats.usage.initialMessagesSent}</p>
                <p><strong>AI Conversations:</strong> {tenantStats.usage.aiConversations}</p>
                <p><strong>Follow-up Messages Sent:</strong> {tenantStats.usage.followupMessagesSent}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowStats(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "plans" && (
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Current Plans</h5>
                {plans.map((plan) => (
                  <div key={plan.planId} className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title">{plan.planName}</h6>
                      <p className="card-text">
                        <strong>Price:</strong> ${plan.price}/month<br />
                        <strong>Initial Messages:</strong> {plan.initialMessageLimit}<br />
                        <strong>AI Conversations:</strong> {plan.conversationLimit}<br />
                        <strong>Follow-up Messages:</strong> {plan.followupLimit}<br />
                        <strong>Features:</strong> {plan.features?.join(", ")}
                      </p>
                      <button className="btn btn-sm btn-info me-2" onClick={() => handleEditPlan(plan)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeletePlan(plan.planId)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{editingPlan ? "Edit Plan" : "Create Plan"}</h5>
                <form onSubmit={handlePlanFormSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Plan ID</label>
                    <input
                      type="text"
                      name="planId"
                      className="form-control"
                      defaultValue={editingPlan?.planId || ""}
                      required
                      disabled={!!editingPlan}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Plan Name</label>
                    <input
                      type="text"
                      name="planName"
                      className="form-control"
                      defaultValue={editingPlan?.planName || ""}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price (USD/month)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      min="0"
                      step="0.01"
                      defaultValue={editingPlan?.price || ""}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Initial Message Limit</label>
                    <input
                      type="number"
                      name="initialMessageLimit"
                      className="form-control"
                      min="1"
                      defaultValue={editingPlan?.initialMessageLimit || ""}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">AI Conversation Limit</label>
                    <input
                      type="number"
                      name="conversationLimit"
                      className="form-control"
                      min="1"
                      defaultValue={editingPlan?.conversationLimit || ""}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Follow-up Message Limit</label>
                    <input
                      type="number"
                      name="followupLimit"
                      className="form-control"
                      min="1"
                      defaultValue={editingPlan?.followupLimit || ""}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Features (comma-separated)</label>
                    <input
                      type="text"
                      name="features"
                      className="form-control"
                      defaultValue={editingPlan?.features?.join(", ") || ""}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </button>
                  {editingPlan && (
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={() => setEditingPlan(null)}
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
