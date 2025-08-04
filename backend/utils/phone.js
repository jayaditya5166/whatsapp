// backend/utils/phone.js
function cleanPhoneNumber(phone) {
  let num = String(phone).replace(/\D/g, "");
  // If 10 digits, assume Indian number and add '91'
  if (num.length === 10) {
    num = "91" + num;
  }
  // If already starts with country code (e.g., 91), leave as is
  // If too short/long, return as is (let WhatsApp handle or log error)
  return num;
}

function toWhatsAppId(phone) {
  // No plus, just digits + '@c.us'
  return cleanPhoneNumber(phone) + "@c.us";
}

module.exports = { cleanPhoneNumber, toWhatsAppId }; 