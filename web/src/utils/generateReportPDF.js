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

  // ===== DOWNLOAD =====
  doc.save(`TUP_GAD_Report_${ticketNumber}.pdf`);
};
