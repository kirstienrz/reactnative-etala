const Report = require("../models/report");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");
const axios = require("axios");

// Helper function to extract keywords
const extractKeywords = (text) => {
  const words = text.toLowerCase().split(/\W+/);
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
    'can', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
  ]);
  
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

// Helper function to generate summary
const generateSummary = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 'No summary available';
  
  const firstSentence = sentences[0].trim();
  const lastSentence = sentences[sentences.length - 1].trim();
  
  if (sentences.length === 1) {
    return firstSentence.length > 150 
      ? firstSentence.substring(0, 147) + '...'
      : firstSentence;
  }
  
  const summary = `${firstSentence.substring(0, 100)}... ${lastSentence.substring(0, 100)}`;
  return summary.length > 200 ? summary.substring(0, 197) + '...' : summary;
};

// Pinalitan: Severity detection instead of sentiment analysis
// ENHANCED VERSION: Spam detection + Cache management
const analyzeTextWithOpenAI = async (text, reportId = null) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is required");
    }

    // First: Check for obvious spam/nonsense
    if (isLikelySpam(text)) {
      console.log(`⚠️ Spam detected for report ${reportId || 'unknown'}`);
      return getSpamResult(text);
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You analyze Philippine incident reports. Determine:
            1. SEVERITY: SEVERE, MODERATE, or MILD
            2. IS_SPAM: true or false (if text is nonsense, spam, or not a real report)
            
            SEVERE = Physical violence, sexual assault, threats, confinement, RA laws
            MODERATE = Harassment, discrimination, threats without violence
            MILD = Minor complaints, misunderstandings
            SPAM = Gibberish, test messages, advertisements, nonsense
            
            Return ONLY JSON:
            {
              "severity": "SEVERE|MODERATE|MILD",
              "is_spam": boolean,
              "spam_reason": "if is_spam=true, explain why",
              "confidence": 0.0-1.0,
              "keywords": ["relevant", "keywords"],
              "summary": "brief analysis",
              "factors": {
                "urgency": 0.0-1.0,
                "impact": 0.0-1.0,
                "sensitivity": 0.0-1.0,
                "frequency": 0.0-1.0
              }
            }`
          },
          {
            role: "user",
            content: `Analyze this report and flag if spam: "${text}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const content = response.data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      
      // Validate and normalize
      result.severity = validateSeverity(result.severity);
      result.is_spam = Boolean(result.is_spam);
      result.confidence = clamp(result.confidence, 0, 1);
      
      // Log analysis
      console.log(`📊 Analysis for ${reportId || 'report'}:`, {
        severity: result.severity,
        spam: result.is_spam,
        confidence: result.confidence,
        length: text.length
      });
      
      return result;
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return getDefaultResult(text, true); // Force reanalysis next time
    }
    
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    return getDefaultResult(text, false);
  }
};

// Helper: Check for obvious spam
const isLikelySpam = (text) => {
  if (!text || text.trim().length < 10) return true;
  
  const lowerText = text.toLowerCase();
  
  // Spam indicators
  const spamPatterns = [
    // Too short or nonsense
    /^[0-9\s]+$/, // Just numbers
    /^[a-z]{1,3}$/i, // 1-3 letters
    /^(test|testing|trial|sample|demo)$/i,
    
    // Gibberish
    /(.)\1{4,}/, // Repeated characters "aaaaa"
    /[xqz]{5,}/i, // Weird character sequences
    
    // Advertisements
    /\b(buy|sell|shop|promo|discount|free|click|link|http|www|\.com|\.ph)\b/i,
    
    // Common spam words
    /\b(viagra|casino|lottery|winner|prize|money|rich|profit)\b/i
  ];
  
  // Check patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      console.log(`Spam detected: ${pattern.toString()} matched`);
      return true;
    }
  }
  
  // Check for extremely repetitive text
  const words = text.split(/\s+/);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniqueness = uniqueWords.size / words.length;
  
  if (uniqueness < 0.3 && words.length > 10) {
    console.log(`Low uniqueness spam: ${uniqueness}`);
    return true;
  }
  
  return false;
};

// Helper: Get spam result
const getSpamResult = (text) => {
  return {
    severity: "MILD",
    is_spam: true,
    spam_reason: "Pattern matched known spam indicators",
    confidence: 0.9,
    keywords: ["spam", "invalid", "test"],
    summary: "This appears to be spam or a test message.",
    factors: {
      urgency: 0.1,
      impact: 0.1,
      sensitivity: 0.1,
      frequency: 0.1
    },
    analysisMethod: "spam_detection"
  };
};

