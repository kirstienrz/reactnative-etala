// FRONTEND/API/AI.JS

import API from "./config";

export const checkSpamReport = (data) => 
  API.post("/ai/check-report", data);

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

