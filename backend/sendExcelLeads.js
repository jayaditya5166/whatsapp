// sendExcelLeads.js
// USAGE: node backend/sendExcelLeads.js
// - Scan QR code if prompted
// - The script will fetch leads from Google Sheets and send a WhatsApp message to each
// - Status is logged to the console and to sent_status.json

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// --- CONFIG ---
// Hardcoded for user convenience
const SHEET_ID = "1_NgLV7pYWU8T4ZkzEX0YxuWhCCxBiJ3kR2-nnWJHFUo";
const CREDENTIALS_PATH =
  "L:/software/whatsappautoresponder - TEST/backend/google-credentials.json";
const SHEET_RANGE = "Sheet1!A2:F"; // Adjust as needed
const DELAY = 3000; // ms between messages
const STATUS_FILE = path.join(__dirname, "sent_status.json");
const MESSAGE_TEMPLATE =
  "Hi {name}, Thanks For Filling the form. We Will contact you soon.";

// --- Google Sheets Fetch ---
function cleanPhoneNumber(raw) {
  if (!raw) return "";
  let phone = String(raw).replace(/[^0-9]/g, "");
  // If 10 digits, assume Indian number and add +91
  if (phone.length === 10) phone = "+91" + phone;
  else if (!phone.startsWith("+") && phone.length > 10) phone = "+" + phone;
  return phone;
}
function ensurePlus(phone) {
  if (!phone.startsWith("+")) return "+" + phone;
  return phone;
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

// --- WhatsApp Client ---
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "excel-leads" }),
  puppeteer: {
    headless: true, // Always run in background, no browser window
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Scan the QR code above with your WhatsApp mobile app.");
});

client.on("ready", async () => {
  console.log("WhatsApp client is ready!");
  // Load sent status
  let sentStatus = {};
  if (fs.existsSync(STATUS_FILE)) {
    sentStatus = JSON.parse(fs.readFileSync(STATUS_FILE));
  }
  // Fetch leads
  const rows = await fetchLeadsFromSheet();
  let sentCount = 0;
  for (const row of rows) {
    // Expect: [name, phone, email, ...]
    const [name, phoneRaw] = row;
    let phone = cleanPhoneNumber(phoneRaw);
    if (!phone) continue;
    phone = ensurePlus(phone);
    const waId = toWhatsAppId(phone);
    if (sentStatus[waId]) {
      console.log(`Already sent to ${waId}, skipping.`);
      continue;
    }
    const message = MESSAGE_TEMPLATE.replace("{name}", name || "");
    try {
      await client.sendMessage(waId, message);
      sentStatus[waId] = {
        name,
        phone,
        status: "sent",
        timestamp: new Date().toISOString(),
      };
      sentCount++;
      console.log(`Message sent to ${waId}`);
      fs.writeFileSync(STATUS_FILE, JSON.stringify(sentStatus, null, 2));
    } catch (err) {
      sentStatus[waId] = {
        name,
        phone,
        status: "failed",
        error: err.message,
        timestamp: new Date().toISOString(),
      };
      console.error(`Failed to send to ${waId}:`, err.message);
      fs.writeFileSync(STATUS_FILE, JSON.stringify(sentStatus, null, 2));
    }
    await new Promise((res) => setTimeout(res, DELAY));
  }
  console.log(`\nDone. Total sent: ${sentCount} / ${rows.length}`);
  process.exit(0);
});

client.initialize();
