const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

// Initialize Gemini (same as your chatbot)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

// ========== SPAM CHECK - AI LANG ==========
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
    
    // Basic validation lang - para di ma-empty
    const mainText = incidentDescription.trim();
    if (!mainText || mainText.length < 2) {
      return res.json({ 
        allowed: false, 
        reason: "Please provide a description of the incident. / Mangyaring magbigay ng paglalarawan ng insidente." 
      });
    }
    
    // ===== GEMINI LANG - parang chatbot =====
    try {
      const prompt = `You are a content moderator for a university reporting system. You understand BOTH English and Filipino/Tagalog.

Analyze this incident report and determine if it's LEGITIMATE or SPAM.

Report text (could be English, Filipino, or Taglish):
"${combinedText}"

Think like this:
- LEGITIMATE: May sense ang sinasabi, naglalarawan ng totoong insidente, may details (sino, saan, kailan, ano nangyari)
- SPAM: Walang kwenta, random letters, test lang, paulit-ulit, walang meaning

Important: Kahit maikli pero may sense, legitimate yun. Example: "May nambubully sa room 201" - kahit maikli, legitimate yan.

Respond with ONLY ONE WORD: either "spam" or "legitimate"`;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text().trim().toLowerCase();
      
      console.log("🤖 Gemini Response:", aiResponse);
      
      if (aiResponse.includes("spam")) {
        return res.json({ 
          allowed: false, 
          reason: "Your report appears to be spam or lacking meaningful details. Please describe what happened. / Mukhang spam o kulang sa detalye ang iyong report. Pakilarawan po ang nangyari."
        });
      }
      
      return res.json({ allowed: true });
      
    } catch (aiError) {
      console.error("⚠️ AI Error:", aiError.message);
      
      // Pag nag-fail si Gemini, safety net lang
      const wordCount = mainText.split(/\s+/).length;
      if (wordCount < 3) {
        return res.json({ 
          allowed: false, 
          reason: "Please provide more details about the incident." 
        });
      }
      
      return res.json({ allowed: true });
    }
    
  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.json({ 
      allowed: false, 
      reason: "Technical issue. Please try again." 
    });
  }
});

// ========== SEVERITY ANALYSIS - PARANG CHATBOT ==========
router.post("/analyze-severity", async (req, res) => {
  try {
    const { 
      incidentDescription = "", 
      reportId = "unknown"
    } = req.body;
    
    console.log(`🔍 Analyzing report: ${reportId}`);
    
    if (!incidentDescription || incidentDescription.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Valid incident description is required"
      });
    }
    
    // ===== GEMINI LANG - parang chatbot =====
    const analysis = await analyzeWithGemini(incidentDescription);
    
    analysis.analyzedAt = new Date().toISOString();
    analysis.analysisId = `ai_${Date.now()}`;
    
    console.log(`✅ Analysis Complete: ${analysis.severity}`);
    
    return res.json({
      success: true,
      data: analysis,
      reportId: reportId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    // Last resort - Gemini ulit pero simpler prompt
    try {
      const fallbackAnalysis = await simpleGeminiAnalysis(req.body.incidentDescription || '');
      return res.json({
        success: true,
        data: fallbackAnalysis,
        isFallback: true,
        reportId: req.body.reportId || "unknown"
      });
    } catch (finalError) {
      return res.status(503).json({
        success: false,
        message: "AI service unavailable. Please try again later."
      });
    }
  }
});

async function analyzeWithGemini(description) {
  const prompt = `You are an AI analyzing incident reports for a university. You understand BOTH English and Filipino/Tagalog.

REPORT: "${description}"

Analyze this report and determine:

1. SEVERITY (choose one):
   - SEVERE: 
     * Physical violence or threats of violence
     * Sexual assault or harassment
     * Weapons involved
     * Self-harm or suicide risk
     * Medical emergency
   
   - MODERATE: 
     * REPEATED/ONGOING harassment or bullying (paulit-ulit, hindi one-time)
     * Discrimination with clear impact
     * Theft or significant property damage
     * Patterns of intimidation
   
   - MILD: 
     * One-time teasing or minor conflict (minsan lang)
     * Complaints without clear harm
     * Administrative concerns
     * Interpersonal disagreements
     * Annoyance without threat or pattern

2. CONFIDENCE: number between 0-1 (how sure are you)

IMPORTANT RULES:
- If report is vague or lacks details (walang specific incidents), use MILD + lower confidence
- If "nangaasar" or "teasing" without violence/threat, default to MILD unless REPEATED
- ONE-TIME incidents without harm = MILD
- REPEATED + DISTRESS = MODERATE
- PHYSICAL/THREAT = SEVERE

3. EXPLANATION: 1-2 sentences explaining why, in the SAME LANGUAGE as the report

4. RISK FACTORS: 2-3 specific risks (in same language as report)

5. ACTIONS: 2-3 specific things to do (in same language as report)

6. RESPONSE TIME: "Immediate", "Within 24 hours", "Within 3-7 days", or "Within 7-14 days"

Return as JSON only, no other text. Format:
{
  "severity": "SEVERE/MODERATE/MILD",
  "confidence": 0.95,
  "explanation": "text here",
  "riskFactors": ["risk1", "risk2"],
  "suggestedActions": ["action1", "action2"],
  "recommendedResponseTime": "text here",
  "priorityScore": 85
}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Extract JSON
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid response format");
  }
  
  const analysis = JSON.parse(jsonMatch[0]);
  
  // Ensure priority score exists
  if (!analysis.priorityScore) {
    const priorityMap = {
      'SEVERE': 90,
      'MODERATE': 70,
      'MILD': 50
    };
    analysis.priorityScore = priorityMap[analysis.severity] || 70;
  }
  
  analysis.modelUsed = "gemini-2.5-flash";
  analysis.method = "chatbot-style";
  
  return analysis;
}

// ===== SIMPLE FALLBACK - Gemini parin =====
async function simpleGeminiAnalysis(description) {
  const prompt = `Analyze this incident report and tell me the severity (SEVERE/MODERATE/MILD) and why.

Report: "${description}"

Respond in this format:
Severity: [SEVERE/MODERATE/MILD]
Reason: [1 sentence explanation]
Actions: [2 quick actions]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Simple parsing
  const severity = text.includes("SEVERE") ? "SEVERE" : 
                   text.includes("MODERATE") ? "MODERATE" : "MILD";
  
  return {
    severity: severity,
    confidence: 0.7,
    explanation: text.split('\n')[1]?.replace('Reason:', '').trim() || "Analysis completed",
    riskFactors: ["Manual review recommended"],
    suggestedActions: ["Review report", "Follow standard procedure"],
    recommendedResponseTime: severity === 'SEVERE' ? 'Within 24 hours' : 'Within 3-7 days',
    priorityScore: severity === 'SEVERE' ? 85 : severity === 'MODERATE' ? 70 : 55,
    modelUsed: "gemini-2.5-flash-fallback",
    isFallback: true
  };
}

module.exports = router;