// Helper: Validate severity
const validateSeverity = (severity) => {
  const valid = ["SEVERE", "MODERATE", "MILD"];
  if (valid.includes(severity?.toUpperCase())) {
    return severity.toUpperCase();
  }
  return "MILD";
};

// Helper: Clamp number
const clamp = (num, min, max) => {
  return Math.min(Math.max(num || 0.7, min), max);
};

// Helper: Default result when API fails
const getDefaultResult = (text, shouldRetry = true) => {
  const lowerText = text.toLowerCase();
  const hasViolence = /(bugbog|suntok|hampas|gulpi|kinulong|9262|gahasa)/i.test(lowerText);
  
  return {
    severity: hasViolence ? "SEVERE" : "MODERATE",
    is_spam: false,
    confidence: hasViolence ? 0.85 : 0.6,
    keywords: text.split(/\s+/).slice(0, 5),
    summary: hasViolence ? 
      "Violence indicators detected. Needs manual review." : 
      "Analysis failed. Needs review.",
    factors: {
      urgency: hasViolence ? 0.8 : 0.4,
      impact: hasViolence ? 0.9 : 0.5,
      sensitivity: hasViolence ? 0.8 : 0.4,
      frequency: 0.3
    },
    shouldRetry, // Flag for retry later
    analysisMethod: "fallback"
  };
};

