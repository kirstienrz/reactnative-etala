// const express = require("express");
// const router = express.Router();
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // ✅ Gamitin yung exact model name mula sa /v1/models response mo
// const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

// router.post("/", async (req, res) => {
//   try {
//     const { message } = req.body;
//     if (!message) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     const instruction = `
//       You are a Philippine-focused chatbot.
//       Answer ONLY based on Philippine context, especially Gender and Development (GAD),
//       local laws, and hotlines for harassment, abuse, and domestic violence.

//       Always include these emergency hotlines:
//       - PNP Women & Children Protection: (02) 8532-6690 / 8535-3279
//       - DSWD Hotline: 8-931-8101
//       - DSWD Crisis Intervention: 1343
//       - Philippine Commission on Women: (02) 8735-1654
//       - CHR Hotline: 1342
//       - Emergency: 911
//     `;

//     const result = await model.generateContent(`${instruction}\nUser: ${message}`);
//     const reply = result.response.text().replace(/\*\*/g, "");

//     res.json({ reply });
//   } catch (err) {
//     console.error("Gemini API Error:", err);
//     res.status(500).json({ error: "Failed to fetch response from Gemini" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const lowerMsg = message.toLowerCase();

    // 🔹 Case 1: User asks "pano magreport?"
    if (
      lowerMsg.includes("pano magreport") ||
      lowerMsg.includes("paano magreport") ||
      lowerMsg.includes("how to report")
    ) {
      return res.json({
        reply: "Can you please specify where you want to report this incident?",
        choices: ["Police", "School (TUP-Taguig)", "Barangay"],
      });
    }

    // 🔹 Case 2: User chooses "School (TUP-Taguig)"
    if (lowerMsg.includes("school") || lowerMsg.includes("tup")) {
      return res.json({
        reply: `We appreciate your courage in reaching out. 
We are ready to assist you, and please know that you may also report anonymously.

To proceed reporting an incident at **TUP-Taguig**, please follow these steps:
1. **Log in** to your account using your **Student Number** (e.g., TUPT-XX-XXXX).  
2. Use your **official email** following this format: yourfullname@etala.com  
   - Example: Juan Dela Cruz → juandelacruz@etala.com  
3. From the **Home Page**, click **"Report Now"** and fill out the incident form completely.

Your report will be treated with **confidentiality** and handled by the **TUP-Taguig Gender and Development (GAD) Office**.`,
      });
    }

    // 🔹 Case 3: User chooses "Police"
    if (lowerMsg.includes("police")) {
      return res.json({
        reply:
          "You can report directly to the nearest **police station** or call the **PNP Women and Children Protection Unit** at (02) 8532-6690 or 8535-3279 for immediate assistance.",
      });
    }

    // 🔹 Case 4: User chooses "Barangay"
    if (lowerMsg.includes("barangay")) {
      return res.json({
        reply:
          "You can go to your **Barangay VAW Desk** or Barangay Hall to file your report. Barangay officials are trained to assist in cases of abuse, harassment, or violence, and may refer your case to the proper authorities if necessary.",
      });
    }

    // 🔹 Case 5: Default — send to Gemini
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
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Failed to fetch response from Gemini" });
  }
});

module.exports = router;
