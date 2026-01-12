import API from "./config";

export const checkSpamReport = (data) =>
  API.post("/ai/check-report", data);

// api/openai.js
export const analyzeReportSeverity = async (reportData) => {
  try {
    const response = await API.post("/ai/analyze-severity", reportData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing report severity:', error);
    throw error;
  }
};

// Backend API endpoint example (Node.js/Express):
/*
router.post('/analyze-severity', async (req, res) => {
  try {
    const { incidentDescription, incidentTypes, timestamp } = req.body;
    
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a severity analysis assistant. Analyze incident reports and classify their severity as 'severe', 'moderate', or 'mild'. Provide a confidence score, brief explanation, and 3-5 keywords."
        },
        {
          role: "user",
          content: `Incident Types: ${incidentTypes?.join(', ') || 'Not specified'}\n\nDescription: ${incidentDescription || 'No description provided'}\n\nPlease analyze the severity.`
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    const analysis = openaiResponse.choices[0].message.content;
    
    // Parse the response to extract severity, confidence, explanation, and keywords
    // This is a simplified parsing - you might want to structure the prompt better
    const severityMatch = analysis.match(/severity[:\s]+(\w+)/i);
    const confidenceMatch = analysis.match(/(\d+)% confidence/i);
    
    res.json({
      success: true,
      data: {
        severity: severityMatch ? severityMatch[1].charAt(0).toUpperCase() + severityMatch[1].slice(1).toLowerCase() : 'Unknown',
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.8,
        explanation: analysis.substring(0, 100) + '...',
        keywords: incidentTypes || ['incident']
      }
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ success: false, message: 'Analysis failed' });
  }
});
*/