


// const express = require("express");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const router = express.Router();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// router.post("/check-report", async (req, res) => {
//   try {
//     const { 
//       incidentDescription = "", 
//       additionalNotes = "", 
//       witnessAccount = "" 
//     } = req.body;
    
//     // Combine all text fields
//     const combinedText = `
//       Incident: ${incidentDescription}
//       Notes: ${additionalNotes}
//       Witness: ${witnessAccount}
//     `.trim();
    
//     console.log("🔍 AI Checking text:", combinedText.substring(0, 100));
    
//     // ===== STEP 1: Basic Validation =====
//     const mainText = incidentDescription.trim();
    
//     // Reject if completely empty
//     if (!mainText || mainText.length < 3) {
//       console.log("❌ Rejected: Too short");
//       return res.json({ 
//         allowed: false, 
//         reason: "Please provide a meaningful description of the incident. Your report must contain at least a basic explanation of what happened." 
//       });
//     }
    
//     // Reject obvious spam patterns
//     const spamPatterns = [
//       /^(asdf)+$/i,           // "asdf", "asdfasdf"
//       /^(qwerty)+$/i,         // "qwerty"
//       /^(test)+$/i,           // "test", "testtest"
//       /^(hello)+$/i,          // "hello"
//       /^(hi)+$/i,             // "hi"
//       /^[0-9]+$/,             // Only numbers "12345"
//       /^[a-z]{1,4}$/i,        // Single short word like "a", "the", "ok"
//       /^(.)\1{4,}/,           // Repeated character "aaaaa"
//       /^[!@#$%^&*()]+$/,      // Only symbols
//       /^(lol|haha|hehe)+$/i,  // Just laughter
//     ];
    
//     const isSpamPattern = spamPatterns.some(pattern => pattern.test(mainText));
    
//     if (isSpamPattern) {
//       console.log("❌ Rejected: Spam pattern detected");
//       return res.json({ 
//         allowed: false, 
//         reason: "Your report appears to contain random or meaningless text. Please provide a genuine description of the incident you're reporting." 
//       });
//     }
    
//     // ===== STEP 2: AI Validation (Gemini) =====
//     try {
//       const prompt = `You are a content moderator for a university reporting system.

// Analyze this incident report and determine if it's LEGITIMATE or SPAM/MEANINGLESS.

// REJECT (return "spam") if:
// - Random characters (asdf, qwerty, hjkl, etc.)
// - Only numbers or symbols
// - Nonsensical word salad
// - Test messages ("test", "testing 123")
// - Less than 10 words of meaningful content
// - No clear description of an actual incident

// APPROVE (return "legitimate") if:
// - Describes a real incident (even if brief)
// - Contains names, places, dates, or specific actions
// - Has coherent sentences that tell a story
// - Mentions people, events, or circumstances

// Report text:
// "${combinedText}"

// Respond with ONLY ONE WORD: either "spam" or "legitimate"`;

//       const result = await model.generateContent(prompt);
//       const aiResponse = result.response.text().trim().toLowerCase();
      
//       console.log("🤖 Gemini Response:", aiResponse);
      
//       if (aiResponse.includes("spam")) {
//         console.log("❌ Rejected by AI: Spam detected");
//         return res.json({ 
//           allowed: false, 
//           reason: "Our AI system detected that your report lacks meaningful incident details. Please provide specific information about what happened, including who was involved, when it occurred, and what took place." 
//         });
//       }
      
//       // If AI says "legitimate", approve
//       console.log("✅ Approved by AI");
//       return res.json({ allowed: true });
      
//     } catch (aiError) {
//       console.error("⚠️ AI Error:", aiError.message);
      
//       // If AI fails, use stricter fallback rules
//       const wordCount = mainText.split(/\s+/).length;
      
//       if (wordCount < 5) {
//         console.log("❌ Rejected: Too few words (fallback)");
//         return res.json({ 
//           allowed: false, 
//           reason: "Please provide more details about the incident. A valid report should include what happened, who was involved, and when it occurred." 
//         });
//       }
      
