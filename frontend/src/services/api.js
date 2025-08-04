// src/services/api.js
// Multi-tenant API service for backend integration

const API_BASE = process.env.REACT_APP_API_BASE || "https://your-render-app-name.onrender.com/api";

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Helper function to get tenant-scoped URL
function getTenantUrl(tenantId, endpoint) {
  return `${API_BASE}/${tenantId}/${endpoint}`;
}

// Authentication APIs
export async function register(businessData) {
  const res = await fetch(`${API_BASE}/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(businessData),
  });
  return res.json();
}

export async function login(credentials) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

// Super Admin APIs
export async function fetchTenants() {
  const res = await fetch(`${API_BASE}/admin/tenants`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function approveTenant(tenantId) {
  const res = await fetch(`${API_BASE}/admin/tenants/${tenantId}/approve`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function blockTenant(tenantId) {
  const res = await fetch(`${API_BASE}/admin/tenants/${tenantId}/block`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function unblockTenant(tenantId) {
  const res = await fetch(`${API_BASE}/admin/tenants/${tenantId}/unblock`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchPlans() {
  const res = await fetch(`${API_BASE}/admin/plans`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createOrUpdatePlan(planData) {
  const res = await fetch(`${API_BASE}/admin/plans`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(planData),
  });
  return res.json();
}

export async function fetchPlanRequests() {
  const res = await fetch(`${API_BASE}/admin/plan-requests`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function approvePlanRequest(tenantId, approve) {
  const res = await fetch(
    `${API_BASE}/admin/tenants/${tenantId}/plan-request`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ approve }),
    }
  );
  return res.json();
}

// Tenant-scoped APIs
export async function fetchLeads(tenantId) {
  const res = await fetch(getTenantUrl(tenantId, "leads"), {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateLead(tenantId, id, lead) {
  const res = await fetch(getTenantUrl(tenantId, `leads/${id}`), {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(lead),
  });
  return res.json();
}

export async function fetchSettings(tenantId) {
  const res = await fetch(getTenantUrl(tenantId, "settings"), {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateSettings(tenantId, settings) {
  const res = await fetch(getTenantUrl(tenantId, "settings"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function fetchKnowledgebase(tenantId) {
  const res = await fetch(getTenantUrl(tenantId, "knowledgebase"), {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateKnowledgebase(tenantId, content) {
  const res = await fetch(getTenantUrl(tenantId, "knowledgebase"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function fetchWhatsAppQR(tenantId) {
  const res = await fetch(getTenantUrl(tenantId, "whatsapp/qr"), {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchUsage(tenantId) {
  const res = await fetch(getTenantUrl(tenantId, "usage"), {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateSubscription(tenantId, subscriptionPlan) {
  // This now requests a plan change (requires admin approval)
  const res = await fetch(getTenantUrl(tenantId, "request-plan-change"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ planId: subscriptionPlan }),
  });
  return res.json();
}

export async function deleteTenant(tenantId) {
  const res = await fetch(`${API_BASE}/admin/tenants/${tenantId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateSheetsConfig(
  tenantId,
  googleSheetId,
  googleCredentials
) {
  const res = await fetch(getTenantUrl(tenantId, "sheets-config"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ googleSheetId, googleCredentials }),
  });
  return res.json();
}

// --- Admin Plan CRUD and Tenant Stats ---
export async function createPlan(plan) {
  const res = await fetch(`${API_BASE}/admin/plans`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(plan),
  });
  return res.json();
}
export async function updatePlan(planId, plan) {
  const res = await fetch(`${API_BASE}/admin/plans/${planId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(plan),
  });
  return res.json();
}
export async function deletePlan(planId) {
  const res = await fetch(`${API_BASE}/admin/plans/${planId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}
export async function fetchTenantStats(tenantId) {
  const res = await fetch(`${API_BASE}/admin/tenants/${tenantId}/stats`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// Legacy APIs (for backward compatibility)
export async function addLead(lead) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  return res.json();
}

export async function deleteLead(id) {
  const res = await fetch(`${API_BASE}/leads/${id}`, { method: "DELETE" });
  return res.json();
}

export async function fetchChatHistory(leadId) {
  const res = await fetch(`${API_BASE}/messages/${leadId}`);
  return res.json();
}

export async function sendMessage(message) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  return res.json();
}

export async function fetchAnalytics() {
  // Placeholder: implement real analytics endpoint later
  return {
    totalLeads: 0,
    conversions: 0,
    followUps: 0,
  };
}

export async function resetTenantUsage(tenantId) {
  const res = await fetch(`${API_BASE}/admin/tenants/${tenantId}/reset-usage`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function deduplicateLeads(tenantId) {
  const res = await fetch(`${API_BASE}/admin/deduplicate-leads/${tenantId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}


