const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  messageTemplate: {
    type: String,
    default:
      "Hi {name}, Thanks for filling the form. We will contact you soon.",
  },
  batchSize: { type: Number, default: 1 },
  messageDelay: { type: Number, default: 3000 },
  companyProfile: { type: String, default: "" },
  systemPrompt: { type: String, default: "" },
  followupMessages: { type: [String], default: ["", "", ""] },
  followupDelays: { type: [Number], default: [86400000, 172800000, 259200000] }, // ms
  fetchIntervalMinutes: { type: Number, default: 3 },
  globalAutoFollowupEnabled: { type: Boolean, default: false },
  // Add leadStages for dynamic stage detection
  leadStages: {
    type: [
      {
        stage: { type: String, required: true },
        description: { type: String, required: true },
        keywords: { type: [String], required: true },
      },
    ],
    default: [],
  },
  autoFollowupForIncoming: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Settings", settingsSchema);
