// backend/utils/spamDetector.js - COMPLETE VERSION
const { OpenAI } = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Detect spam using AI
 */
const detectSpam = async (description) => {
  try {
    if (!description || description.trim().length < 10) {
      return { 
        isSpam: false, 
        confidence: 0, 
        reason: 'Too short for spam detection',
        details: { length: description?.length || 0 }
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a university incident report analyzer in the Philippines.
          
          Analyze if this is a REAL, VALID incident report or SPAM/FAKE.
          
          REAL REPORTS typically contain:
          - Clear descriptions of harassment, abuse, bullying, discrimination
          - Specific dates, times, locations
          - Names or descriptions of people involved
          - Emotional context or impact description
          - Request for help or action
          - Written in English, Filipino, or Tagalog with proper grammar
          
          SPAM/FAKE REPORTS typically contain:
          - Gibberish, random text, repeated characters
          - Advertisements, promotional content
          - Test messages, placeholder text
          - Jokes, memes, fictional stories
          - No coherent incident description
          - URL links, email addresses for promotion
          - Commercial product mentions
          
          IMPORTANT: Consider cultural context - Filipino reports may mix languages.
          
          Respond with ONLY this JSON format:
          {
            "isSpam": boolean,
            "confidence": number (0.0 to 1.0),
            "reason": "Brief explanation",
            "flags": ["array", "of", "specific", "issues"]
          }`
        },
        {
          role: "user",
          content: `Analyze this incident report:\n\n"${description.substring(0, 2000)}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      ...result,
      details: result
    };
    
  } catch (error) {
    console.error('OpenAI spam detection error:', error);
    
    return {
      isSpam: false,
      confidence: 0.2,
      reason: 'AI service error',
      details: { error: error.message }
    };
  }
};

/**
 * Multi-field spam detection
 */
const detectSpamInReport = async (formData) => {
  try {
    // Combine all text fields for analysis
    const textFields = [
      formData.incidentDescription,
      formData.additionalNotes,
      formData.witnessAccount,
      formData.placeOfIncident
    ];
    
    const fullText = textFields
      .filter(text => text && typeof text === 'string' && text.trim().length > 0)
      .join('\n\n');
    
    if (fullText.length < 20) {
      return { 
        isSpam: false, 
        confidence: 0, 
        reason: 'Insufficient text for analysis',
        details: {}
      };
    }
    
    // Use AI to analyze the entire report
    const spamResult = await detectSpam(fullText);
    
    return spamResult;
    
  } catch (error) {
    console.error('Report spam detection error:', error);
    return {
      isSpam: false,
      confidence: 0,
      reason: 'Analysis failed',
      details: { error: error.message }
    };
  }
};

module.exports = { 
  detectSpam, 
  detectSpamInReport 
};