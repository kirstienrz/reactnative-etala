/**
 * notificationService.js
 *
 * Centralises all notification concerns for the report-management workflow:
 *  - In-app toast messages  (returns objects for the UI to display)
 *  - Chat / ticket messages (calls the ticket API)
 *  - Composed payloads for PDF notifications
 *
 * Nothing in this file makes direct React state calls — it returns data/
 * promises that the calling component can act on.
 */

import { sendTicketMessage } from "../api/tickets.js";
import { sendReferralPDFToUser } from "../api/report.js";
import { buildStatusMessage, isInternalStatus } from "./reportStatusService.js";
import { generateReferralPDFDoc } from "./pdfService.js";

// ─── Toast helpers ────────────────────────────────────────────────────────────

/**
 * @typedef {{ message: string, type: "success" | "error" | "info" }} ToastPayload
 */

/** @returns {ToastPayload} */
export const toastSuccess = (message) => ({ message, type: "success" });
/** @returns {ToastPayload} */
export const toastError   = (message) => ({ message, type: "error"   });
/** @returns {ToastPayload} */
export const toastInfo    = (message) => ({ message, type: "info"    });

// ─── Chat notification senders ────────────────────────────────────────────────

/**
 * Send a case-status change notification to the reporter's ticket chat.
 *
 * @param {string} ticketNumber
 * @param {string} newStatus
 * @param {object} [extra]     - Additional context (e.g. { date, startTime } for interview)
 * @returns {Promise<void>}
 */
export const notifyStatusChange = async (ticketNumber, newStatus, extra = {}) => {
  const content = buildStatusMessage(ticketNumber, newStatus, extra);
  await sendTicketMessage(ticketNumber, { content, attachments: [] });
};

// ─── Referral PDF notification ────────────────────────────────────────────────

/**
 * Generate a referral PDF and send it to the user via chat message.
 *
 * @param {object} report      - Full report object
 * @param {object} referral    - Referral data (Internal or External)
 * @returns {Promise<void>}
 */
export const sendReferralNotification = async (report, referral) => {
  const { ticketNumber } = report;
  const isExternal = referral.referralType === "External";

  const chatContent = isExternal
    ? `📢 Case Status Update\n\nAng iyong case (${ticketNumber}) ay opisyal nang ni-refer sa Barangay ${referral.barangayName}.\n\n📋 Referral Type: External\n🏘️ Barangay: ${referral.barangayName}\n👤 Receiving Officer: ${referral.receivingOfficer ?? "N/A"}\n\n📄 Naka-attach ang Referral Report PDF sa ibaba.`
    : `📢 Case Status Update\n\nAng iyong case (${ticketNumber}) ay ni-refer sa ${referral.department}.\n\n📋 Referral Type: Internal\n🏢 Department: ${referral.department}\n\n📄 Naka-attach ang Referral Report PDF sa ibaba.`;

  const pdfDoc  = await generateReferralPDFDoc(report, referral);
  const pdfBlob = pdfDoc.output("blob");
  const pdfFile = new File(
    [pdfBlob],
    `${isExternal ? "External" : "Internal"}_Referral_${ticketNumber}.pdf`,
    { type: "application/pdf" }
  );

  const form = new FormData();
  form.append("pdf", pdfFile);
  form.append("ticketNumber", ticketNumber);
  form.append("content", chatContent);

  await sendReferralPDFToUser(form);
};

// ─── Appointment-workflow notifications ───────────────────────────────────────

/**
 * Notify the reporter that their booking request was received and is pending.
 */
export const notifyBookingPending = async (ticketNumber) => {
  const content =
    `📅 Appointment Request Received\n\nNatanggap na namin ang iyong kahilingan sa appointment para sa case (${ticketNumber}).\n\nNaka-pending ito para sa pag-apruba ng admin. Abangan ang notification.`;
  await sendTicketMessage(ticketNumber, { content, attachments: [] });
};

/**
 * Notify the reporter that their appointment was approved.
 */
export const notifyAppointmentApproved = async (ticketNumber, { date, startTime } = {}) => {
  const content = buildStatusMessage(ticketNumber, "For Interview", { date, startTime });
  await sendTicketMessage(ticketNumber, { content, attachments: [] });
};

/**
 * Notify the reporter that their appointment was cancelled.
 */
export const notifyAppointmentCancelled = async (
  ticketNumber,
  revertedTo,
  reason = ""
) => {
  const content =
    `❌ Appointment Cancelled\n\nAng iyong appointment para sa case (${ticketNumber}) ay nakansela.\n` +
    (reason ? `\nDahilan: ${reason}\n` : "") +
    `\nAng status ng iyong case ay nabalik sa: ${revertedTo}.`;
  await sendTicketMessage(ticketNumber, { content, attachments: [] });
};
