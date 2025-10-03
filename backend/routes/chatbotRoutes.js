const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Gamitin yung exact model name mula sa /v1/models response mo
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const instruction = `
      You are a Philippine-focused chatbot.
      Answer ONLY based on Philippine context, especially Gender and Development (GAD),
      local laws, and hotlines for harassment, abuse, and domestic violence.

      Always include these emergency hotlines:
      - PNP Women & Children Protection: (02) 8532-6690 / 8535-3279
      - DSWD Hotline: 8-931-8101
      - DSWD Crisis Intervention: 1343
      - Philippine Commission on Women: (02) 8735-1654
      - CHR Hotline: 1342
      - Emergency: 911
    `;

    const result = await model.generateContent(`${instruction}\nUser: ${message}`);
    const reply = result.response.text().replace(/\*\*/g, "");

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Failed to fetch response from Gemini" });
  }
});

module.exports = router;
