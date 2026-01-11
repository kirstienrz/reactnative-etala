// //routes/aiModeration.js
// const express = require("express");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const router = express.Router();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
// });
// // routes/aiModeration.js
// router.post("/check-report", async (req, res) => {
//   try {
//     const { incidentDescription, additionalNotes, witnessAccount } = req.body;
    
//     // 🔍 Debug: Check what's being received
//     console.log("Received data:", { incidentDescription, additionalNotes, witnessAccount });
    
//     // If no data provided
//     if (!incidentDescription && !additionalNotes && !witnessAccount) {
//       return res.status(400).json({ 
//         allowed: false, 
//         reason: "Please provide incident details." 
//       });
//     }
    
//     const combinedText = `Incident Description: ${incidentDescription || ""}\nAdditional Notes: ${additionalNotes || ""}\nWitness Account: ${witnessAccount || ""}`;
    
//     // 🔒 Basic spam filter - adjust threshold if needed
//     if (combinedText.trim().length < 10) { // Changed from 50 to 10 for testing
//       return res.status(400).json({ 
//         allowed: false, 
//         reason: "Description is too short and lacks meaningful details." 
//       });
//     }
    
//     const prompt = `You are an AI content validator for a sensitive incident reporting system. Rules:
// - Decide if the content is meaningful and serious
// - Reject spam, jokes, nonsense, or random text
// - Do NOT judge legality or truthfulness
// - Respond ONLY in valid JSON

// Response format: { "allowed": true or false, "reason": "short explanation" }

// Content: """${combinedText}"""`;
    
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
    
//     console.log("Gemini response:", text); // Debug
    
//     // Clean the response - remove markdown code blocks
//     const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    
//     let parsed;
//     try {
//       parsed = JSON.parse(cleanedText);
//     } catch (parseError) {
//       console.error("JSON Parse Error:", parseError);
//       console.error("Cleaned text:", cleanedText);
//       return res.status(400).json({ 
//         allowed: false, 
//         reason: "AI validation error. Please try again." 
//       });
//     }
    
//     if (!parsed.allowed) {
//       return res.status(400).json(parsed);
//     }
    
//     return res.json({ allowed: true });
    
//   } catch (error) {
//     console.error("Gemini Moderation Error:", error);
//     return res.status(503).json({ 
//       allowed: false, 
//       reason: "AI validation temporarily unavailable." 
//     });
//   }
// });

// module.exports = router;


// routes/aiModeration.js


const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

router.post("/check-report", async (req, res) => {
  try {
    const { 
      incidentDescription = "", 
      additionalNotes = "", 
      witnessAccount = "" 
    } = req.body;
    
    // Combine all text fields
    const combinedText = `
      Incident: ${incidentDescription}
      Notes: ${additionalNotes}
      Witness: ${witnessAccount}
    `.trim();
    
    console.log("🔍 AI Checking text:", combinedText.substring(0, 100));
    
    // ===== STEP 1: Basic Validation =====
    const mainText = incidentDescription.trim();
    
    // Reject if completely empty
    if (!mainText || mainText.length < 3) {
      console.log("❌ Rejected: Too short");
      return res.json({ 
        allowed: false, 
        reason: "Please provide a meaningful description of the incident. Your report must contain at least a basic explanation of what happened." 
      });
    }
    
    // Reject obvious spam patterns
    const spamPatterns = [
      /^(asdf)+$/i,           // "asdf", "asdfasdf"
      /^(qwerty)+$/i,         // "qwerty"
      /^(test)+$/i,           // "test", "testtest"
      /^(hello)+$/i,          // "hello"
      /^(hi)+$/i,             // "hi"
      /^[0-9]+$/,             // Only numbers "12345"
      /^[a-z]{1,4}$/i,        // Single short word like "a", "the", "ok"
      /^(.)\1{4,}/,           // Repeated character "aaaaa"
      /^[!@#$%^&*()]+$/,      // Only symbols
      /^(lol|haha|hehe)+$/i,  // Just laughter
    ];
    
    const isSpamPattern = spamPatterns.some(pattern => pattern.test(mainText));
    
    if (isSpamPattern) {
      console.log("❌ Rejected: Spam pattern detected");
      return res.json({ 
        allowed: false, 
        reason: "Your report appears to contain random or meaningless text. Please provide a genuine description of the incident you're reporting." 
      });
    }
    
    // ===== STEP 2: AI Validation (Gemini) =====
    try {
      const prompt = `You are a content moderator for a university reporting system.

Analyze this incident report and determine if it's LEGITIMATE or SPAM/MEANINGLESS.

REJECT (return "spam") if:
- Random characters (asdf, qwerty, hjkl, etc.)
- Only numbers or symbols
- Nonsensical word salad
- Test messages ("test", "testing 123")
- Less than 10 words of meaningful content
- No clear description of an actual incident

APPROVE (return "legitimate") if:
- Describes a real incident (even if brief)
- Contains names, places, dates, or specific actions
- Has coherent sentences that tell a story
- Mentions people, events, or circumstances

Report text:
"${combinedText}"

Respond with ONLY ONE WORD: either "spam" or "legitimate"`;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text().trim().toLowerCase();
      
      console.log("🤖 Gemini Response:", aiResponse);
      
      if (aiResponse.includes("spam")) {
        console.log("❌ Rejected by AI: Spam detected");
        return res.json({ 
          allowed: false, 
          reason: "Our AI system detected that your report lacks meaningful incident details. Please provide specific information about what happened, including who was involved, when it occurred, and what took place." 
        });
      }
      
      // If AI says "legitimate", approve
      console.log("✅ Approved by AI");
      return res.json({ allowed: true });
      
    } catch (aiError) {
      console.error("⚠️ AI Error:", aiError.message);
      
      // If AI fails, use stricter fallback rules
      const wordCount = mainText.split(/\s+/).length;
      
      if (wordCount < 5) {
        console.log("❌ Rejected: Too few words (fallback)");
        return res.json({ 
          allowed: false, 
          reason: "Please provide more details about the incident. A valid report should include what happened, who was involved, and when it occurred." 
        });
      }
      
      // If AI fails but text seems okay, approve with caution
      console.log("✅ Approved (AI unavailable, passed basic checks)");
      return res.json({ allowed: true });
    }
    
  } catch (error) {
    console.error("❌ Server Error:", error);
    
    // On server error, REJECT to be safe
    return res.json({ 
      allowed: false, 
      reason: "We're experiencing technical difficulties. Please try again in a moment." 
    });
  }
});

module.exports = router;