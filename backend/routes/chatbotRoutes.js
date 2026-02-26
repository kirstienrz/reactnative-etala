const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

// ============================================
// FALLBACK AI PROVIDERS CONFIGURATION
// ============================================

// OpenRouter Configuration (Free tier)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_FREE_MODELS = [
  "google/gemma-3-27b-it:free",  // Google's Gemma 3 - completely free
  "deepseek/deepseek-chat:free",  // DeepSeek free model
  "microsoft/phi-3-mini-128k-instruct:free", // Microsoft Phi-3
  "meta-llama/llama-3.2-3b-instruct:free" // Llama 3.2
];

// Hugging Face Configuration
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODELS = [
  "meta-llama/Llama-2-7b-chat-hf",
  "microsoft/DialoGPT-medium",
  "google/flan-t5-large"
];

// Pollinations.ai (No API key needed)
const POLLINATIONS_URL = "https://text.pollinations.ai/";

// ============================================
// HELPER FUNCTIONS FOR FALLBACK AIs
// ============================================

// Delay function for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// OpenRouter API Call
async function callOpenRouter(message, modelName) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ETALA GAD Chatbot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content: `You are a Philippine-focused chatbot for Gender and Development (GAD) issues. 
            Always include these emergency hotlines when relevant:
            - PNP Women & Children Protection: (02) 8532-6690 / 8535-3279
            - DSWD Hotline: 8-931-8101
            - DSWD Crisis Intervention: 1343
            - Philippine Commission on Women: (02) 8735-1654
            - CHR Hotline: 1342
            - Emergency: 911`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(`OpenRouter (${modelName}) failed:`, error.message);
    throw error;
  }
}

// Hugging Face API Call
async function callHuggingFace(message, modelName) {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelName}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    } else if (data.generated_text) {
      return data.generated_text;
    } else if (typeof data === 'string') {
      return data;
    } else {
      return JSON.stringify(data);
    }
  } catch (error) {
    console.error(`Hugging Face (${modelName}) failed:`, error.message);
    throw error;
  }
}

// Pollinations.ai API Call (No API key needed)
async function callPollinations(message) {
  try {
    // Pollinations accepts prompt as part of URL
    const encodedMessage = encodeURIComponent(message);
    const response = await fetch(`${POLLINATIONS_URL}${encodedMessage}?model=openai&system=${encodeURIComponent(
      "You are a Philippine-focused GAD chatbot. Be helpful and concise."
    )}`);

    if (!response.ok) {
      throw new Error(`Pollinations error: ${response.status}`);
    }

    const reply = await response.text();
    return reply;
  } catch (error) {
    console.error("Pollinations.ai failed:", error.message);
    throw error;
  }
}

// Main fallback handler that tries all free AIs
async function handleFreeAIFallback(message) {
  console.log("🔄 Trying fallback AIs...");

  // STEP 1: Try OpenRouter free models
  if (OPENROUTER_API_KEY) {
    for (const modelName of OPENROUTER_FREE_MODELS) {
      try {
        console.log(`📡 Trying OpenRouter: ${modelName}`);
        const reply = await callOpenRouter(message, modelName);
        return {
          reply,
          modelUsed: `openrouter-${modelName}`,
          fallbackLevel: 1
        };
      } catch (error) {
        console.log(`❌ OpenRouter ${modelName} failed, trying next...`);
        await delay(500); // Small delay between attempts
      }
    }
  }

  // STEP 2: Try Hugging Face models
  if (HF_API_KEY) {
    for (const modelName of HF_MODELS) {
      try {
        console.log(`📡 Trying Hugging Face: ${modelName}`);
        const reply = await callHuggingFace(message, modelName);
        
        // Add hotlines if not present
        if (!reply.includes("hotline") && !reply.includes("emergency")) {
          const hotlines = "\n\n📞 **Emergency Hotlines:**\n" +
            "• PNP Women & Children: (02) 8532-6690\n" +
            "• DSWD Crisis Intervention: 1343\n" +
            "• Emergency: 911";
          return {
            reply: reply + hotlines,
            modelUsed: `huggingface-${modelName}`,
            fallbackLevel: 2
          };
        }
        
        return {
          reply,
          modelUsed: `huggingface-${modelName}`,
          fallbackLevel: 2
        };
      } catch (error) {
        console.log(`❌ Hugging Face ${modelName} failed, trying next...`);
        await delay(500);
      }
    }
  }

  // STEP 3: Try Pollinations.ai (No API key needed)
  try {
    console.log("📡 Trying Pollinations.ai...");
    const reply = await callPollinations(message);
    return {
      reply,
      modelUsed: "pollinations-ai",
      fallbackLevel: 3
    };
  } catch (error) {
    console.log("❌ Pollinations.ai failed");
  }

  // If all fallbacks fail, return null
  return null;
}

