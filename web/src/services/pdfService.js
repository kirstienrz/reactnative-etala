/**
 * pdfService.js
 *
 * Referral PDF generation logic extracted from AdminReports.jsx.
 * Depends on jsPDF + jspdf-autotable.
 */

import { jsPDF    } from "jspdf";
import autoTable    from "jspdf-autotable";

const PURPLE = [126, 34, 206];

// ─── Image helpers ────────────────────────────────────────────────────────────

const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result);
    r.onerror   = () => rej(new Error("FileReader failed"));
    r.readAsDataURL(file);
  });

const urlToBase64 = async (src) => {
  try {
    const blob = await fetch(src).then((r) => r.blob());
    return fileToBase64(blob);
  } catch {
    return null;
  }
};

const getBase64 = (src) => {
  const isFile = src instanceof File || (src?.name && src?.size);
  return isFile ? fileToBase64(src) : urlToBase64(src);
};

const isImageAttachment = (a) => {
  if (a instanceof File || a?.name) {
    return a.type?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(a.name ?? "");
  }
  return a?.uri && /image|\.(jpg|jpeg|png|webp|gif)$/i.test((a.uri ?? "") + (a.fileName ?? ""));
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a jsPDF document for a referral (Internal or External).
 *
 * @param {object} report   - Full report object
 * @param {object} referral - Referral payload
 * @returns {Promise<jsPDF>}
 */
export const generateReferralPDFDoc = async (report, referral) => {
  const doc = new jsPDF();

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setTextColor(...PURPLE);
  doc.text(`${referral.referralType ?? "Internal"} Referral Report`, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Reference Ticket: ${report.ticketNumber}`, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  let y = 50;

  // ── Incident overview ────────────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Incident Overview", 14, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Field", "Content"]],
    body: [
      ["Incident Category", report.category ?? "N/A"],
      ["Salaysay", report.salaysay ?? "No statement provided"],
      ["Date Reported", report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : "N/A"],
      ["Current Case Status", report.caseStatus ?? "N/A"],
    ],
    theme: "grid",
    headStyles: { fillColor: [245, 243, 255], textColor: PURPLE, fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
  });
  y = (doc.lastAutoTable?.finalY ?? y + 40) + 15;

  // ── Reporter (identified anonymous) ─────────────────────────────────────────
  if (report.isAnonymous && report.identifiedUserId) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Reporter Information", 14, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Details"]],
      body: [
        ["Reporter Name", `${report.identifiedUserId.firstName ?? ""} ${report.identifiedUserId.lastName ?? ""}`.trim()],
        ["TUP ID",        report.identifiedUserId.tupId  ?? "N/A"],
        ["Email",         report.identifiedUserId.email  ?? "N/A"],
        ["Identified At", report.identifiedAt ? new Date(report.identifiedAt).toLocaleDateString() : "N/A"],
        ["Reason",        report.identificationReason    ?? "N/A"],
      ],
      theme: "striped",
      headStyles: { fillColor: PURPLE },
      styles: { fontSize: 9, cellPadding: 3 },
    });
    y = (doc.lastAutoTable?.finalY ?? y + 40) + 15;
  }

  // ── Referral info ────────────────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Referral Information", 14, y);
  y += 10;

  const refRows =
    referral.referralType === "External"
      ? [
          ["Target Barangay",   referral.barangayName      ?? "N/A"],
          ["Barangay Address",  referral.barangayAddress   ?? "N/A"],
          ["Receiving Officer", referral.receivingOfficer  ?? "N/A"],
          ["Endorsement Mode",  referral.endorsementMode   ?? "N/A"],
          ["Referred By",       referral.referredBy        ?? "N/A"],
          ["Position",          referral.position          ?? "N/A"],
          ["School Name",       referral.schoolName        ?? "N/A"],
        ]
      : [
          ["Target Department",       referral.department ?? "N/A"],
          ["Internal Note / Remarks", referral.note       ?? "No notes provided"],
        ];

  refRows.push([
    "Date of Referral",
    new Date(referral.date ?? referral.referralTimestamp ?? Date.now()).toLocaleString(),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Referral Property", "Details"]],
    body: refRows,
    theme: "striped",
    headStyles: { fillColor: PURPLE },
    styles: { fontSize: 9, cellPadding: 3 },
  });
  y = (doc.lastAutoTable?.finalY ?? y + 40) + 15;

  // ── Reason (external only) ───────────────────────────────────────────────────
  if (referral.referralType === "External" && referral.reason) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Reason for Referral", 14, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(referral.reason, 180);
    doc.text(lines, 14, y);
    y += lines.length * 6 + 15;
  }

  // ── Images ───────────────────────────────────────────────────────────────────
  const refImgs  = (referral.attachments ?? []).filter(isImageAttachment);
  const fallback = (report.attachments   ?? []).filter(
    (a) => a?.uri && /image/i.test((a.uri ?? "") + (a.fileName ?? ""))
  );
  const imgs = refImgs.length ? refImgs : fallback;

  if (imgs.length) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PURPLE);
    doc.text("Attached Evidence / Media", 14, y);
    y += 10;

    for (const att of imgs) {
      if (y > 220) { doc.addPage(); y = 20; }
      const src  = att instanceof File || att?.name ? att : att.uri;
      const b64  = await getBase64(src);
      if (b64) {
        try {
          doc.addImage(b64, "JPEG", 14, y, 180, 100, undefined, "FAST");
          y += 110;
        } catch {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`[Image: ${att?.name ?? att?.fileName ?? "attachment"}]`, 14, y);
          y += 10;
        }
      }
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`INSPIRE ERS - Official Referral Report | Page ${i} of ${pages}`, 14, 285);
    doc.text(`Ticket #${report.ticketNumber}`, 170, 285);
  }

  return doc;
};
