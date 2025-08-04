const express = require("express");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { getLatestQRDataUrl, getLatestQRRaw } = require("../services/whatsapp");
const router = express.Router();

let latestQR = null;

// Expose a function to update the latest QR from the WhatsApp service
function setLatestQR(qr) {
  latestQR = qr;
}

// GET /api/whatsapp/qr - returns QR code as data URL
router.get("/qr", async (req, res) => {
  const dataUrl = getLatestQRDataUrl && getLatestQRDataUrl();
  if (dataUrl) {
    return res.json({ qr: dataUrl });
  }
  // Try to get the raw QR string and generate Data URL on demand
  const rawQR = getLatestQRRaw && getLatestQRRaw();
  if (!rawQR) return res.status(404).json({ error: "No QR code available" });
  try {
    const url = await qrcode.toDataURL(rawQR);
    res.json({ qr: url });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// DELETE /api/whatsapp/session - deletes session.json to force QR regeneration
router.delete("/session", (req, res) => {
  const sessionPath = path.resolve(
    process.env.WHATSAPP_SESSION_FILE || "./session.json"
  );
  fs.unlink(sessionPath, (err) => {
    if (err && err.code !== "ENOENT") {
      return res.status(500).json({ error: "Failed to delete session file" });
    }
    latestQR = null;
    res.json({
      message:
        "WhatsApp session cleared. Please restart the backend to regenerate QR.",
    });
  });
});

module.exports = { router, setLatestQR };
