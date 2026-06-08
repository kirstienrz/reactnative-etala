/**
 * appointmentWorkflowService.js
 *
 * Encapsulates ALL status-transition side-effects that arise from the
 * appointment lifecycle.  The React components and the backend controllers
 * both import from here so the business rules live in one place.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Event                       │  caseStatus transition                   │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │  User submits booking request│  any → "For Scheduling"                  │
 * │  Admin approves appointment  │  "For Scheduling" → "For Interview"       │
 * │  Appointment cancelled       │  "For Interview"/"For Scheduling" → prev* │
 * │  User requests another time  │  "For Interview" → "For Scheduling"       │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 *  * On cancellation the status reverts to "For Queuing" (the last manually
 *    set status before the booking workflow started).
 */

import { buildStatusMessage } from "./reportStatusService.js";
import { sendTicketMessage } from "../api/tickets.js";
import {
  updateReportStatus as apiUpdateReportStatus,
} from "../api/report.js";

// ─── Transition helpers (pure logic, no side-effects) ────────────────────────

/**
 * Status the report should move to when a user submits a booking request.
 * Always "For Scheduling" — the previous status is not relevant.
 */
export const statusOnBookingSubmitted = () => "For Scheduling";

/**
 * Status the report should move to when an admin approves an appointment.
 * Always "For Interview".
 */
export const statusOnAppointmentApproved = () => "For Interview";

/**
 * Status the report should revert to when an appointment is cancelled
 * or when the user requests another time.
 *
 * @param {string} previousCaseStatus - caseStatus before booking was submitted
 * @returns {string}
 */
export const statusOnAppointmentCancelled = (previousCaseStatus) =>
  previousCaseStatus && previousCaseStatus !== "For Scheduling" && previousCaseStatus !== "For Interview"
    ? previousCaseStatus
    : "For Queuing";

// ─── Async side-effect orchestrators ─────────────────────────────────────────

/**
 * Called by the booking form when a user submits an appointment request.
 * Sets report caseStatus to "For Scheduling" and sends a chat notification.
 *
 * @param {string} reportId
 * @param {string} ticketNumber
 * @param {string} currentStatus - existing caseStatus (stored for revert)
 * @returns {Promise<void>}
 */
export const handleBookingSubmitted = async (reportId, ticketNumber, currentStatus) => {
  // 1. Update the report status via the existing API
  await apiUpdateReportStatus(reportId, currentStatus, "", statusOnBookingSubmitted());

  // 2. Notify the reporter via chat
  const msg = buildStatusMessage(ticketNumber, "For Scheduling");
  await sendTicketMessage(ticketNumber, { content: msg, attachments: [] });
};

/**
 * Called by the admin approval flow after persisting the appointment approval.
 * Sets report caseStatus to "For Interview" and sends a chat notification.
 *
 * @param {string} reportId
 * @param {string} ticketNumber
 * @param {{ date: string, startTime: string }} appointmentDetails
 * @returns {Promise<void>}
 */
export const handleAppointmentApproved = async (
  reportId,
  ticketNumber,
  appointmentDetails = {}
) => {
  await apiUpdateReportStatus(reportId, "For Scheduling", "", statusOnAppointmentApproved());

  const msg = buildStatusMessage(ticketNumber, "For Interview", appointmentDetails);
  await sendTicketMessage(ticketNumber, { content: msg, attachments: [] });
};

/**
 * Called after an appointment is cancelled (by admin or user).
 * Reverts caseStatus and notifies via chat.
 *
 * @param {string} reportId
 * @param {string} ticketNumber
 * @param {string} currentCaseStatus
 * @param {string} cancelReason
 * @returns {Promise<void>}
 */
export const handleAppointmentCancelled = async (
  reportId,
  ticketNumber,
  currentCaseStatus,
  cancelReason = ""
) => {
  const revertTo = statusOnAppointmentCancelled(currentCaseStatus);
  await apiUpdateReportStatus(reportId, currentCaseStatus, cancelReason, revertTo);

  const cancelMsg =
    `❌ Appointment Cancelled\n\nAng iyong appointment para sa case (${ticketNumber}) ay nakansela.\n` +
    (cancelReason ? `\nDahilan: ${cancelReason}\n` : "") +
    `\nAng status ng iyong case ay nabalik sa: ${revertTo}.`;

  await sendTicketMessage(ticketNumber, { content: cancelMsg, attachments: [] });
};

/**
 * Called when a user requests another time after admin reschedule.
 * Status goes back to "For Scheduling" (pending a new approval).
 *
 * @param {string} reportId
 * @param {string} ticketNumber
 * @returns {Promise<void>}
 */
export const handleRequestAnotherTime = async (reportId, ticketNumber) => {
  await apiUpdateReportStatus(reportId, "For Interview", "", "For Scheduling");

  const msg = buildStatusMessage(ticketNumber, "For Scheduling");
  await sendTicketMessage(ticketNumber, { content: msg, attachments: [] });
};
