const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
require("dotenv").config();

// Groq API Configuration
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// IT Company Knowledge Base
const IT_COMPANY_KNOWLEDGE = {
  company: {
    name: "TechSolutions Pro",
    description:
      "Leading IT solutions provider specializing in web development, mobile apps, cloud services, and digital transformation.",
    founded: "2018",
    team_size: "50+ professionals",
    clients: "200+ satisfied clients",
  },
  services: {
    web_development: {
      name: "Web Development",
      description: "Custom websites, e-commerce platforms, web applications",
      pricing: {
        basic: "$3,000 - $8,000",
        standard: "$8,000 - $15,000",
        premium: "$15,000 - $30,000+",
      },
      timeline: "4-12 weeks",
      features: [
        "Responsive design",
        "SEO optimization",
        "CMS integration",
        "Payment gateways",
      ],
    },
    mobile_apps: {
      name: "Mobile App Development",
      description: "iOS and Android applications",
      pricing: {
        basic: "$5,000 - $12,000",
        standard: "$12,000 - $25,000",
        premium: "$25,000 - $50,000+",
      },
      timeline: "6-16 weeks",
      features: [
        "Cross-platform development",
        "App store optimization",
        "Push notifications",
        "Offline functionality",
      ],
    },
    cloud_services: {
      name: "Cloud Services",
      description: "AWS, Azure, Google Cloud solutions",
      pricing: {
        basic: "$500/month",
        standard: "$1,500/month",
        premium: "$3,000+/month",
      },
      timeline: "2-4 weeks",
      features: [
        "Server migration",
        "Scalability",
        "24/7 monitoring",
        "Backup solutions",
      ],
    },
    digital_transformation: {
      name: "Digital Transformation",
      description: "Complete business process digitization",
      pricing: {
        basic: "$20,000 - $50,000",
        standard: "$50,000 - $100,000",
        premium: "$100,000+",
      },
      timeline: "3-6 months",
      features: [
        "Process automation",
        "Legacy system integration",
        "Training programs",
        "Ongoing support",
      ],
    },
  },
  contact: {
    phone: "+1 (555) 123-4567",
    email: "info@techsolutionspro.com",
    website: "www.techsolutionspro.com",
    address: "123 Tech Street, Silicon Valley, CA 94025",
  },
};

// Lead Qualification Keywords and Stages
const LEAD_STAGES = {
  initial_contact: {
    keywords: [
      "hello",
      "hi",
      "hey",
      "interested",
      "information",
      "tell me",
      "what do you do",
    ],
    stage: "INITIAL_CONTACT",
    description: "First contact - gathering basic information",
  },
  service_inquiry: {
    keywords: [
      "website",
      "app",
      "mobile",
      "cloud",
      "development",
      "services",
      "pricing",
      "cost",
      "price",
    ],
    stage: "SERVICE_INQUIRY",
    description: "Asking about specific services and pricing",
  },
  budget_discussion: {
    keywords: [
      "budget",
      "afford",
      "expensive",
      "cheap",
      "cost-effective",
      "investment",
      "roi",
      "return",
    ],
    stage: "BUDGET_DISCUSSION",
    description: "Discussing budget and financial considerations",
  },
  timeline_inquiry: {
    keywords: [
      "when",
      "timeline",
      "deadline",
      "urgent",
      "quick",
      "fast",
      "time",
      "schedule",
    ],
    stage: "TIMELINE_INQUIRY",
    description: "Asking about project timeline and deadlines",
  },
  technical_requirements: {
    keywords: [
      "features",
      "functionality",
      "requirements",
      "specifications",
      "tech",
      "technology",
      "platform",
    ],
    stage: "TECHNICAL_REQUIREMENTS",
    description: "Discussing technical specifications and requirements",
  },
  meeting_request: {
    keywords: [
      "meet",
      "call",
      "discuss",
      "consultation",
      "demo",
      "presentation",
      "show",
      "talk",
    ],
    stage: "MEETING_REQUEST",
    description: "Requesting a meeting or consultation",
  },
  ready_to_proceed: {
    keywords: [
      "start",
      "begin",
      "proceed",
      "go ahead",
      "contract",
      "agreement",
      "sign",
      "hire",
    ],
    stage: "READY_TO_PROCEED",
    description: "Ready to start the project",
  },
  follow_up_needed: {
    keywords: [
      "think",
      "consider",
      "later",
      "maybe",
      "not sure",
      "discuss with team",
      "get back",
    ],
    stage: "FOLLOW_UP_NEEDED",
    description: "Needs follow-up - not ready to commit",
  },
};

// Lead tracking object
let leads = {};

