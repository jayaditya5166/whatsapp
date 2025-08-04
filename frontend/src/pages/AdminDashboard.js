import React from "react";
import WhatsAppConnect from "../components/WhatsAppConnect";
import GlobalMessagingSettings from "../components/GlobalMessagingSettings";
import KnowledgebaseEditor from "../components/KnowledgebaseEditor";
import LeadsTable from "../components/LeadsTable";

const AdminDashboard = () => (
  <div className="container-fluid py-4">
    <h1 className="mb-4">Admin Dashboard</h1>
    <div className="row gy-4">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <WhatsAppConnect />
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <GlobalMessagingSettings />
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <KnowledgebaseEditor />
          </div>
        </div>
      </div>
      <div className="col-12">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <LeadsTable />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