const analyzeReportSeverity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { forceRefresh = false } = req.query; // NEW: Force re-analysis

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found" 
      });
    }

    // CHECK IF WE SHOULD RE-ANALYZE
    const shouldReanalyze = 
      forceRefresh || 
      !report.severityAnalysis || 
      !report.severityAnalysis.analyzedAt ||
      isAnalysisStale(report.severityAnalysis.analyzedAt);

    if (!shouldReanalyze) {
      return res.json({
        success: true,
        message: "Using cached analysis",
        data: report.severityAnalysis,
        cached: true,
        analyzedAt: report.severityAnalysis.analyzedAt
      });
    }

    // Prepare text for analysis
    const textToAnalyze = [
      report.incidentDescription,
      report.additionalDetails || '',
      ...(report.incidentTypes || [])
    ].filter(text => text && text.trim().length > 0)
     .join(' ')
     .trim();

    if (!textToAnalyze || textToAnalyze.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Not enough text content"
      });
    }

    // Analyze with enhanced function (now includes spam detection)
    const severityResult = await analyzeTextWithOpenAI(textToAnalyze, report._id);

    // Add metadata
    severityResult.analyzedAt = new Date();
    severityResult.analyzedBy = userId;
    severityResult.reportId = report._id;
    severityResult.textSample = textToAnalyze.substring(0, 200);
    severityResult.textLength = textToAnalyze.length;
    
    // If spam, flag the report
    if (severityResult.is_spam) {
      report.isPotentialSpam = true;
      report.spamFlaggedAt = new Date();
      report.spamReason = severityResult.spam_reason;
    }

    // Update report
    report.severityAnalysis = severityResult;
    report.lastUpdated = new Date();
    report.lastAnalyzed = new Date();
    
    await report.save();

    res.json({
      success: true,
      message: severityResult.is_spam ? 
        "Analysis complete (SPAM DETECTED)" : 
        "Severity analysis completed",
      data: severityResult,
      cached: false,
      is_spam: severityResult.is_spam,
      reportId: report._id,
      ticketNumber: report.ticketNumber
    });

  } catch (error) {
    console.error("Error analyzing report:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Helper: Check if analysis is stale (older than 7 days)
const isAnalysisStale = (analyzedAt) => {
  if (!analyzedAt) return true;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(analyzedAt) < sevenDaysAgo;
};
// DAGDAGAN MO ITO bago ang module.exports

/**
 * Batch analyze severity for multiple reports
 * @route POST /api/reports/admin/batch-analyze-severity
 * @access Admin, Superadmin
 */

// controllers/reportController.js - ADD THIS FUNCTION

/**
 * Re-analyze ALL reports (force refresh all severity analysis)
 * @route POST /api/reports/admin/reanalyze-all
 * @access Admin, Superadmin
 */
const reanalyzeAllReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { batchSize = 20 } = req.body; // Process 20 at a time
    
    // Get ALL reports (active + archived) with severity analysis
    const allReports = await Report.find({
      'severityAnalysis': { $exists: true, $ne: null }
    })
    .select('_id ticketNumber incidentDescription additionalDetails incidentTypes severityAnalysis')
    .lean();
    
    if (allReports.length === 0) {
      return res.json({
        success: true,
        message: 'No analyzed reports found',
        data: { total: 0, successful: 0, failed: 0, details: [] }
      });
    }
    
    const results = {
      total: allReports.length,
      successful: 0,
      failed: 0,
      severityChanges: {},
      details: []
    };
    
    // Process in batches to avoid timeout
    for (let i = 0; i < allReports.length; i += batchSize) {
      const batch = allReports.slice(i, i + batchSize);
      
      for (const report of batch) {
        try {
          // Prepare text for analysis
          const textToAnalyze = [
            report.incidentDescription,
            report.additionalDetails || '',
            ...(report.incidentTypes || [])
          ]
            .filter(text => text && text.trim().length > 0)
            .join(' ')
            .trim();
          
          if (!textToAnalyze || textToAnalyze.length < 10) {
            results.details.push({
              reportId: report._id,
              ticketNumber: report.ticketNumber,
              success: false,
              error: "Not enough text content",
              oldSeverity: report.severityAnalysis?.severity || 'N/A'
            });
            results.failed++;
            continue;
          }
          
          // Analyze with FRESH analysis
          const severityResult = await analyzeTextWithOpenAI(textToAnalyze, report._id);
          
          // Add metadata
          severityResult.analyzedAt = new Date();
          severityResult.analyzedBy = userId;
          severityResult.textLength = textToAnalyze.length;
          severityResult.isReanalysis = true;
          severityResult.previousAnalysis = {
            severity: report.severityAnalysis?.severity,
            analyzedAt: report.severityAnalysis?.analyzedAt,
            confidence: report.severityAnalysis?.confidence
          };
          
          // Track severity changes
          const oldSeverity = report.severityAnalysis?.severity || 'N/A';
          const newSeverity = severityResult.severity;
          const severityChanged = oldSeverity !== newSeverity;
          
          if (severityChanged) {
            const changeKey = `${oldSeverity}→${newSeverity}`;
            results.severityChanges[changeKey] = (results.severityChanges[changeKey] || 0) + 1;
          }
          
          // Update the report
          await Report.findByIdAndUpdate(
            report._id,
            {
              $set: {
                'severityAnalysis': severityResult,
                'lastAnalyzed': new Date(),
                'lastUpdated': new Date()
              }
            }
          );
          
          results.details.push({
            reportId: report._id,
            ticketNumber: report.ticketNumber,
            success: true,
            message: "Re-analyzed successfully",
            oldSeverity: oldSeverity,
            newSeverity: newSeverity,
            severityChanged: severityChanged,
            confidence: severityResult.confidence,
            analyzedAt: severityResult.analyzedAt
          });
          results.successful++;
          
          // Delay between API calls
          await new Promise(resolve => setTimeout(resolve, 600));
          
        } catch (error) {
          console.error(`❌ Error re-analyzing report ${report._id}:`, error.message);
          results.details.push({
            reportId: report._id,
            ticketNumber: report.ticketNumber,
            success: false,
            error: error.message,
            oldSeverity: report.severityAnalysis?.severity || 'N/A'
          });
          results.failed++;
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    res.json({
      success: true,
      message: `Re-analyzed ALL reports: ${results.successful} successful, ${results.failed} failed`,
      summary: {
        totalProcessed: results.total,
        successful: results.successful,
        failed: results.failed,
        severityChanges: Object.keys(results.severityChanges).length > 0 ? results.severityChanges : 'No changes',
        processingTime: `${Math.ceil(results.total / batchSize)} batches`
      },
      data: results
    });
    
  } catch (error) {
    console.error("❌ Error in reanalyze-all:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to re-analyze all reports"
    });
  }
};


const batchAnalyzeSeverity = async (req, res) => {
  try {
    const { reportIds } = req.body;
    const userId = req.user.id;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Report IDs array is required"
      });
    }

    // Limit batch size for performance
    const maxBatchSize = 10;
    const idsToProcess = reportIds.slice(0, maxBatchSize);

    const results = {
      total: idsToProcess.length,
      successful: 0,
      failed: 0,
      details: []
    };

    // Process reports one by one (to avoid overwhelming OpenAI API)
    for (const reportId of idsToProcess) {
      try {
        const report = await Report.findById(reportId);
        
        if (!report) {
          results.details.push({
            reportId,
            success: false,
            message: "Report not found"
          });
          results.failed++;
          continue;
        }

        // Check if severity was already analyzed recently (within 7 days)
        if (report.severityAnalysis && report.severityAnalysis.analyzedAt) {
          const daysSinceAnalysis = (Date.now() - new Date(report.severityAnalysis.analyzedAt).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceAnalysis < 7) {
            results.details.push({
              reportId,
              success: true,
              message: "Already analyzed recently",
              cached: true,
              severity: report.severityAnalysis.severity,
              is_spam: report.severityAnalysis.is_spam || false
            });
            results.successful++;
            continue;
          }
        }

        // Prepare text for analysis
        const textToAnalyze = [
          report.incidentDescription,
          report.additionalDetails || '',
          ...(report.incidentTypes || [])
        ]
          .filter(text => text && text.trim().length > 0)
          .join(' ')
          .trim();

        if (!textToAnalyze || textToAnalyze.length < 10) {
          results.details.push({
            reportId,
            success: false,
            message: "Not enough text content"
          });
          results.failed++;
          continue;
        }

        // Analyze the text with spam detection
        const severityResult = await analyzeTextWithOpenAI(textToAnalyze, reportId);

        // Add metadata
        severityResult.analyzedAt = new Date();
        severityResult.analyzedBy = userId;
        severityResult.textLength = textToAnalyze.length;

        // If spam, flag the report
        if (severityResult.is_spam) {
          report.isPotentialSpam = true;
          report.spamFlaggedAt = new Date();
          report.spamReason = severityResult.spam_reason;
        }

        // Update the report
        report.severityAnalysis = severityResult;
        report.lastUpdated = new Date();
        report.lastAnalyzed = new Date();
        await report.save();

        results.details.push({
          reportId,
          success: true,
          message: "Analysis completed",
          cached: false,
          severity: severityResult.severity,
          is_spam: severityResult.is_spam || false,
          confidence: severityResult.confidence
        });
        results.successful++;

        // Small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 800));

      } catch (error) {
        console.error(`Error analyzing report ${reportId}:`, error);
        results.details.push({
          reportId,
          success: false,
          message: error.message || "Unknown error"
        });
        results.failed++;
      }
    }

    res.json({
      success: true,
      message: `Batch severity analysis completed: ${results.successful} successful, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    console.error("Error in batch severity analysis:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to perform batch severity analysis"
    });
  }
};

// Update get severity stats function
const getSeverityStats = async (req, res) => {
  try {
    const { timeframe = 'all', status = 'active' } = req.query;
    
    let dateFilter = {};
    if (timeframe === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (timeframe === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: oneWeekAgo } };
    } else if (timeframe === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: oneMonthAgo } };
    }

    let query = { ...dateFilter };
    if (status === 'active') {
      query.archived = false;
    } else if (status === 'archived') {
      query.archived = true;
    }

    const reports = await Report.find(query);

    const stats = {
      total: reports.length,
      analyzed: reports.filter(r => r.severityAnalysis).length,
      bySeverity: {
        SEVERE: 0,
        MODERATE: 0,
        MILD: 0,
        notAnalyzed: 0
      },
      confidence: {
        average: 0,
        high: 0, // > 0.8
        medium: 0, // 0.5-0.8
        low: 0 // < 0.5
      },
      trends: []
    };

    let totalConfidence = 0;
    let analyzedCount = 0;

    reports.forEach(report => {
      if (report.severityAnalysis) {
        const severity = report.severityAnalysis.severity;
        const confidence = report.severityAnalysis.confidence || 0;
        
        stats.bySeverity[severity]++;
        totalConfidence += confidence;
        analyzedCount++;

        if (confidence > 0.8) stats.confidence.high++;
        else if (confidence > 0.5) stats.confidence.medium++;
        else stats.confidence.low++;

        stats.trends.push({
          date: report.createdAt,
          severity,
          confidence,
          ticketNumber: report.ticketNumber
        });
      } else {
        stats.bySeverity.notAnalyzed++;
      }
    });

    if (analyzedCount > 0) {
      stats.confidence.average = totalConfidence / analyzedCount;
    }

    stats.bySeverityPercentages = {
      SEVERE: stats.bySeverity.SEVERE / analyzedCount * 100,
      MODERATE: stats.bySeverity.MODERATE / analyzedCount * 100,
      MILD: stats.bySeverity.MILD / analyzedCount * 100,
      notAnalyzed: stats.bySeverity.notAnalyzed / stats.total * 100
    };

    res.json({
      success: true,
      data: stats,
      timeframe,
      status
    });
  } catch (error) {
    console.error("Error getting severity stats:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};



// ✅ Utility: Generate unique ticket number
const generateTicketNumber = (isAnonymous) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `ETALA-${isAnonymous ? "ANON" : "ID"}-${year}${month}-${random}`;
};
/**
 * Create a new report
 * @route POST /api/reports/user/create
 * @access User, Admin
 */
const createReport = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Parse form data
    const formData = { ...req.body };
    
    // Parse arrays if they're strings
    if (typeof formData.incidentTypes === 'string') {
      try {
        formData.incidentTypes = JSON.parse(formData.incidentTypes);
      } catch (e) {
        console.error("Error parsing incidentTypes:", e);
        formData.incidentTypes = [];
      }
    }
    
    // Determine if anonymous
    const isAnonymous = formData.isAnonymous === "true" || formData.isAnonymous === true;
    
    // Handle file attachments
    const attachments = req.files ? req.files.map(file => ({
      uri: file.path,
      type: file.mimetype,
      fileName: file.originalname,
    })) : [];
    
    // ✅ GENERATE TICKET NUMBER FIRST
    const ticketNumber = generateTicketNumber(isAnonymous);
    console.log(`✅ Generated ticket number: ${ticketNumber}`);
    
    // ✅ STEP 1: Create ticket WITH the generated ticket number
    const displayName = isAnonymous ? "Anonymous User" : `${user.firstName} ${user.lastName}`;
    
    const ticket = new Ticket({
      ticketNumber: ticketNumber,
      userId: userId,
      displayName: displayName,
      isAnonymous: isAnonymous,
      status: "Open",
      lastMessageAt: new Date(),
      lastMessage: formData.incidentDescription?.substring(0, 100) || "New report submitted",
    });
    
    await ticket.save();
    console.log(`✅ Ticket created: ${ticket.ticketNumber}`);
    
    // ✅ STEP 2: Create report WITH ticketNumber
    const report = new Report({
      ...formData,
      createdBy: userId,
      ticketNumber: ticket.ticketNumber,
      isAnonymous: isAnonymous,
      attachments: attachments,
      status: "Pending",
      caseStatus: "For Queuing",
    });
    
    await report.save();
    console.log(`✅ Report created with ID: ${report._id}`);
    
    // ✅ STEP 3: Update ticket with reportId
    ticket.reportId = report._id;
    await ticket.save();
    
    // ✅ STEP 4: Create system welcome message
    const Message = require("../models/message");
    const systemMessage = new Message({
      ticketNumber: report.ticketNumber,
      sender: "admin",
      senderName: "System",
      messageType: "text",
      content: `Thank you for submitting your report. Your ticket number is ${report.ticketNumber}. Our team will review your case shortly.`,
      isRead: false
    });
    
    await systemMessage.save();
    console.log(`✅ System message created for ticket: ${report.ticketNumber}`);
    
    // 🔥 EMIT SOCKET EVENT FOR NEW MESSAGE (if socket.io is available)
    const io = req.app.get("io");
    if (io) {
      io.to(`ticket-${report.ticketNumber}`).emit("new-message", {
        message: systemMessage,
        ticket: ticket
      });
    }
    
    console.log(`✅ Report created successfully: ${ticket.ticketNumber}`);
    
    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
      ticketNumber: ticket.ticketNumber,
    });
  } catch (error) {
    console.error("❌ Error creating report:", error);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to create report",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
/**
 * Get all reports created by the authenticated user
 * @route GET /api/reports/user/all
 * @access User, Admin
 */
const getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const reports = await Report.find({ createdBy: userId, archived: false })
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstName lastName email");

    res.json({
      success: true,
      data: reports,
      total: reports.length
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Get a single report by ID (user must own the report)
 * @route GET /api/reports/user/:id
 * @access User, Admin
 */
const getUserReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({ _id: id, createdBy: userId })
      .populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found" 
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Get all non-archived reports (admin only)
 * @route GET /api/reports/admin/all
 * @access Admin, Superadmin
 */
const getAllReports = async (req, res) => {
  try {
    const { status, incidentType, search, sortBy = "createdAt" } = req.query;

    let query = { archived: false };

    if (status) query.status = status;
    if (incidentType) query.incidentType = incidentType;
    if (search) {
      query.$or = [
        { ticketNumber: new RegExp(search, "i") },
        { incidentDescription: new RegExp(search, "i") },
        { placeOfIncident: new RegExp(search, "i") },
      ];
    }

    const reports = await Report.find(query)
      .sort({ [sortBy]: -1 })
      .populate("createdBy", "firstName lastName email tupId");

    res.json({
      success: true,
      data: reports,
      message: "Active reports fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Get a single report by ID (admin only)
 * @route GET /api/reports/admin/:id
 * @access Admin, Superadmin
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate("createdBy", "firstName lastName email tupId");

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found" 
      });
    }

    res.json({
      success: true,
      data: report,
      message: "Report fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Update report status (admin only)
 * @route PUT /api/reports/admin/:id/status
 * @access Admin, Superadmin
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, caseStatus } = req.body;

    const validStatuses = ["Pending", "Reviewed", "In Progress", "Resolved", "Closed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (caseStatus) updateData.caseStatus = caseStatus;
    if (remarks) updateData.adminNotes = remarks;
    
    if (status === "Resolved" || status === "Closed") {
      updateData.resolvedAt = new Date();
    }

    updateData.lastUpdated = new Date();

    const report = await Report.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found" 
      });
    }

    res.json({
      success: true,
      data: report,
      message: "Report status updated successfully"
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Add referral entry to a report
 * @route POST /api/reports/admin/:id/referral
 * @access Admin, Superadmin
 */
const addReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, note } = req.body;

    if (!department) {
      return res.status(400).json({ 
        success: false,
        message: "Department is required" 
      });
    }

    const referral = {
      department,
      note,
      referredBy: req.user.id,
      date: new Date()
    };

    const report = await Report.findByIdAndUpdate(
      id,
      { 
        $push: { referrals: referral },
        $set: { lastUpdated: new Date() }
      },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found" 
      });
    }

    res.json({
      success: true,
      data: report,
      message: "Referral added successfully"
    });
  } catch (error) {
    console.error("Error adding referral:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Archive a report (admin only)
 * @route PUT /api/reports/admin/:id/archive
 * @access Admin, Superadmin
 */
const archiveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndUpdate(
      id,
      { archived: true, archivedAt: new Date() },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Report archived successfully", 
      data: report 
    });
  } catch (error) {
    console.error("Error archiving report:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Get all archived reports (admin only)
 * @route GET /api/reports/admin/archived
 * @access Admin, Superadmin
 */
const getArchivedReports = async (req, res) => {
  try {
    const reports = await Report.find({ archived: true })
      .sort({ archivedAt: -1 })
      .populate("createdBy", "firstName lastName email tupId");

    res.json({
      success: true,
      data: reports,
      message: "Archived reports fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching archived reports:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Restore an archived report (admin only)
 * @route PUT /api/reports/admin/:id/restore
 * @access Admin, Superadmin
 */
const restoreReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndUpdate(
      id,
      { archived: false, $unset: { archivedAt: "" } },
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Report restored successfully", 
      data: report 
    });
  } catch (error) {
    console.error("Error restoring report:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Disclose user identity (user only)
 * @route PATCH /api/reports/user/disclose/:id
 * @route POST /api/reports/:id/reveal
 * @access User, Admin
 */
const discloseReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the report and verify ownership
    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found or access denied" 
      });
    }

    // Check if already disclosed
    if (!report.isAnonymous) {
      return res.status(400).json({ 
        success: false,
        message: "Report is already disclosed" 
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update report to non-anonymous
    report.isAnonymous = false;
    await report.save();

    // Update associated ticket
    if (report.ticketNumber) {
      const displayName = `${user.firstName} ${user.lastName}`;
      await Ticket.findOneAndUpdate(
        { ticketNumber: report.ticketNumber },
        { 
          isAnonymous: false,
          displayName: displayName
        }
      );
    }

    res.json({
      success: true,
      message: "Identity disclosed successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error disclosing report:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Update report by user (after disclosing identity)
 * @route PATCH /api/reports/user/update/:id
 * @access User, Admin
 */
const updateReportByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { incidentDescription, additionalNotes } = req.body;

    // Find the report and verify ownership
    const report = await Report.findOne({ _id: id, createdBy: userId });

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found or access denied" 
      });
    }

    // Only allow updates if report is not anonymous (identity disclosed)
    if (report.isAnonymous) {
      return res.status(403).json({ 
        success: false,
        message: "You must disclose your identity before updating the report" 
      });
    }

    // Update allowed fields
    if (incidentDescription) report.incidentDescription = incidentDescription;
    if (additionalNotes) report.additionalNotes = additionalNotes;

    await report.save();

    res.json({
      success: true,
      message: "Report updated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

/**
 * Send report PDF via email
 * @route POST /api/reports/send-pdf
 * @access User, Admin, Superadmin
 */
/**
 * Send report PDF via email
 * @route POST /api/reports/send-pdf
 * @access User, Admin, Superadmin
 */
const sendReportPDF = async (req, res) => {
  try {
    const pdfFile = req.file;
    const userId = req.user.id;
    const { ticketNumber } = req.body;

    // Validate PDF file
    if (!pdfFile) {
      return res.status(400).json({ 
        success: false,
        message: "PDF file is required" 
      });
    }

    if (pdfFile.mimetype !== "application/pdf") {
      return res.status(400).json({ 
        success: false,
        message: "Only PDF files are allowed" 
      });
    }

    // Get user's email
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(404).json({ 
        success: false,
        message: "User email not found" 
      });
    }

    const userEmail = user.email;
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    // Send email with PDF attachment using the updated sendEmail format
    await sendEmail({
      to: userEmail,
      subject: "Your TUP GAD Report Copy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">TUP GAD Office</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Gender and Development Office</p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Report Submitted Successfully</h2>
            
            <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for submitting your incident report. Your report has been received and will be reviewed by our team.
            </p>

            <!-- Ticket Info Box -->
            <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Ticket Number:</p>
              <p style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 700;">${ticketNumber || 'N/A'}</p>
              <p style="margin: 10px 0 0 0; color: #64748b; font-size: 13px;">Date Submitted: ${currentDate}</p>
            </div>

            <p style="color: #475569; line-height: 1.6; margin: 20px 0;">
              Please find attached a PDF copy of your submitted report. Keep this for your records.
            </p>

            <!-- What's Next Section -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0;">What happens next?</h3>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li>Your report will be reviewed by our team within 24-48 hours</li>
                <li>You can track your report status using your ticket number</li>
                <li>We will contact you if we need additional information</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <p style="color: #475569; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
              If you have any questions or concerns, please contact us at 
              <a href="mailto:gad@tup.edu.ph" style="color: #2563eb; text-decoration: none;">gad@tup.edu.ph</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">
              This is an automated message from TUP GAD Office.
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              Please do not reply to this email.
            </p>
            <p style="color: #94a3b8; font-size: 11px; margin: 15px 0 0 0;">
              Technological University of the Philippines<br>
              Ayala Blvd, Ermita, Manila, Metro Manila
            </p>
          </div>
        </div>
      `,
      pdfBuffer: pdfFile.buffer,
      pdfFilename: pdfFile.originalname || `TUP_GAD_Report_${ticketNumber || Date.now()}.pdf`
    });

    console.log(`✅ Report PDF sent to ${userEmail}`);

    res.json({ 
      success: true, 
      message: "Report sent to your email successfully",
      emailSentTo: userEmail
    });

  } catch (error) {
    console.error("❌ Failed to send report PDF:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send report email", 
      error: error.message 
    });
  }
};
// controllers/reportController.js
// ... (existing code continues)

