const express = require("express");
const Settings = require("../models/Settings");
const router = express.Router();

// GET /api/settings
router.get("/", async (req, res) => {
  let settings = await Settings.findOne().sort({ updatedAt: -1 });
  if (!settings) settings = await Settings.create({});
  res.json(settings);
});

// POST /api/settings
router.post("/", async (req, res) => {
  const {
    messageTemplate,
    batchSize,
    messageDelay,
    companyProfile,
    systemPrompt,
    followupMessages,
    followupDelays,
    fetchIntervalMinutes,
    globalAutoFollowupEnabled,
    leadStages,
  } = req.body;
  let settings = await Settings.findOne().sort({ updatedAt: -1 });
  if (!settings) settings = new Settings();
  if (messageTemplate !== undefined) settings.messageTemplate = messageTemplate;
  if (batchSize !== undefined) settings.batchSize = batchSize;
  if (messageDelay !== undefined) settings.messageDelay = messageDelay;
  if (companyProfile !== undefined) settings.companyProfile = companyProfile;
  if (systemPrompt !== undefined) settings.systemPrompt = systemPrompt;
  if (followupMessages !== undefined)
    settings.followupMessages = followupMessages;
  if (followupDelays !== undefined) settings.followupDelays = followupDelays;
  if (fetchIntervalMinutes !== undefined)
    settings.fetchIntervalMinutes = fetchIntervalMinutes;
  if (globalAutoFollowupEnabled !== undefined)
    settings.globalAutoFollowupEnabled = globalAutoFollowupEnabled;
  if (leadStages !== undefined) settings.leadStages = leadStages;
  settings.updatedAt = new Date();
  await settings.save();
  res.status(201).json(settings);
});

module.exports = router;
