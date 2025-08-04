import React, { useEffect, useState } from "react";
import { fetchKnowledgebase, updateKnowledgebase } from "../services/api";

const KnowledgebaseEditor = ({ tenantId }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (tenantId) {
      fetchKnowledgebase(tenantId).then((kb) => {
        setContent(kb.content || "");
        setLoading(false);
      });
    }
  }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId) return;

    setSaving(true);
    await updateKnowledgebase(tenantId, content);
    setMessage("Knowledgebase updated!");
    setSaving(false);
    setTimeout(() => setMessage(""), 2000);
  };

  if (loading) return <div>Loading knowledgebase...</div>;

  return (
    <div className="mb-4">
      <h3>AI Knowledgebase (FAQ, Company Info, etc.)</h3>
      <textarea
        className="form-control mb-2"
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter knowledgebase content for AI replies..."
      />
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Knowledgebase"}
      </button>
      {message && <div className="text-success mt-2">{message}</div>}
    </div>
  );
};

export default KnowledgebaseEditor;