/**
 * Batch re-analyze stale reports (admin only)
 * @route POST /api/reports/admin/batch-reanalyze-stale
 * @access Admin, Superadmin
 */
const batchReanalyzeStaleReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7, limit = 50 } = req.body;
    
    // Validate input
    if (days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 365'
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    // Calculate date threshold for stale analysis
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Find reports with:
    // 1. Already analyzed (has severityAnalysis)
    // 2. Analysis is older than X days
    // 3. Not archived (optional, depends on your needs)
    const staleReports = await Report.find({
      'severityAnalysis': { $exists: true, $ne: null },
      'severityAnalysis.analyzedAt': { $lt: cutoffDate },
      'archived': false  // Only re-analyze active reports
    })
    .sort({ 'severityAnalysis.analyzedAt': 1 }) // Oldest first
    .limit(limit)
    .select('_id ticketNumber incidentDescription additionalDetails incidentTypes severityAnalysis');
    
    if (staleReports.length === 0) {
      return res.json({
        success: true,
        message: 'No stale reports found for re-analysis',
        data: {
          total: 0,
          successful: 0,
          failed: 0,
          details: []
        }
      });
    }

    const results = {
      total: staleReports.length,
      successful: 0,
      failed: 0,
      details: []
    };
    
    // Process reports one by one with delay to avoid rate limits
    for (const report of staleReports) {
      try {
        console.log(`🔄 Re-analyzing report ${report._id} (${report.ticketNumber})`);
        
        // Prepare text for analysis
        const textToAnalyze = [
          report.incidentDescription,
          report.additionalDetails || '',
          ...(report.incidentTypes || [])
        ]
          .filter(text => text && text.trim().length > 0)
          .join(' ')
          .trim();
        
        if (!textToAnalyze || textToAnalyze.length < 10) {
          results.details.push({
            reportId: report._id,
            ticketNumber: report.ticketNumber,
            success: false,
            error: "Not enough text content",
            oldSeverity: report.severityAnalysis?.severity || 'N/A'
          });
          results.failed++;
          continue;
        }
        
        // Analyze with enhanced function (includes spam detection)
        const severityResult = await analyzeTextWithOpenAI(textToAnalyze, report._id);
        
        // Add metadata
        severityResult.analyzedAt = new Date();
        severityResult.analyzedBy = userId;
        severityResult.textLength = textToAnalyze.length;
        severityResult.isReanalysis = true;
        severityResult.previousAnalysis = {
          severity: report.severityAnalysis?.severity,
          analyzedAt: report.severityAnalysis?.analyzedAt,
          confidence: report.severityAnalysis?.confidence
        };
        
        // Update the report
        const updatedReport = await Report.findByIdAndUpdate(
          report._id,
          {
            $set: {
              'severityAnalysis': severityResult,
              'lastAnalyzed': new Date(),
              'lastUpdated': new Date()
            }
          },
          { new: true }
        );
        
        const severityChanged = report.severityAnalysis?.severity !== severityResult.severity;
        
        results.details.push({
          reportId: report._id,
          ticketNumber: report.ticketNumber,
          success: true,
          message: "Re-analyzed successfully",
          oldSeverity: report.severityAnalysis?.severity || 'N/A',
          newSeverity: severityResult.severity,
          severityChanged: severityChanged,
          is_spam: severityResult.is_spam || false,
          confidence: severityResult.confidence,
          analyzedAt: severityResult.analyzedAt
        });
        results.successful++;
        
        // Add delay between API calls to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.error(`❌ Error re-analyzing report ${report._id}:`, error.message);
        results.details.push({
          reportId: report._id,
          ticketNumber: report.ticketNumber,
          success: false,
          error: error.message,
          oldSeverity: report.severityAnalysis?.severity || 'N/A'
        });
        results.failed++;
      }
    }
    
    // Summary statistics
    const severityChanges = results.details.filter(d => d.success && d.severityChanged);
    const spamDetected = results.details.filter(d => d.success && d.is_spam);
    
    res.json({
      success: true,
      message: `Batch re-analysis completed: ${results.successful} successful, ${results.failed} failed`,
      summary: {
        totalProcessed: results.total,
        successful: results.successful,
        failed: results.failed,
        severityChanges: severityChanges.length,
        spamDetected: spamDetected.length,
        processingTime: `${days} day threshold`
      },
      data: results
    });
    
  } catch (error) {
    console.error("❌ Error in batch re-analyze stale reports:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to perform batch re-analysis"
    });
  }
};

