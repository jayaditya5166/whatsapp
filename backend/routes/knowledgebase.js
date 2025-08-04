const express = require("express");
const Knowledgebase = require("../models/Knowledgebase");
const router = express.Router();

// GET /api/knowledgebase
router.get("/", async (req, res) => {
  const kb = await Knowledgebase.findOne().sort({ updatedAt: -1 });
  res.json(kb || { content: "" });
});

// POST /api/knowledgebase
router.post("/", async (req, res) => {
  const { content } = req.body;
  const kb = new Knowledgebase({ content });
  await kb.save();
  res.status(201).json(kb);
});

module.exports = router;