//       // If AI fails but text seems okay, approve with caution
//       console.log("✅ Approved (AI unavailable, passed basic checks)");
//       return res.json({ allowed: true });
//     }
    
//   } catch (error) {
//     console.error("❌ Server Error:", error);
    
//     // On server error, REJECT to be safe
//     return res.json({ 
//       allowed: false, 
//       reason: "We're experiencing technical difficulties. Please try again in a moment." 
//     });
//   }
// });


// module.exports = router;


const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Original spam check endpoint
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

// NEW ENDPOINT: AI Severity Analysis
router.post("/analyze-severity", async (req, res) => {
  try {
    const { 
      incidentDescription = "", 
      incidentTypes = [], 
      reportId = "unknown",
      additionalContext = {} 
    } = req.body;
    
    console.log(`🔍 AI Severity Analysis for report: ${reportId}`);
    
    // Validate input
    if (!incidentDescription || incidentDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Valid incident description (minimum 10 characters) is required for severity analysis"
      });
    }
    
    // Clean and prepare the description
    const cleanDescription = incidentDescription.trim().substring(0, 2000); // Limit length
    
    // Prepare the AI prompt for severity analysis
    const prompt = `You are an expert incident severity analyzer for a university reporting system.

TASK: Analyze the incident report below and determine its severity level.

INCIDENT TYPES: ${incidentTypes?.join(', ') || 'Not specified'}

INCIDENT DESCRIPTION:
"${cleanDescription}"

ADDITIONAL CONTEXT:
- Time: ${additionalContext.timestamp || 'Unknown'}
- Location: ${additionalContext.location || 'Not specified'}
- People Involved: ${additionalContext.peopleInvolved || 'Not specified'}

SEVERITY CLASSIFICATION GUIDELINES:

SEVERE (Priority: IMMEDIATE - 24 hours):
- Physical violence or assault
- Sexual harassment or assault
- Life-threatening situations
- Weapons involvement
- Severe bullying leading to self-harm risk
- Threats to life or serious bodily harm
- Hate crimes or severe discrimination
- Severe mental health crises (suicidal thoughts, self-harm)
- Fire or serious safety hazards
- Kidnapping or abduction
- Severe emotional/psychological trauma

MODERATE (Priority: URGENT - 3-7 days):
- Verbal harassment or intimidation
- Stalking or unwanted following
- Moderate bullying or cyberbullying
- Property damage/theft
- Discrimination based on protected characteristics
- Moderate mental health concerns (anxiety, depression)
- Academic dishonesty (cheating, plagiarism)
- Non-physical threats
- Moderate safety concerns
- Relationship conflicts
- Minor substance abuse issues

MILD (Priority: STANDARD - 7-14 days):
- Minor disagreements or conflicts
- Noise complaints
- Minor policy violations
- Administrative issues
- Minor disrespectful behavior
- Cleanliness or minor maintenance issues
- Low-level stress or concerns
- General inquiries or information requests
- Minor academic concerns
- Small property issues

ANALYSIS FACTORS to consider:
1. Potential for harm or escalation
2. Impact on victim's well-being
3. Frequency/pattern of behavior
4. Power dynamics involved
5. Urgency of intervention needed
6. Legal or policy violations
7. Impact on campus safety
8. Emotional/psychological impact

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "severity": "SEVERE|MODERATE|MILD",
  "confidence": 0.95,
  "explanation": "Clear, professional explanation in 2-3 sentences",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "riskFactors": ["factor1", "factor2", "factor3"],
  "recommendedResponseTime": "24 hours|3-7 days|7-14 days",
  "priorityScore": 95,
  "suggestedActions": ["action1", "action2"]
}

RULES:
1. Confidence score must be between 0.5 and 1.0
2. Provide exactly 5 keywords that capture main themes
3. Provide exactly 3 risk factors
4. Priority score: 90-100 for SEVERE, 70-89 for MODERATE, 50-69 for MILD
5. Provide 2-3 suggested actions based on severity
6. Be objective, professional, and evidence-based
7. When in doubt, err on the side of caution (higher severity)
8. Consider university context and student welfare

Return ONLY the JSON object, no additional text or explanations.`;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiText = response.text().trim();
    
    console.log("🤖 Gemini Severity Analysis Raw Response:", aiText.substring(0, 200));
    
    // Clean and parse the AI response
    aiText = aiText.replace(/```json\s*|\s*```/g, '').trim();
    
    // Try to extract JSON if not properly formatted
    let jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiText = jsonMatch[0];
    }
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(aiText);
    } catch (parseError) {
      console.error("❌ Failed to parse AI JSON:", parseError.message);
      console.log("Raw text that failed:", aiText);
      throw new Error("AI returned invalid JSON format");
    }
    
    // Validate and normalize the analysis
    const validSeverities = ['SEVERE', 'MODERATE', 'MILD'];
    const severity = analysis.severity?.toUpperCase();
    
    if (!validSeverities.includes(severity)) {
      throw new Error(`Invalid severity level: ${analysis.severity}`);
    }
    
    // Normalize data
    analysis.severity = severity;
    analysis.confidence = Math.min(Math.max(analysis.confidence || 0.8, 0.5), 1.0);
    analysis.priorityScore = Math.min(Math.max(analysis.priorityScore || 70, 50), 100);
    
    // Set default response time if missing
    if (!analysis.recommendedResponseTime) {
      switch(severity) {
        case 'SEVERE':
          analysis.recommendedResponseTime = '24 hours';
          break;
        case 'MODERATE':
          analysis.recommendedResponseTime = '3-7 days';
          break;
        case 'MILD':
          analysis.recommendedResponseTime = '7-14 days';
          break;
      }
    }
    
    // Add metadata
    analysis.analyzedAt = new Date().toISOString();
    analysis.analysisId = `sev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    analysis.modelUsed = "gemini-2.0-flash-exp";
    
    // Add statistics
    analysis.statistics = {
      descriptionLength: cleanDescription.length,
      wordCount: cleanDescription.split(/\s+/).length,
      hasIncidentTypes: !!incidentTypes?.length,
      incidentTypeCount: incidentTypes?.length || 0,
      analysisTime: new Date().toISOString()
    };
    
    console.log(`✅ Severity Analysis Complete: ${analysis.severity} (${analysis.confidence * 100}% confidence)`);
    
    // Return successful response
    return res.json({
      success: true,
      message: "Severity analysis completed successfully",
      data: analysis,
      reportId: reportId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Severity Analysis Error:", error.message);
    
    // Generate fallback analysis
    const fallbackAnalysis = generateFallbackSeverityAnalysis(req.body);
    
    return res.json({
      success: true,
      message: "Severity analysis completed with fallback method",
      data: fallbackAnalysis,
      isFallback: true,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      reportId: req.body.reportId || "unknown",
      timestamp: new Date().toISOString()
    });
  }
});

// Fallback severity analysis function
function generateFallbackSeverityAnalysis(data) {
  const { 
    incidentDescription = '', 
    incidentTypes = [], 
    additionalContext = {} 
  } = data;
  
  const description = (incidentDescription || '').toLowerCase();
  const words = description.split(/\s+/);
  
  // Define keyword categories with weights
  const severeKeywords = [
    { word: 'emergency', weight: 1.0 },
    { word: 'urgent', weight: 0.9 },
    { word: 'violence', weight: 1.0 },
    { word: 'assault', weight: 1.0 },
    { word: 'attack', weight: 1.0 },
    { word: 'weapon', weight: 1.0 },
    { word: 'gun', weight: 1.0 },
    { word: 'knife', weight: 0.9 },
    { word: 'kill', weight: 1.0 },
    { word: 'death', weight: 1.0 },
    { word: 'die', weight: 1.0 },
    { word: 'suicide', weight: 1.0 },
    { word: 'self-harm', weight: 1.0 },
    { word: 'sexual', weight: 1.0 },
    { word: 'rape', weight: 1.0 },
    { word: 'molest', weight: 1.0 },
    { word: 'abuse', weight: 0.9 },
    { word: 'threat', weight: 0.8 },
    { word: 'danger', weight: 0.8 },
    { word: 'hospital', weight: 0.7 },
    { word: 'ambulance', weight: 0.7 },
    { word: 'police', weight: 0.7 },
    { word: 'fire', weight: 0.8 },
    { word: 'blood', weight: 0.8 },
    { word: 'injured', weight: 0.8 },
    { word: 'bleeding', weight: 0.8 },
    { word: 'unconscious', weight: 0.9 }
  ];

  const moderateKeywords = [
    { word: 'harass', weight: 0.8 },
    { word: 'stalk', weight: 0.8 },
    { word: 'bully', weight: 0.7 },
    { word: 'threaten', weight: 0.7 },
    { word: 'fear', weight: 0.6 },
    { word: 'scared', weight: 0.6 },
    { word: 'anxiety', weight: 0.7 },
    { word: 'depress', weight: 0.7 },
    { word: 'stress', weight: 0.6 },
    { word: 'cry', weight: 0.5 },
    { word: 'sad', weight: 0.5 },
    { word: 'angry', weight: 0.5 },
    { word: 'fight', weight: 0.7 },
    { word: 'argument', weight: 0.5 },
    { word: 'conflict', weight: 0.6 },
    { word: 'cheat', weight: 0.6 },
    { word: 'plagiar', weight: 0.6 },
    { word: 'steal', weight: 0.7 },
    { word: 'theft', weight: 0.7 },
    { word: 'damage', weight: 0.6 },
    { word: 'vandal', weight: 0.6 },
    { word: 'discriminat', weight: 0.8 },
    { word: 'racist', weight: 0.8 },
    { word: 'prejudice', weight: 0.7 }
  ];

  // Calculate severity score
  let severityScore = 0;
  let keywordMatches = [];
  
  // Check for severe keywords
  severeKeywords.forEach(({ word, weight }) => {
    if (description.includes(word)) {
      severityScore += weight;
      keywordMatches.push(word);
    }
  });
  
  // Check for moderate keywords
  moderateKeywords.forEach(({ word, weight }) => {
    if (description.includes(word)) {
      severityScore += weight * 0.5; // Moderate keywords have less weight
      keywordMatches.push(word);
    }
  });
  
  // Additional factors
  const exclamationCount = (description.match(/!/g) || []).length;
  const urgentWords = ['emergency', 'urgent', 'immediate', 'now', 'asap', 'quick'];
  const hasUrgentWords = urgentWords.some(word => description.includes(word));
  
  if (hasUrgentWords) severityScore += 1.0;
  if (exclamationCount > 3) severityScore += 0.5;
  if (description.includes('!!!')) severityScore += 0.3;
  
  // Determine severity level
  let severity, confidence, priorityScore;
  
  if (severityScore >= 2.0 || hasUrgentWords) {
    severity = 'SEVERE';
    confidence = Math.min(0.7 + (severityScore * 0.05), 0.95);
    priorityScore = Math.min(90 + (severityScore * 2), 100);
  } else if (severityScore >= 0.5) {
    severity = 'MODERATE';
    confidence = Math.min(0.65 + (severityScore * 0.04), 0.85);
    priorityScore = Math.min(70 + (severityScore * 5), 89);
  } else {
    severity = 'MILD';
    confidence = 0.6;
    priorityScore = 50 + (severityScore * 10);
  }
  
  // Generate explanation based on severity
  let explanation;
  switch (severity) {
    case 'SEVERE':
      explanation = "The report contains indicators of serious incidents requiring immediate attention. This may involve threats to safety, violence, or severe harm.";
      break;
    case 'MODERATE':
      explanation = "The report suggests concerning behavior that requires prompt investigation. This may involve harassment, conflicts, or policy violations.";
      break;
    case 'MILD':
      explanation = "The report appears to involve minor concerns or administrative issues. Standard procedures should be followed.";
      break;
  }
  
  // Generate keywords (unique, max 5)
  const uniqueKeywords = [...new Set(keywordMatches)].slice(0, 5);
  if (uniqueKeywords.length < 3) {
    // Add some generic keywords based on severity
    const genericKeywords = {
      SEVERE: ['safety', 'intervention', 'emergency'],
      MODERATE: ['investigation', 'follow-up', 'concern'],
      MILD: ['administrative', 'routine', 'inquiry']
    };
    uniqueKeywords.push(...genericKeywords[severity]);
  }
  
  // Generate risk factors
  const riskFactors = [];
  if (severityScore >= 1.0) riskFactors.push("Keyword indicators present");
  if (exclamationCount > 2) riskFactors.push("Emotional intensity detected");
  if (hasUrgentWords) riskFactors.push("Urgency language used");
  if (riskFactors.length < 3) {
    riskFactors.push("Requires professional assessment");
    riskFactors.push("Context-dependent severity");
  }
  
  // Generate suggested actions
  const suggestedActions = [];
  switch (severity) {
    case 'SEVERE':
      suggestedActions.push("Immediate safety assessment", "Contact authorities if needed", "Priority investigation");
      break;
    case 'MODERATE':
      suggestedActions.push("Schedule investigation", "Document all details", "Follow-up within week");
      break;
    case 'MILD':
      suggestedActions.push("Standard procedure", "Document for records", "Routine follow-up");
      break;
  }
  
  return {
    severity: severity,
    confidence: Math.round(confidence * 100) / 100,
    explanation: explanation,
    keywords: uniqueKeywords,
    riskFactors: riskFactors.slice(0, 3),
    recommendedResponseTime: severity === 'SEVERE' ? '24 hours' : 
                           severity === 'MODERATE' ? '3-7 days' : '7-14 days',
    priorityScore: Math.round(priorityScore),
    suggestedActions: suggestedActions,
    analyzedAt: new Date().toISOString(),
    analysisId: `fallback_${Date.now()}`,
    isFallback: true,
    statistics: {
      descriptionLength: description.length,
      wordCount: words.length,
      severityScore: Math.round(severityScore * 100) / 100,
      keywordMatches: keywordMatches.length,
      exclamationCount: exclamationCount,
      hasUrgentWords: hasUrgentWords
    }
  };
}

// NEW: Batch severity analysis endpoint for multiple reports
router.post("/analyze-batch-severity", async (req, res) => {
  try {
    const { reports = [] } = req.body;
    
    if (!Array.isArray(reports) || reports.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of reports is required"
      });
    }
    
    // Limit batch size
    const batchLimit = 5;
    const reportsToProcess = reports.slice(0, batchLimit);
    
    console.log(`🔄 Processing batch severity analysis for ${reportsToProcess.length} reports`);
    
    // Process each report (could be parallel in production)
    const results = [];
    
    for (const report of reportsToProcess) {
      try {
        // Simulate API call to individual endpoint
        const mockReq = { body: report };
        const mockRes = {
          json: (data) => ({ 
            reportId: report.reportId || 'unknown', 
            data: data.data,
            success: true 
          })
        };
        
        // Call the single analysis function
        const result = await generateFallbackSeverityAnalysis(report);
        results.push({
          reportId: report.reportId || 'unknown',
          severity: result.severity,
          confidence: result.confidence,
          priorityScore: result.priorityScore,
          success: true
        });
      } catch (error) {
        results.push({
          reportId: report.reportId || 'unknown',
          severity: 'MILD',
          confidence: 0.5,
          priorityScore: 50,
          success: false,
          error: error.message
        });
      }
    }
    
    // Calculate batch statistics
    const severeCount = results.filter(r => r.severity === 'SEVERE').length;
    const moderateCount = results.filter(r => r.severity === 'MODERATE').length;
    const mildCount = results.filter(r => r.severity === 'MILD').length;
    
    return res.json({
      success: true,
      message: `Batch analysis completed for ${results.length} reports`,
      data: {
        results: results,
        statistics: {
          total: results.length,
          severe: severeCount,
          moderate: moderateCount,
          mild: mildCount,
          successRate: (results.filter(r => r.success).length / results.length) * 100
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("❌ Batch Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: "Batch analysis failed",
      error: error.message
    });
  }
});

module.exports = router;