/**
 * Get re-analysis statistics (admin only)
 * @route GET /api/reports/admin/reanalysis-stats
 * @access Admin, Superadmin
 */
const getReanalysisStats = async (req, res) => {
  try {
    const { daysThreshold = 7 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysThreshold));
    
    // Get reports that would qualify for re-analysis
    const staleReports = await Report.find({
      'severityAnalysis': { $exists: true, $ne: null },
      'severityAnalysis.analyzedAt': { $lt: cutoffDate },
      'archived': false
    })
    .select('severityAnalysis createdAt')
    .lean();
    
    // Count by severity
    const severityCount = {
      SEVERE: 0,
      MODERATE: 0,
      MILD: 0
    };
    
    staleReports.forEach(report => {
      const severity = report.severityAnalysis?.severity;
      if (severity && severityCount[severity] !== undefined) {
        severityCount[severity]++;
      }
    });
    
    // Calculate average days stale
    let totalDaysStale = 0;
    staleReports.forEach(report => {
      const analyzedAt = new Date(report.severityAnalysis?.analyzedAt);
      const daysStale = Math.floor((Date.now() - analyzedAt.getTime()) / (1000 * 60 * 60 * 24));
      totalDaysStale += daysStale;
    });
    
    const avgDaysStale = staleReports.length > 0 
      ? Math.round(totalDaysStale / staleReports.length) 
      : 0;
    
    // Oldest analysis
    const oldestAnalysis = staleReports.length > 0
      ? staleReports.sort((a, b) => 
          new Date(a.severityAnalysis?.analyzedAt) - new Date(b.severityAnalysis?.analyzedAt)
        )[0]
      : null;
    
    res.json({
      success: true,
      data: {
        totalStaleReports: staleReports.length,
        bySeverity: severityCount,
        averageDaysStale: avgDaysStale,
        oldestAnalysis: oldestAnalysis ? {
          reportId: oldestAnalysis._id,
          analyzedAt: oldestAnalysis.severityAnalysis?.analyzedAt,
          daysStale: Math.floor((Date.now() - new Date(oldestAnalysis.severityAnalysis?.analyzedAt).getTime()) / (1000 * 60 * 60 * 24)),
          severity: oldestAnalysis.severityAnalysis?.severity
        } : null,
        cutoffDate: cutoffDate,
        daysThreshold: parseInt(daysThreshold)
      }
    });
    
  } catch (error) {
    console.error("Error getting re-analysis stats:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update the module.exports to include the new functions
module.exports = {
  createReport,
  getUserReports,
  getUserReportById,
  getAllReports,
  getReportById,
  updateReportStatus,
  addReferral,
  archiveReport,
  getArchivedReports,
  restoreReport,
  discloseReport,
  updateReportByUser,
  sendReportPDF,
  generateTicketNumber,
  analyzeReportSeverity,
  batchAnalyzeSeverity,
  getSeverityStats,
  // ADD THESE NEW FUNCTIONS
  batchReanalyzeStaleReports,
  getReanalysisStats,
  reanalyzeAllReports
};