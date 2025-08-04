const mongoose = require("mongoose");
const { cleanPhoneNumber } = require("../utils/phone");

const leadSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  status: {
    type: String,
    enum: ["New", "Cold", "Warm", "Hot", "Converted"],
    default: "New",
  },
  source: { type: String },
  timestamp: { type: Date, default: Date.now },
  initialMessageSent: { type: Boolean, default: false },
  initialMessageTimestamp: { type: Date },
  followupStatuses: {
    type: [
      {
        sent: { type: Boolean, default: false },
        timestamp: { type: Date },
        failed: { type: Boolean, default: false },
        error: { type: String },
      },
    ],
    default: [{}, {}, {}],
  },
  notes: { type: String },
  autoFollowupEnabled: { type: Boolean, default: false },
  detectedStage: { type: String, default: "" },
  lastRespondedAt: { type: Date },
});

leadSchema.pre("save", function(next) {
  if (this.phone) {
    this.phone = cleanPhoneNumber(this.phone);
  }
  next();
});

module.exports = mongoose.model("Lead", leadSchema);
