/**
 * reportUIHelpers.jsx
 *
 * Pure presentational helpers for the Report Management screens.
 * No API calls, no state. Import and use freely in any component.
 */

import React from "react";
import {
  AlertTriangle, Activity, Shield, Brain,
  ClipboardList, Calendar, Users, Share2, XCircle, AlertCircle,
} from "lucide-react";
import {
  getCaseStatusColor as _color,
  getCaseStatusIconName,
} from "./reportStatusService.js";

// ─── Re-export colour helper (keeps imports clean in consumers) ───────────────
export { getCaseStatusColor } from "./reportStatusService.js";

// ─── Case-status badge icon ───────────────────────────────────────────────────
const ICON_MAP = {
  ClipboardList, Calendar, Users, Share2, XCircle, AlertCircle,
};

/**
 * Returns a <LucideIcon size={14} /> element for the given case status string.
 */
export const getCaseStatusIcon = (status) => {
  const name = getCaseStatusIconName(status);
  const Icon = ICON_MAP[name] ?? AlertCircle;
  return <Icon size={14} />;
};

// ─── Severity helpers ─────────────────────────────────────────────────────────

/**
 * Tailwind class string for a severity badge.
 * @param {"severe"|"moderate"|"mild"|string} s
 */
export const getSeverityColor = (s) => {
  const map = {
    severe:   "bg-red-100    text-red-800    border-red-200",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    mild:     "bg-green-100  text-green-800  border-green-200",
  };
  return map[s?.toLowerCase()] ?? "bg-gray-100 text-gray-800 border-gray-200";
};

/**
 * Lucide icon element for a severity level.
 */
export const getSeverityIcon = (s) => {
  const map = {
    severe:   <AlertTriangle size={14} className="text-red-600"    />,
    moderate: <Activity      size={14} className="text-yellow-600" />,
    mild:     <Shield        size={14} className="text-green-600"  />,
  };
  return map[s?.toLowerCase()] ?? <Brain size={14} className="text-gray-400" />;
};

// ─── Severity stats calculator ────────────────────────────────────────────────

/**
 * Counts reports by severity level from the combined reports list +
 * locally-cached sentiment results.
 *
 * @param {object[]} reports          - Active (non-archived) reports
 * @param {object}   sentimentResults - { [reportId]: { severity, confidence } }
 * @returns {{ severe: number, moderate: number, mild: number, unanalyzed: number }}
 */
export const getSeverityStats = (reports, sentimentResults) => {
  const stats = { severe: 0, moderate: 0, mild: 0, unanalyzed: 0 };
  reports.forEach((r) => {
    const sev = sentimentResults[r._id]?.severity?.toLowerCase();
    if (sev && Object.prototype.hasOwnProperty.call(stats, sev)) {
      stats[sev]++;
    } else {
      stats.unanalyzed++;
    }
  });
  return stats;
};

// ─── InfoItem display component ───────────────────────────────────────────────

/**
 * Labelled field display used inside report detail modals.
 *
 * @param {{ label: string, value?: any, fallback?: string }} props
 */
export const InfoItem = ({ label, value, fallback = null }) => {
  const v = String(value ?? "")
    .replace(/undefined/g, "")
    .trim();

  if (!v || v === "/" || v === ",") {
    if (!fallback) return null;
    return (
      <div>
        <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
          {label}
        </label>
        <p className="text-gray-400 text-xs font-medium leading-tight italic">
          {fallback}
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-0.5">
        {label}
      </label>
      <p className="text-gray-900 text-sm font-medium leading-tight">{v}</p>
    </div>
  );
};

// ─── Filtering / sorting helper ───────────────────────────────────────────────

/**
 * Apply all active filters + sort to a reports array.
 *
 * @param {object[]} reports
 * @param {object}   sentimentResults
 * @param {object}   filters
 * @param {string}   filters.searchTerm
 * @param {string}   filters.readStatusFilter       - "All" | "Read" | "Unread"
 * @param {string}   filters.caseStatusFilter       - "All" | any status
 * @param {string}   filters.internalDepartmentFilter
 * @param {string}   filters.categoryFilter
 * @param {string}   filters.sentimentFilter
 * @param {string}   filters.dateFrom               - YYYY-MM-DD
 * @param {string}   filters.dateTo                 - YYYY-MM-DD
 * @param {string}   filters.sortOrder              - "latest" | "oldest"
 * @param {Set}      readReportIds                  - set of report IDs marked read
 * @returns {object[]} filtered & sorted reports
 */
export const applyFilters = (reports, sentimentResults, filters, readReportIds) => {
  const {
    searchTerm,
    readStatusFilter,
    caseStatusFilter,
    internalDepartmentFilter,
    categoryFilter,
    sentimentFilter,
    dateFrom,
    dateTo,
    sortOrder,
  } = filters;

  const q = searchTerm.toLowerCase();

  return reports
    .filter((r) => {
      if (
        q &&
        !r.ticketNumber?.toLowerCase().includes(q) &&
        !r.salaysay?.toLowerCase().includes(q) &&
        !(r.createdBy?.tupId ?? "").toLowerCase().includes(q)
      ) return false;

      const isRead = readReportIds.has(r._id);
      if (readStatusFilter === "Read"   && !isRead) return false;
      if (readStatusFilter === "Unread" && isRead)  return false;

      if (caseStatusFilter !== "All") {
        if (caseStatusFilter === "Internal") {
          if (!r.caseStatus?.startsWith("Internal")) return false;
          if (
            internalDepartmentFilter !== "All" &&
            r.caseStatus !== `Internal - ${internalDepartmentFilter}`
          ) return false;
        } else if (r.caseStatus !== caseStatusFilter) {
          return false;
        }
      }

      if (categoryFilter !== "All" && !r.incidentTypes?.includes(categoryFilter)) return false;

      if (sentimentFilter !== "All") {
        const sev = sentimentResults[r._id]?.severity?.toLowerCase();
        if (sentimentFilter.toLowerCase() === "unanalyzed") {
          if (sev) return false;
        } else if (sev !== sentimentFilter.toLowerCase()) {
          return false;
        }
      }

      const d = new Date(r.submittedAt);
      if (dateFrom && d < new Date(dateFrom))                    return false;
      if (dateTo   && d > new Date(`${dateTo}T23:59:59`))        return false;

      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.submittedAt);
      const db = new Date(b.submittedAt);
      return sortOrder === "latest" ? db - da : da - db;
    });
};

/**
 * Count active (non-default) filter values for the badge display.
 */
export const countActiveFilters = (filters) =>
  [
    filters.readStatusFilter       !== "All",
    filters.caseStatusFilter       !== "All",
    filters.internalDepartmentFilter !== "All",
    filters.categoryFilter         !== "All",
    filters.dateFrom,
    filters.dateTo,
    filters.sortOrder              !== "latest",
    filters.sentimentFilter        !== "All",
  ].filter(Boolean).length;
