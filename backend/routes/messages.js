const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

// GET /api/messages/:leadId
router.get("/:leadId", async (req, res) => {
  const messages = await Message.find({ lead: req.params.leadId }).sort({
    timestamp: 1,
  });
  res.json(messages);
});

// POST /api/messages
router.post("/", async (req, res) => {
  const message = new Message(req.body);
  await message.save();
  res.status(201).json(message);
});

module.exports = router;
