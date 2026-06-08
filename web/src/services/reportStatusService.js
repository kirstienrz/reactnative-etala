/**
 * reportStatusService.js
 *
 * Central authority for report case-status definitions, UI helpers,
 * and progression-rule enforcement.
 *
 * STATUS LIFECYCLE (enforced by isStatusAllowed):
 *
 *   For Queuing  ──► For Scheduling ──► For Interview** ──► For Referral ──► Case Closed
 *                                                                │
 *                                                                └──► Internal - <Dept>
 *
 *  * "For Scheduling" can be set manually by admin or automatically when a user
 *    submits a booking request.
 *
 * ** "For Interview" is SYSTEM-ONLY — set automatically when an admin
 *    approves an appointment. It is never manually selectable.
 */

// ─── Ordered pipeline (index = precedence) ───────────────────────────────────
export const STATUS_ORDER = [
  "For Queuing",      // 0 — initial state after report submission
  "For Scheduling",   // 1 — auto-set when user submits booking request
  "For Interview",    // 2 — auto-set when admin approves appointment
  "For Referral",     // 3 — manually set by admin after interview
  "Case Closed",      // 4 — terminal state
];

// Internal referral statuses are orthogonal to the main pipeline
export const isInternalStatus = (s) => typeof s === "string" && s.startsWith("Internal - ");

// ─── Badge colours ────────────────────────────────────────────────────────────
const STATUS_COLOR_MAP = {
  "For Queuing":    "bg-orange-100 text-orange-800 border-orange-200",
  "For Scheduling": "bg-blue-100   text-blue-800   border-blue-200",
  "For Interview":  "bg-cyan-100   text-cyan-800   border-cyan-200",
  "For Referral":   "bg-pink-100   text-pink-800   border-pink-200",
  "Case Closed":    "bg-gray-100   text-gray-800   border-gray-200",
};

export const getCaseStatusColor = (s) => {
  if (isInternalStatus(s)) return "bg-purple-100 text-purple-800 border-purple-200";
  return STATUS_COLOR_MAP[s] ?? "bg-gray-100 text-gray-800 border-gray-200";
};

// ─── Badge icons (React elements — import lucide-react in consumer) ───────────
// We keep this as a lookup of string icon-names so the service stays framework-
// agnostic; the React layer maps them to actual <Icon /> components.
export const STATUS_ICON_NAME = {
  "For Queuing":    "ClipboardList",
  "For Scheduling": "Calendar",
  "For Interview":  "Users",
  "For Referral":   "Share2",
  "Case Closed":    "XCircle",
  Internal:         "Share2",
  default:          "AlertCircle",
};

export const getCaseStatusIconName = (s) => {
  if (isInternalStatus(s)) return STATUS_ICON_NAME.Internal;
  return STATUS_ICON_NAME[s] ?? STATUS_ICON_NAME.default;
};

// ─── Progression rules ────────────────────────────────────────────────────────
/**
 * Returns true when `option` is a VALID manual transition FROM `current`.
 *
 * Rules:
 *  - "For Queuing"    → only if current is null / undefined (not yet assigned)
 *  - "For Scheduling" → allowed when current is "For Queuing"
 *  - "For Interview"  → DISABLED entirely — set automatically by appointment approval
 *  - "For Referral"   → only when current is "For Interview"
 *  - "Case Closed"    → only when current is "For Interview" or "For Referral"
 *                        or an Internal status
 */
export const isStatusAllowed = (option, current) => {
  switch (option) {
    case "For Queuing":
      // Allowed only as first assignment; cannot revisit once past.
      return !current || current === "For Queuing";

    case "For Scheduling":
      // Allowed when current is "For Queuing"
      return current === "For Queuing" || current === "For Scheduling";

    case "For Interview":
      // System-only — never manually settable.
      return false;

    case "For Referral":
      return current === "For Interview";

    case "Case Closed":
      return (
        current === "For Interview" ||
        current === "For Referral" ||
        isInternalStatus(current)
      );

    default:
      return false;
  }
};

/**
 * Returns true when the option should be DISABLED in a <select> / UI.
 * Inverse of isStatusAllowed.
 */
export const isStatusDisabled = (option, current) => !isStatusAllowed(option, current);

// ─── Human-readable labels for filter dropdowns ──────────────────────────────
export const CASE_STATUS_FILTER_OPTIONS = [
  "All",
  "For Queuing",
  "For Scheduling",
  "For Interview",
  "Internal",        // matches any "Internal - <Dept>"
  "For Referral",
  "Case Closed",
];

// ─── Chat notification messages (admin → reporter) ───────────────────────────
export const buildStatusMessage = (ticketNumber, status, extra = {}) => {
  const msgs = {
    "For Queuing": `📋 Case Status Update\n\nAng iyong case (${ticketNumber}) ay nasa status na: For Queuing.\n\nMalapit na itong ma-review ng aming team.`,

    "For Scheduling":
      `📅 Appointment Request Received\n\nNatanggap na namin ang iyong kahilingan sa appointment para sa case (${ticketNumber}).\n\nNaka-pending ito para sa pag-apruba ng admin. Abangan ang notification pagkatapos nito.`,

    "For Interview":
      `✅ Appointment Approved\n\nAng iyong appointment para sa case (${ticketNumber}) ay na-aprubahan na.\n\nDetalye:\n📅 Petsa: ${extra.date ?? "TBD"}\n⏰ Oras: ${extra.startTime ?? "TBD"}\n\nMangyaring maging handa sa takdang oras.`,

    Internal:
      `📋 Case Status Update\n\nAng iyong case (${ticketNumber}) ay ni-refer sa isang internal department para sa karagdagang aksyon.\n\nReferral Type: Internal`,

    "Case Closed":
      `📋 Case Status Update\n\nAng iyong case (${ticketNumber}) ay opisyal nang isinara (Case Closed).\n\nKung may mga katanungan ka pa, huwag mag-atubiling mag-mensahe.`,
  };

  if (isInternalStatus(status)) return msgs.Internal;
  return msgs[status] ?? `📋 Case Status Update\n\nAng iyong case (${ticketNumber}) ay na-update na sa: ${status}.`;
};
