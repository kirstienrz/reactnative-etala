import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReportPDF = ({ formData, ticketNumber, isAnonymous }) => {
  const doc = new jsPDF("p", "mm", "a4");

  // ===== HEADER =====
  doc.setFontSize(16);
  doc.text("TUP GAD INCIDENT REPORT", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.text("Technological University of the Philippines", 105, 26, { align: "center" });
  doc.text(`Ticket No: ${ticketNumber}`, 14, 35);

  let y = 45;

  // ===== REPORT TYPE =====
  autoTable(doc, {
    startY: y,
    head: [["Report Type", "Value"]],
    body: [
      ["Reporting Mode", isAnonymous ? "Anonymous" : "Identified"],
      ["Date Submitted", new Date().toLocaleDateString()],
    ],
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 10;

  // ===== VICTIM INFO =====
  if (!isAnonymous) {
    doc.text("Victim-Survivor Information", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      body: [
        ["Name", `${formData.firstName} ${formData.lastName}`],
        ["Age", formData.age || "N/A"],
        ["Sex", formData.sex || "N/A"],
      ],
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ===== PERPETRATOR =====
  doc.text("Alleged Perpetrator Information", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    body: [
      ["Name", `${formData.perpFirstName} ${formData.perpLastName}`],
      ["Alias", formData.perpAlias || "N/A"],
      ["Sex", formData.perpSex || "N/A"],
      ["Age", formData.perpAge || "N/A"],
      ["Relationship", formData.perpRelationship || "N/A"],
    ],
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 10;

  // ===== INCIDENT DETAILS =====
  doc.text("Incident Details", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    body: [
      ["Date of Incident", formData.latestIncidentDate || "N/A"],
      ["Place", formData.placeOfIncident || "N/A"],
      ["Incident Types", formData.incidentTypes?.join(", ") || "N/A"],
    ],
    theme: "grid",
  });

  y = doc.lastAutoTable.finalY + 10;

  doc.text("Incident Description:", 14, y);
  y += 5;

  doc.setFontSize(10);
  doc.text(formData.incidentDescription || "N/A", 14, y, {
    maxWidth: 180,
  });

  // ===== FOOTER =====
  doc.setFontSize(8);
  doc.text(
    "This document is system-generated and confidential. TUP GAD Office.",
    105,
    290,
    { align: "center" }
  );

  // ✅ AUTO-DOWNLOAD PDF
  doc.save(`TUP_GAD_Report_${ticketNumber}.pdf`);

  // ✅ RETURN PDF BLOB for sending to backend
  return doc.output('blob');
};

// ✅ Function to send PDF to backend via email
// Email is automatically pulled from logged-in user's account
export const sendPDFToEmail = async (pdfBlob, ticketNumber, userEmail = null) => {
  try {
    const formData = new FormData();
    formData.append('pdf', pdfBlob, `TUP_GAD_Report_${ticketNumber}.pdf`);
    formData.append('ticketNumber', ticketNumber);
    
    // Optional: only include if you want to override the user's registered email
    if (userEmail) {
      formData.append('userEmail', userEmail);
    }
    
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // Use the same base URL as your API config
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${baseURL}/reports/send-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let the browser set it with boundary for multipart/form-data
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send PDF via email');
    }
    
    const result = await response.json();
    console.log('📧 Email sent to:', result.emailSentTo);
    return result;
  } catch (error) {
    console.error('Error sending PDF to email:', error);
    throw error;
  }
};