const express = require("express");
const Lead = require("../models/Lead");
const router = express.Router();

// GET /api/leads
router.get("/", async (req, res) => {
  const leads = await Lead.find().sort({ timestamp: -1 });
  res.json(leads);
});

// POST /api/leads
router.post("/", async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.status(201).json(lead);
});

// PUT /api/leads/:id
router.put("/:id", async (req, res) => {
  const { notes, autoFollowupEnabled } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  if (notes !== undefined) lead.notes = notes;
  if (autoFollowupEnabled !== undefined)
    lead.autoFollowupEnabled = autoFollowupEnabled;
  await lead.save();
  res.json(lead);
});

// DELETE /api/leads/:id
router.delete("/:id", async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ message: "Lead deleted" });
});

module.exports = router;
