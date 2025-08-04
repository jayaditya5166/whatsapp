const { google } = require("googleapis");
const Lead = require("../../models/Lead");
const Settings = require("../../models/Settings");
const fs = require("fs");
const Message = require("../../models/Message");
const { sendInitialMessageToLead, isClientReady } = require("../whatsapp");
let io = null;
function setSocketIO(ioInstance) {
  io = ioInstance;
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_API_CREDENTIALS;
const SHEET_RANGE = "Sheet1!A2:F"; // Adjust as needed
const ADMIN_TEST_NUMBER = "+917870694830";

function cleanPhoneNumber(raw) {
  if (!raw) return "";
  // Remove Excel formula artifacts, spaces, and non-digit except +
  let phone = String(raw).replace(/[^+\d]/g, "");
  // If it doesn't start with +, add +
  if (!phone.startsWith("+") && phone.length > 10) phone = "+" + phone;
  return phone;
}

function ensurePlus(phone) {
  if (!phone.startsWith("+")) return "+" + phone;
  return phone;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toWhatsAppId(phone) {
  // Remove +, spaces, dashes, and append @c.us
  let num = phone.replace(/[^0-9]/g, "");
  return num + "@c.us";
}

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_email, private_key } = credentials;
  const auth = new google.auth.JWT(client_email, null, private_key, [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ]);
  await auth.authorize();
  return auth;
}

async function fetchLeadsFromSheet() {
  const auth = await authorize();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_RANGE,
  });
  return res.data.values || [];
}

async function syncLeads(whatsappReady = false) {
  const rows = await fetchLeadsFromSheet();
  // Always fetch the latest initial message from Settings (global messaging settings)
  const settings = await Settings.findOne().sort({ updatedAt: -1 });
  const initialMessage =
    settings?.initialMessage ||
    "Hi, thank you for your interest! Our team will contact you soon.";
  if (whatsappReady) {
    // Wait 5 seconds after WhatsApp is ready before sending any messages
    console.log(
      "Waiting 5 seconds after WhatsApp ready before sending messages..."
    );
    await sleep(5000);
    // Check WhatsApp client readiness before sending test message
    if (!isClientReady()) {
      console.warn(
        "WhatsApp client not ready after wait. Skipping test/admin message and lead sync."
      );
      return;
    }
    // Send test message to admin number
    const whatsappService = require("../whatsapp");
    let testSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await whatsappService.sendMessage(
          ADMIN_TEST_NUMBER,
          "[TEST] WhatsApp autoresponder is ready and can send messages."
        );
        console.log(
          `Test message sent to admin (${ADMIN_TEST_NUMBER}) successfully.`
        );
        testSuccess = true;
        break;
      } catch (err) {
        console.error(
          `Failed to send test message to admin (attempt ${attempt}):`,
          err.message
        );
        await sleep(2000);
      }
    }
    if (!testSuccess) {
      console.error(
        "Test message to admin failed after 3 attempts. Skipping bulk lead messages to avoid Evaluation failed: b error."
      );
      return;
    }
  }
  for (const row of rows) {
    const [name, phoneRaw, email, status, source, timestamp] = row;
    let phone = cleanPhoneNumber(phoneRaw);
    if (!phone) continue;
    phone = ensurePlus(phone);
    const waId = toWhatsAppId(phone);
    // Check if lead already exists
    let lead = await Lead.findOne({ phone });
    const leadData = {
      name,
      phone,
      email,
      status,
      source,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };
    if (!lead) {
      lead = new Lead({ ...leadData, initialMessageSent: false });
    } else {
      Object.assign(lead, leadData);
    }
    // If initial message not sent and WhatsApp is ready, send it
    if (!lead.initialMessageSent && whatsappReady) {
      if (!isClientReady()) {
        console.warn(
          `WhatsApp client not ready for lead ${phone}. Skipping message.`
        );
        continue;
      }
      await sendInitialMessageToLead(lead, initialMessage);
    }
    await lead.save();
    if (whatsappReady) {
      await sleep(2000); // Wait 2 seconds between each message
    }
  }
  console.log("Leads synced from Google Sheets");
}

module.exports = Object.assign(syncLeads, { setSocketIO });