// Function to determine lead stage based on message content
function determineLeadStage(message, phoneNumber, leadStages) {
  const lowerMessage = message.toLowerCase();
  let detectedStage = null;
  let confidence = 0;

  // Use dynamic leadStages if provided, else fallback to default
  const stagesToUse = Array.isArray(leadStages) && leadStages.length > 0 ? leadStages : Object.values(LEAD_STAGES);

  for (const stageInfo of stagesToUse) {
    const keywordMatches = (stageInfo.keywords || []).filter((keyword) =>
      lowerMessage.includes(keyword)
    );
    if (keywordMatches.length > 0) {
      const stageConfidence = keywordMatches.length / (stageInfo.keywords ? stageInfo.keywords.length : 1);
      if (stageConfidence > confidence) {
        confidence = stageConfidence;
        detectedStage = stageInfo;
      }
    }
  }

  // Update lead tracking
  if (!leads[phoneNumber]) {
    leads[phoneNumber] = {
      firstContact: new Date(),
      lastContact: new Date(),
      stages: [],
      messages: [],
    };
  }

  leads[phoneNumber].lastContact = new Date();
  leads[phoneNumber].messages.push({
    timestamp: new Date(),
    message: message,
    stage: detectedStage ? detectedStage.stage : "UNKNOWN",
  });

  if (
    detectedStage &&
    !leads[phoneNumber].stages.includes(detectedStage.stage)
  ) {
    leads[phoneNumber].stages.push(detectedStage.stage);
  }

  return detectedStage;
}

// Function to print lead status
function printLeadStatus(phoneNumber, stage, message) {
  const lead = leads[phoneNumber];
  const stageCount = lead ? lead.stages.length : 0;

  console.log("\n" + "=".repeat(60));
  console.log(`📱 LEAD UPDATE - ${phoneNumber}`);
  console.log(`📊 Current Stage: ${stage ? stage.stage : "UNKNOWN"}`);
  console.log(
    `📝 Stage Description: ${
      stage ? stage.description : "Unable to categorize"
    }`
  );
  console.log(`📈 Total Stages Visited: ${stageCount}`);
  console.log(`💬 Message: "${message}"`);

  if (lead) {
    console.log(`📅 First Contact: ${lead.firstContact.toLocaleString()}`);
    console.log(`🕒 Last Contact: ${lead.lastContact.toLocaleString()}`);
    console.log(`🔄 Stage History: ${lead.stages.join(" → ")}`);
  }
  console.log("=".repeat(60) + "\n");
}

// Initialize the WhatsApp client with LocalAuth for session persistence
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// QR Code Generation
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Scan the QR code above with your WhatsApp mobile app.");
});

// --- BEGIN: Minimal WhatsApp Excel Lead Sender Logic ---

// Hardcoded config for Google Sheets
const SHEET_ID = "1_NgLV7pYWU8T4ZkzEX0YxuWhCCxBiJ3kR2-nnWJHFUo";
const CREDENTIALS_PATH =
  "L:/software/whatsappautoresponder - TEST/backend/google-credentials.json";
const SHEET_RANGE = "Sheet1!A2:F";
const DELAY = 3000;
const STATUS_FILE = path.join(__dirname, "sent_status_index.json");
const MESSAGE_TEMPLATE =
  "Hi {name}, Thanks For Filling the form. We Will contact you soon.";

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
async function authorizeSheet() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_email, private_key } = credentials;
  const auth = new google.auth.JWT(client_email, null, private_key, [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ]);
  await auth.authorize();
  return auth;
}
async function fetchLeadsFromSheet() {
  const auth = await authorizeSheet();
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_RANGE,
  });
  return res.data.values || [];
}

