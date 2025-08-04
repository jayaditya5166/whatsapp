const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const Message = require("../../models/Message");
const { generateReply } = require("../ai/openai");
const syncLeads = require("../googleSheets/syncLeads");
const fs = require("fs");
const path = require("path");
const Lead = require("../../models/Lead");
const qrcodeTerminal = require("qrcode-terminal"); // For terminal QR print

let io = null;
function setSocketIO(ioInstance) {
  io = ioInstance;
}

const SESSION_FILE_PATH = process.env.WHATSAPP_SESSION_FILE || "./session.json";

let client = null;
let clientInitialized = false;
let clientReady = false;
let latestQRDataUrl = null;
let latestQRRaw = null;
let qrListeners = [];
let readyListeners = [];
let backendReady = false;

function setBackendReady(val) {
  backendReady = val;
}
function isBackendReady() {
  return backendReady;
}

function onQr(cb) {
  qrListeners.push(cb);
  // If QR is already available, call immediately
  if (latestQRDataUrl) cb(latestQRDataUrl);
}

function onReady(cb) {
  readyListeners.push(cb);
  if (clientReady) cb();
}

function isClientReady() {
  return clientReady;
}

async function clearSession() {
  // Remove the LocalAuth session folder for 'excel-leads'
  const sessionDir = path.join(__dirname, "..", ".wwebjs_auth", "excel-leads");
  try {
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      console.log("WhatsApp session folder deleted. Please rescan QR.");
    }
    clientReady = false;
    clientInitialized = false;
    client = null;
    latestQRDataUrl = null;
    latestQRRaw = null;
  } catch (err) {
    console.error("Failed to delete WhatsApp session folder:", err);
  }
}

async function initializeWhatsAppClient(force = false) {
  console.log("[WA] initializeWhatsAppClient called, force:", force);
  if (clientInitialized && !clientReady) {
    console.log("[WA] Forcing re-initialization because client is not ready.");
    force = true;
  }
  if (clientInitialized && !force) return;
  if (client) {
    try {
      await client.destroy();
    } catch (e) {}
    client = null;
    clientInitialized = false;
    clientReady = false;
    latestQRDataUrl = null;
    latestQRRaw = null;
  }
  console.log("[WA] Initializing WhatsApp client (excel-leads session)...");
  clientInitialized = true;
  clientReady = false;
  client = new Client({
    authStrategy: new LocalAuth({ clientId: "excel-leads" }), // Use same session as reference
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });
  client.on("qr", (qr) => {
    qrcodeTerminal.generate(qr, { small: true });
    console.log(
      "[WA] QR event fired. Scan the QR code above with your WhatsApp mobile app."
    );
    latestQRRaw = qr;
    require("qrcode").toDataURL(qr, (err, url) => {
      if (!err) {
        latestQRDataUrl = url;
        qrListeners.forEach((cb) => cb(url));
      }
    });
  });
  client.on("ready", async () => {
    latestQRDataUrl = null;
    clientReady = true;
    console.log("[WA] WhatsApp client is ready!");
    readyListeners.forEach((cb) => cb());
    // Optionally, trigger lead sync or other logic here
  });
  client.on("disconnected", () => {
    clientReady = false;
    clientInitialized = false;
    client = null;
    latestQRDataUrl = null;
    latestQRRaw = null;
    console.log(
      "[WA] WhatsApp client disconnected. Awaiting re-authentication."
    );
  });
  client.initialize();
}

function getLatestQRDataUrl() {
  return latestQRDataUrl;
}
function getLatestQRRaw() {
  return latestQRRaw;
}

async function sendMessage(to, message) {
  if (!clientReady || !client) {
    throw new Error("WhatsApp client not ready. Cannot send message.");
  }
  try {
    return await client.sendMessage(to, message);
  } catch (err) {
    console.error("Failed to send WhatsApp message:", err);
    throw err;
  }
}

// --- Robust WhatsApp Initial Message Sender ---
function cleanPhoneNumber(raw) {
  if (!raw) return "";
  let phone = String(raw).replace(/[^0-9]/g, "");
  if (phone.length === 10) phone = "+91" + phone;
  else if (!phone.startsWith("+") && phone.length > 10) phone = "+" + phone;
  return phone;
}
function ensurePlus(phone) {
  if (!phone.startsWith("+")) return "+" + phone;
  return phone;
}
function toWhatsAppId(phone) {
  let num = phone.replace(/[^0-9]/g, "");
  return num + "@c.us";
}
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function sendInitialMessageToLead(lead, initialMessage) {
  const waId = toWhatsAppId(ensurePlus(cleanPhoneNumber(lead.phone)));
  let sent = false,
    attempts = 0;
  while (!sent && attempts < 3) {
    try {
      await client.sendMessage(
        waId,
        initialMessage.replace("{name}", lead.name || "")
      );
      lead.initialMessageSent = true;
      await lead.save();
      // Store sent message
      const msgDoc = await Message.create({
        lead: lead._id,
        sender: "system",
        message: initialMessage.replace("{name}", lead.name || ""),
      });
      if (io) io.emit("lead-message-sent", { lead, message: msgDoc });
      sent = true;
    } catch (err) {
      attempts++;
      console.error(
        `Failed to send WhatsApp message to ${waId} (attempt ${attempts}):`,
        err.message
      );
      if (attempts >= 3 && io) io.emit("lead-message-failed", { lead });
      if (attempts < 3) await sleep(2000);
    }
  }
}

// Always initialize WhatsApp client on backend startup
initializeWhatsAppClient();

module.exports = {
  initializeWhatsAppClient,
  onQr,
  onReady,
  sendMessage,
  getLatestQRDataUrl,
  isClientReady,
  clearSession,
  setSocketIO,
  sendInitialMessageToLead,
  setBackendReady,
  isBackendReady,
  getLatestQRRaw,
};
