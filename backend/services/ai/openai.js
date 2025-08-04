const { OpenAI } = require("openai");
const Knowledgebase = require("../../models/Knowledgebase");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReply(userMessage, chatContext = []) {
  // Fetch latest knowledgebase
  const kb = await Knowledgebase.findOne().sort({ updatedAt: -1 });
  const systemPrompt = kb
    ? kb.content
    : "You are a helpful WhatsApp CRM assistant.";
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      ...chatContext.map((msg) => ({ role: "user", content: msg })),
      { role: "user", content: userMessage },
    ],
    max_tokens: 100,
    temperature: 0.7,
  });
  return completion.choices[0].message.content.trim();
}

async function scoreLead(leadProfile) {
  // Simple scoring based on engagement (placeholder)
  // You can use OpenAI or custom logic here
  if (leadProfile.status === "Hot") return 0.9;
  if (leadProfile.status === "Warm") return 0.6;
  if (leadProfile.status === "Cold") return 0.3;
  return 0.1;
}

module.exports = { generateReply, scoreLead };
