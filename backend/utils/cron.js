const cron = require("node-cron");
const syncLeads = require("../services/googleSheets/syncLeads");
const { isClientReady } = require("../services/whatsapp");

function startCronJobs() {
  // Every 1 minute
  cron.schedule("*/1 * * * *", async () => {
    try {
      console.log("[CRON] Syncing leads from Google Sheets...");
      if (isClientReady()) {
        await syncLeads(true);
      } else {
        console.log("WhatsApp not ready, skipping lead sync");
      }
    } catch (err) {
      console.error("Google Sheets sync error:", err);
    }
  });
}

module.exports = startCronJobs;