// On WhatsApp ready, send messages to leads from Google Sheets
client.on("ready", async () => {
  console.log("WhatsApp client is ready! (Excel Lead Sender Section)");
  // Load sent status
  let sentStatus = {};
  if (fs.existsSync(STATUS_FILE)) {
    sentStatus = JSON.parse(fs.readFileSync(STATUS_FILE));
  }
  // Fetch leads
  const rows = await fetchLeadsFromSheet();
  let sentCount = 0;
  for (const row of rows) {
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
});
// --- END: Minimal WhatsApp Excel Lead Sender Logic ---

// Message Handling
const Settings = require("./models/Settings");
const Lead = require("./models/Lead");
client.on("message", async (msg) => {
  // Ignore status updates and group messages if needed
  if (msg.isStatus || msg.isGroupMsg) return;

  console.log(`Message received from ${msg.from}: ${msg.body}`);

  // Fetch tenant-specific leadStages from settings (fallback to default if not found)
  let leadStages = [];
  try {
    // You may need to determine tenantId from msg.from or another mapping
    // For now, fetch the latest settings (single-tenant fallback)
    const settings = await Settings.findOne().sort({ updatedAt: -1 });
    if (settings && Array.isArray(settings.leadStages)) {
      leadStages = settings.leadStages;
    }
  } catch (e) {
    console.error("Error fetching settings for lead stage detection:", e.message);
  }
  // Determine lead stage
  const leadStage = determineLeadStage(msg.body, msg.from, leadStages);
  printLeadStatus(msg.from, leadStage, msg.body);

  // Update the detectedStage for the corresponding lead in the database
  try {
    // Try to find the lead by phone (msg.from)
    const lead = await Lead.findOne({ phone: msg.from });
    if (lead && leadStage && leadStage.stage) {
      lead.detectedStage = leadStage.stage;
      await lead.save();
    }
  } catch (err) {
    console.error("Error updating detectedStage for lead:", err.message);
  }

  try {
    // Check if the message contains media (image or PDF)
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();

      // Determine file type and save it accordingly
      let filePath = `./downloads/${msg.from}-${Date.now()}`;
      if (media.mimetype.startsWith("image/")) {
        filePath += ".jpg"; // or .png based on the media type
      } else if (media.mimetype === "application/pdf") {
        filePath += ".pdf";
      }

      // Save media to disk
      fs.writeFileSync(filePath, media.data, "base64");
      console.log(`Media saved as ${filePath}`);

      // Reply with a confirmation
      await msg.reply("I received your image/PDF. Thank you!");
    } else {
      // Create context-aware system prompt based on lead stage
      let systemPrompt = `You are a helpful WhatsApp assistant for TechSolutions Pro, a leading IT company. Keep responses concise and friendly.`;

      if (leadStage) {
        systemPrompt += `\n\nCurrent lead stage: ${leadStage.stage} - ${leadStage.description}`;

        // Add stage-specific guidance
        switch (leadStage.stage) {
          case "INITIAL_CONTACT":
            systemPrompt += `\n\nProvide a warm welcome and brief company overview. Mention our key services: web development, mobile apps, cloud services, and digital transformation.`;
            break;
          case "SERVICE_INQUIRY":
            systemPrompt += `\n\nProvide detailed information about our services and pricing. Be specific about what we offer and our value proposition.`;
            break;
          case "BUDGET_DISCUSSION":
            systemPrompt += `\n\nDiscuss pricing options and ROI. Emphasize value and quality. Offer flexible payment plans if applicable.`;
            break;
          case "TIMELINE_INQUIRY":
            systemPrompt += `\n\nProvide realistic timelines and explain our development process. Mention our quick turnaround capabilities.`;
            break;
          case "TECHNICAL_REQUIREMENTS":
            systemPrompt += `\n\nAsk clarifying questions about their technical needs. Show expertise and understanding of their requirements.`;
            break;
          case "MEETING_REQUEST":
            systemPrompt += `\n\nEncourage scheduling a consultation. Provide contact information and suggest meeting times.`;
            break;
          case "READY_TO_PROCEED":
            systemPrompt += `\n\nGuide them through next steps. Mention contract process, project initiation, and timeline.`;
            break;
          case "FOLLOW_UP_NEEDED":
            systemPrompt += `\n\nBe understanding and offer to follow up later. Provide additional resources and maintain relationship.`;
            break;
        }
      }

      // Add company knowledge base to the prompt
      systemPrompt += `\n\nCompany Information:
- Name: ${IT_COMPANY_KNOWLEDGE.company.name}
- Description: ${IT_COMPANY_KNOWLEDGE.company.description}
- Founded: ${IT_COMPANY_KNOWLEDGE.company.founded}
- Team: ${IT_COMPANY_KNOWLEDGE.company.team_size}
- Clients: ${IT_COMPANY_KNOWLEDGE.company.clients}

Services and Pricing:
${Object.entries(IT_COMPANY_KNOWLEDGE.services)
  .map(
    ([key, service]) =>
      `- ${service.name}: ${service.description}
  Pricing: ${Object.values(service.pricing).join(", ")}
  Timeline: ${service.timeline}`
  )
  .join("\n")}

Contact Information:
- Phone: ${IT_COMPANY_KNOWLEDGE.contact.phone}
- Email: ${IT_COMPANY_KNOWLEDGE.contact.email}
- Website: ${IT_COMPANY_KNOWLEDGE.contact.website}`;

      // Send the user's message to Groq
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama3-70b-8192", // You can change this to other available models
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: msg.body,
            },
          ],
          max_tokens: 200, // Increased for more detailed responses
          temperature: 0.7, // Adjust creativity
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract and send Groq's response
      const reply = response.data.choices[0].message.content.trim();

      // Send the AI-generated reply back to the user
      await msg.reply(reply);

      console.log(`Replied to ${msg.from}: ${reply}`);
    }
  } catch (error) {
    console.error(
      "Error processing message:",
      error.response?.data || error.message
    );

    // Send a fallback message
    await msg.reply(
      "Sorry, I am having trouble processing your request right now. Please contact us at " +
        IT_COMPANY_KNOWLEDGE.contact.phone +
        " for immediate assistance."
    );
  }
});

// Error Handling
client.on("auth_failure", (msg) => {
  console.error("Authentication failed", msg);
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected", reason);
});

// Initialize the client
client.initialize();
