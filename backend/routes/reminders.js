const express = require("express");
const Reminder = require("../models/Reminder");
const router = express.Router();

// GET /api/reminders
router.get("/", async (req, res) => {
  const reminders = await Reminder.find().sort({ remindAt: 1 });
  res.json(reminders);
});

// POST /api/reminders
router.post("/", async (req, res) => {
  const reminder = new Reminder(req.body);
  await reminder.save();
  res.status(201).json(reminder);
});

module.exports = router;
