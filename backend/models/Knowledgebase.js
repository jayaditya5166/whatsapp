const mongoose = require("mongoose");

const knowledgebaseSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Knowledgebase", knowledgebaseSchema);