// ============================================
// MAIN CHATBOT ENDPOINT
// ============================================
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const lowerMsg = message.toLowerCase();

    // 🔹 STEP 1: Hardcoded flows (Fastest, no API calls)
    console.log("🔍 Checking hardcoded flows...");
    
    // Report flow
    if (
      lowerMsg.includes("pano magreport") ||
      lowerMsg.includes("paano magreport") ||
      lowerMsg.includes("how to report")
    ) {
      return res.json({
        reply: "Can you please specify where you want to report this incident?",
        choices: ["Police", "School (TUP-Taguig)", "Barangay"],
        step: "hardcoded"
      });
    }

    // School flow
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
        step: "hardcoded"
      });
    }

    // Police flow
    if (lowerMsg.includes("police")) {
      return res.json({
        reply: "You can report directly to the nearest **police station** or call the **PNP Women and Children Protection Unit** at (02) 8532-6690 or 8535-3279 for immediate assistance.",
        step: "hardcoded"
      });
    }

    // Barangay flow
    if (lowerMsg.includes("barangay")) {
      return res.json({
        reply: "You can go to your **Barangay VAW Desk** or Barangay Hall to file your report. Barangay officials are trained to assist in cases of abuse, harassment, or violence, and may refer your case to the proper authorities if necessary.",
        step: "hardcoded"
      });
    }

    // 🔹 STEP 2: Try Gemini AI (Primary)
    console.log("🔍 Trying Gemini AI...");
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

    try {
      const result = await model.generateContent(`${instruction}\nUser: ${message}`);
      const reply = result.response.text();

      return res.json({ 
        reply, 
        modelUsed: "gemini-2.5-flash",
        step: "gemini-primary"
      });
    } catch (geminiError) {
      console.error("❌ Gemini AI failed:", geminiError.message);
      
      // 🔹 STEP 3: Try Free AI Fallbacks
      console.log("🔍 Trying free AI fallbacks...");
      const fallbackResult = await handleFreeAIFallback(message);
      
      if (fallbackResult) {
        return res.json({
          reply: fallbackResult.reply,
          modelUsed: fallbackResult.modelUsed,
          step: `fallback-level-${fallbackResult.fallbackLevel}`,
          fallback: true
        });
      }

      // 🔹 STEP 4: Ultimate Emergency Response
      console.log("🔍 Using emergency static response...");
      return res.json({
        reply: "I'm currently experiencing technical difficulties. Here are emergency contacts that can help immediately:\n\n" +
               "🚨 **EMERGENCY HOTLINES** 🚨\n" +
               "• PNP Women & Children Protection: (02) 8532-6690 / 8535-3279\n" +
               "• DSWD Crisis Intervention: 1343\n" +
               "• Emergency: 911\n\n" +
               "📧 **TUP-Taguig Support**\n" +
               "• GAD Office: gad@tup-taguig.edu.ph\n" +
               "• Guidance Office: guidance@tup-taguig.edu.ph\n\n" +
               "Please try again in a few minutes or contact the GAD Office directly.",
        modelUsed: "emergency-static",
        step: "emergency",
        fallback: true
      });
    }

  } catch (err) {
    console.error("❌ Server Error:", err);
    
    // Final safety net
    return res.status(200).json({
      reply: "We're experiencing technical issues. Please contact the GAD Office directly at gad@tup-taguig.edu.ph or call (02) 8532-6690 for assistance.",
      step: "error-fallback",
      error: true
    });
  }
});

// ============================================
// STATUS ENDPOINT (For monitoring)
// ============================================
router.get("/status", (req, res) => {
  res.json({
    status: "operational",
    primary: {
      gemini: "configured",
      model: "gemini-2.5-flash"
    },
    fallbacks: {
      openrouter: OPENROUTER_API_KEY ? "configured" : "missing",
      openrouterModels: OPENROUTER_FREE_MODELS,
      huggingface: HF_API_KEY ? "configured" : "missing",
      huggingfaceModels: HF_MODELS,
      pollinations: "available (no key needed)"
    },
    steps: ["hardcoded", "gemini-primary", "openrouter", "huggingface", "pollinations", "emergency-static"]
  });
});

module.exports = router;