const Report = require("../models/report");
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");
// Add these at the beginning with other imports
const axios = require('axios');
require('dotenv').config();

// Add this helper function for text analysis
const analyzeTextWithOpenAI = async (text) => {
  try {
    // Option 1: Using OpenAI API (recommended for accuracy)
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a sentiment analysis assistant. Analyze the following text and return ONLY a JSON object with these fields: sentiment (positive, negative, neutral, mixed), confidence (0-1), keywords (array of key phrases), summary (brief summary), emotionScores (object with positive, negative, neutral, mixed scores 0-1)."
            },
            {
              role: "user",
              content: `Analyze this text: "${text}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      try {
        const result = JSON.parse(content);
        return result;
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", parseError);
        // Fallback to manual analysis
        return analyzeTextManually(text);
      }
    }

    // Option 2: Using Hugging Face Inference API (free tier available)
    if (process.env.HUGGINGFACE_API_KEY) {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const scores = response.data[0];
      const sentiments = [
        { label: 'negative', score: scores.find(s => s.label === 'negative')?.score || 0 },
        { label: 'neutral', score: scores.find(s => s.label === 'neutral')?.score || 0 },
        { label: 'positive', score: scores.find(s => s.label === 'positive')?.score || 0 }
      ];

      const maxScore = Math.max(...sentiments.map(s => s.score));
      const dominantSentiment = sentiments.find(s => s.score === maxScore);

      return {
        sentiment: dominantSentiment.label,
        confidence: maxScore,
        emotionScores: {
          positive: sentiments.find(s => s.label === 'positive').score,
          negative: sentiments.find(s => s.label === 'negative').score,
          neutral: sentiments.find(s => s.label === 'neutral').score,
          mixed: 0
        },
        keywords: extractKeywords(text),
        summary: generateSummary(text)
      };
    }

    // Option 3: Manual analysis (fallback)
    return analyzeTextManually(text);
  } catch (error) {
    console.error("Error analyzing text with external API:", error);
    return analyzeTextManually(text);
  }
};

// Manual text analysis (fallback when no API available)
const analyzeTextManually = (text) => {
  const lowerText = text.toLowerCase();
  
  // Sentiment word lists
  const positiveWords = [
    'good', 'great', 'excellent', 'happy', 'satisfied', 'thank', 'appreciate',
    'helpful', 'resolved', 'quick', 'efficient', 'professional', 'kind', 'supportive',
    'understanding', 'patient', 'polite', 'friendly', 'cooperative', 'successful'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'angry', 'frustrated', 'disappointed', 'upset',
    'unhappy', 'complaint', 'problem', 'issue', 'wrong', 'failed', 'slow',
    'inefficient', 'rude', 'unprofessional', 'unhelpful', 'ignored', 'dismissed'
  ];
  
  const urgentWords = [
    'urgent', 'emergency', 'immediately', 'now', 'asap', 'critical', 'important',
    'serious', 'dangerous', 'harm', 'threat', 'danger', 'risk', 'concerned', 'worried'
  ];
  
  // Count occurrences
  let positiveCount = 0;
  let negativeCount = 0;
  let urgentCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  urgentWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) urgentCount += matches.length;
  });
  
  // Determine sentiment
  let sentiment;
  let confidence;
  
  if (positiveCount > 0 && negativeCount === 0) {
    sentiment = 'positive';
    confidence = Math.min(0.7 + (positiveCount * 0.1), 0.95);
  } else if (negativeCount > 0 && positiveCount === 0) {
    sentiment = 'negative';
    confidence = Math.min(0.7 + (negativeCount * 0.1), 0.95);
  } else if (positiveCount > 0 && negativeCount > 0) {
    sentiment = 'mixed';
    confidence = Math.min(0.5 + (Math.abs(positiveCount - negativeCount) * 0.05), 0.9);
  } else {
    sentiment = 'neutral';
    confidence = 0.6;
  }
  
  // Adjust for urgency
  if (urgentCount > 0 && sentiment !== 'positive') {
    sentiment = 'negative';
    confidence = Math.min(confidence + 0.1, 0.95);
  }
  
  return {
    sentiment,
    confidence,
    keywords: extractKeywords(text),
    summary: generateSummary(text),
    emotionScores: {
      positive: positiveCount / (positiveCount + negativeCount + 1),
      negative: negativeCount / (positiveCount + negativeCount + 1),
      neutral: sentiment === 'neutral' ? 0.8 : 0.1,
      mixed: sentiment === 'mixed' ? 0.8 : 0.1
    },
    analysisMethod: 'manual',
    wordStats: {
      positive: positiveCount,
      negative: negativeCount,
      urgent: urgentCount,
      totalWords: text.split(/\s+/).length
    }
  };
};

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

// Add this controller function to your exports
/**
 * Analyze sentiment of a report
 * @route POST /api/reports/admin/:id/analyze-sentiment
 * @access Admin, Superadmin
 */
const analyzeReportSentiment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the report
    const report = await Report.findById(id)
      .populate("createdBy", "firstName lastName email");

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: "Report not found" 
      });
    }

    // Check if sentiment was already analyzed recently (within 24 hours)
    if (report.sentimentAnalysis && report.sentimentAnalysis.analyzedAt) {
      const hoursSinceAnalysis = (Date.now() - new Date(report.sentimentAnalysis.analyzedAt).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceAnalysis < 24) {
        return res.json({
          success: true,
          message: "Sentiment already analyzed recently",
          data: report.sentimentAnalysis,
          cached: true
        });
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
      return res.status(400).json({
        success: false,
        message: "Not enough text content for sentiment analysis"
      });
    }

    console.log(`Analyzing sentiment for report ${id}, text length: ${textToAnalyze.length}`);

    // Analyze the text
    const sentimentResult = await analyzeTextWithOpenAI(textToAnalyze);

    // Add metadata
    sentimentResult.analyzedAt = new Date();
    sentimentResult.analyzedBy = userId;
    sentimentResult.textLength = textToAnalyze.length;
    sentimentResult.textSample = textToAnalyze.substring(0, 200) + (textToAnalyze.length > 200 ? '...' : '');

    // Update the report with sentiment analysis
    report.sentimentAnalysis = sentimentResult;
    report.lastUpdated = new Date();
    
    await report.save();

    console.log(`Sentiment analysis completed for report ${id}: ${sentimentResult.sentiment} (${Math.round(sentimentResult.confidence * 100)}%)`);

    res.json({
      success: true,
      message: "Sentiment analysis completed successfully",
      data: sentimentResult,
      cached: false,
      reportId: report._id,
      ticketNumber: report.ticketNumber
    });
  } catch (error) {
    console.error("Error analyzing report sentiment:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to analyze sentiment",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Batch analyze sentiment for multiple reports
 * @route POST /api/reports/admin/batch-analyze-sentiment
 * @access Admin, Superadmin
 */
const batchAnalyzeSentiment = async (req, res) => {
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

    // Process reports one by one (to avoid overwhelming APIs)
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

        // Skip if already analyzed recently
        if (report.sentimentAnalysis && report.sentimentAnalysis.analyzedAt) {
          const hoursSinceAnalysis = (Date.now() - new Date(report.sentimentAnalysis.analyzedAt).getTime()) / (1000 * 60 * 60);
          if (hoursSinceAnalysis < 24) {
            results.details.push({
              reportId,
              success: true,
              message: "Already analyzed recently",
              cached: true,
              sentiment: report.sentimentAnalysis.sentiment
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

        // Analyze the text
        const sentimentResult = await analyzeTextWithOpenAI(textToAnalyze);

        // Add metadata
        sentimentResult.analyzedAt = new Date();
        sentimentResult.analyzedBy = userId;
        sentimentResult.textLength = textToAnalyze.length;

        // Update the report
        report.sentimentAnalysis = sentimentResult;
        report.lastUpdated = new Date();
        await report.save();

        results.details.push({
          reportId,
          success: true,
          message: "Analysis completed",
          cached: false,
          sentiment: sentimentResult.sentiment,
          confidence: sentimentResult.confidence
        });
        results.successful++;

        // Small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error analyzing report ${reportId}:`, error);
        results.details.push({
          reportId,
          success: false,
          message: error.message
        });
        results.failed++;
      }
    }

    res.json({
      success: true,
      message: `Batch analysis completed: ${results.successful} successful, ${results.failed} failed`,
      data: results
    });
  } catch (error) {
    console.error("Error in batch sentiment analysis:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to perform batch sentiment analysis"
    });
  }
};

