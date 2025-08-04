const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { startWhatsApp } = require("./services/whatsapp");
const { router: whatsappRouter } = require("./routes/whatsapp");


const app = express();

app.use(cors());
app.use(express.json());

// Start WhatsApp automation
// startWhatsApp();

// Placeholder routes
app.use("/api/leads", require("./routes/leads"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/reminders", require("./routes/reminders"));
app.use("/api/knowledgebase", require("./routes/knowledgebase"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/whatsapp", whatsappRouter);


app.get("/", (req, res) => {
  res.send("WhatsApp CRM API Running");
});

module.exports = app;
