const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  note: { type: String, required: true },
  remindAt: { type: Date, required: true },
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Reminder", reminderSchema);