/**
 * Get sentiment statistics
 * @route GET /api/reports/admin/sentiment-stats
 * @access Admin, Superadmin
 */
const getSentimentStats = async (req, res) => {
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

    // Build query
    let query = { ...dateFilter };
    if (status === 'active') {
      query.archived = false;
    } else if (status === 'archived') {
      query.archived = true;
    }

    const reports = await Report.find(query);

    // Calculate statistics
    const stats = {
      total: reports.length,
      analyzed: reports.filter(r => r.sentimentAnalysis).length,
      bySentiment: {
        positive: 0,
        negative: 0,
        neutral: 0,
        mixed: 0,
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
      if (report.sentimentAnalysis) {
        const sentiment = report.sentimentAnalysis.sentiment;
        const confidence = report.sentimentAnalysis.confidence || 0;
        
        stats.bySentiment[sentiment]++;
        totalConfidence += confidence;
        analyzedCount++;

        if (confidence > 0.8) stats.confidence.high++;
        else if (confidence > 0.5) stats.confidence.medium++;
        else stats.confidence.low++;

        // Add to trends
        stats.trends.push({
          date: report.createdAt,
          sentiment,
          confidence,
          ticketNumber: report.ticketNumber
        });
      } else {
        stats.bySentiment.notAnalyzed++;
      }
    });

    if (analyzedCount > 0) {
      stats.confidence.average = totalConfidence / analyzedCount;
    }

    // Calculate percentages
    stats.bySentimentPercentages = {
      positive: stats.bySentiment.positive / analyzedCount * 100,
      negative: stats.bySentiment.negative / analyzedCount * 100,
      neutral: stats.bySentiment.neutral / analyzedCount * 100,
      mixed: stats.bySentiment.mixed / analyzedCount * 100,
      notAnalyzed: stats.bySentiment.notAnalyzed / stats.total * 100
    };

    res.json({
      success: true,
      data: stats,
      timeframe,
      status
    });
  } catch (error) {
    console.error("Error getting sentiment stats:", error);
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
  analyzeReportSentiment,
  batchAnalyzeSentiment,
  getSentimentStats
};