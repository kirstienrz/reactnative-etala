import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReportPDF = async ({ formData, ticketNumber, isAnonymous }) => {
  const doc = new jsPDF("p", "mm", "a4");
  const purpleTheme = [126, 34, 206]; // Purple 700

  // ===== HEADER =====
  doc.setFontSize(22);
  doc.setTextColor(purpleTheme[0], purpleTheme[1], purpleTheme[2]);
  doc.text("TUPT GAD INCIDENT REPORT", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Technological University of the Philippines", 105, 26, { align: "center" });

  doc.setDrawColor(purpleTheme[0], purpleTheme[1], purpleTheme[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(`Ticket Number: ${ticketNumber}`, 14, 40);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 45);

  let y = 55;

  // ===== REPORT TYPE =====
  autoTable(doc, {
    startY: y,
    head: [["Report Configuration", "Status"]],
    body: [
      ["Reporting Mode", isAnonymous ? "Anonymous / Confidential" : "Identified"],
      ["Submission Date", new Date().toLocaleDateString()],
      ["Case Category", formData.category || "General Incident"],
    ],
    theme: "grid",
    headStyles: { fillColor: purpleTheme, textColor: 255 },
    styles: { fontSize: 9 }
  });

  y = doc.lastAutoTable.finalY + 12;

  // ===== VICTIM INFO =====
  if (!isAnonymous) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Victim-Survivor Information", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      body: [
        ["Full Name", `${formData.firstName} ${formData.lastName}`],
        ["Age / Sex", `${formData.age || "N/A"} / ${formData.sex || "N/A"}`],
        ["Civil Status", formData.civilStatus || "N/A"],
        ["Occupation", formData.occupation || "N/A"],
      ],
      theme: "striped",
      styles: { fontSize: 9 }
    });

    y = doc.lastAutoTable.finalY + 12;
  }

  // ===== PERPETRATOR =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Alleged Perpetrator Information", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    body: [
      ["Name", `${formData.perpFirstName} ${formData.perpLastName}`],
      ["Alias", formData.perpAlias || "N/A"],
      ["Relationship to Victim", formData.perpRelationship || "N/A"],
      ["Age / Sex", `${formData.perpAge || "N/A"} / ${formData.perpSex || "N/A"}`],
    ],
    theme: "striped",
    styles: { fontSize: 9 }
  });

  y = doc.lastAutoTable.finalY + 12;

  // ===== INCIDENT DETAILS =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Incident Details", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    body: [
      ["Date of Incident", formData.latestIncidentDate || "N/A"],
      ["Place of Incident", formData.placeOfIncident || "N/A"],
      ["Violation(s)", formData.incidentTypes?.join(", ") || "N/A"],
    ],
    theme: "grid",
    headStyles: { fillColor: [245, 243, 255], textColor: purpleTheme },
    styles: { fontSize: 9 }
  });

  y = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Narrative Account:", 14, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const splitDescription = doc.splitTextToSize(formData.incidentDescription || "No description provided.", 180);
  doc.text(splitDescription, 14, y);
  y += (splitDescription.length * 5) + 12;

  // ===== ATTACHMENTS & EVIDENCE =====
  if (formData.attachments && formData.attachments.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 25;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(purpleTheme[0], purpleTheme[1], purpleTheme[2]);
    doc.text("Attachments & Evidence", 14, y);
    y += 10;

    const images = formData.attachments.filter(att =>
      att.file?.type?.startsWith('image/') || att.type === 'image'
    );
    const others = formData.attachments.filter(att =>
      !att.file?.type?.startsWith('image/') && att.type !== 'image'
    );

    // List Non-image files
    if (others.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      others.forEach(att => {
        doc.text(`• Document Provided: ${att.name || att.fileName || 'Unnamed File'} (${att.type || 'unknown'})`, 16, y);
        y += 6;
      });
      y += 5;
    }

    // Embed Images
    const getBase64 = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    };

    for (const att of images) {
      if (y > 220) {
        doc.addPage();
        y = 25;
      }

      try {
        const base64 = await getBase64(att.file);
        // Display filename above image
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`File: ${att.name || 'Image Evidence'}`, 14, y - 2);

        doc.addImage(base64, 'JPEG', 14, y, 180, 100, undefined, 'FAST');
        y += 110;
      } catch (err) {
        console.error("Image embed error in report:", err);
        doc.text(`[Unloadable Image: ${att.name}]`, 14, y);
        y += 10;
      }
    }
  }

  // ===== FOOTER & PAGE NUMBERS =====
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `TUPT-GAD-CONFIDENTIAL | Page ${i} of ${pageCount}`,
      105,
      285,
      { align: "center" }
    );
    doc.text(`Ref: ${ticketNumber}`, 196, 285, { align: "right" });
  }

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
    const baseURL = import.meta.env.VITE_API_URL || 'https://reactnative-etala.onrender.com/api';

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