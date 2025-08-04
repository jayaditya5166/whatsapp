const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleSheetId: { type: String },
  googleCredentials: { type: Object },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  // Subscription plan fields
  subscriptionPlan: { type: String, default: "silver" }, // gold, silver, platinum
  subscriptionStartDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date },
  // Usage tracking
  monthlyUsage: {
    initialMessagesSent: { type: Number, default: 0 },
    aiConversations: { type: Number, default: 0 },
    followupMessagesSent: { type: Number, default: 0 },
    resetDate: { type: Date, default: Date.now },
  },
  // Plan change request
  pendingPlanRequest: {
    planId: { type: String },
    requestedAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", null],
      default: null,
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tenant", tenantSchema);
