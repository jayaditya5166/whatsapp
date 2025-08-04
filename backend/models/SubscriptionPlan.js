const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true }, // gold, silver, platinum
  planName: { type: String, required: true }, // Gold Plan, Silver Plan, Platinum Plan
  price: { type: Number, required: true }, // Monthly price in USD
  initialMessageLimit: { type: Number, required: true }, // How many initial messages from Excel
  conversationLimit: { type: Number, required: true }, // How many AI conversations per month
  followupLimit: { type: Number, required: true }, // How many follow-up messages
  features: { type: [String], default: [] }, // Array of feature descriptions
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
