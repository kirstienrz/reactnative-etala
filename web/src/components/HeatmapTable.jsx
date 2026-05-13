import React, { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart2, Info } from "lucide-react";

// ─── Color ramps: 6-stop sequential palettes ──────────────────────────────────
const COLOR_RAMPS = {
  vibrant: ["#3b82f6", "#10b981", "#f59e0b", "#f97316", "#ef4444"], // Blue -> Green -> Yellow -> Orange -> Red
  amber: ["#FFFBEB", "#FDE68A", "#FCD34D", "#F59E0B", "#B45309", "#78350F"],
  teal: ["#F0FDFA", "#99F6E4", "#2DD4BF", "#0D9488", "#0F766E", "#134E4A"],
  rose: ["#FFF1F2", "#FECDD3", "#FDA4AF", "#F43F5E", "#BE123C", "#881337"],
};

// Lerp two hex stops
function lerpHex(a, b, t) {
  const parse = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const [r1, g1, b1] = parse(a), [r2, g2, b2] = parse(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function getHeatColor(value, maxVal, rampKey = "vibrant") {
  if (!value || maxVal === 0) return null;
  const stops = COLOR_RAMPS[rampKey] ?? COLOR_RAMPS.vibrant;
  const ratio = Math.max(0, Math.min(1, value / maxVal));
  const scaled = ratio * (stops.length - 1);
  const lo = Math.floor(scaled), hi = Math.ceil(scaled);
  return lo === hi ? stops[lo] : lerpHex(stops[lo], stops[hi], scaled - lo);
}

// Perceived luminance → dark or light text
function isDarkBg(rgb) {
  if (!rgb) return false;
  const m = rgb.match(/\d+/g);
  if (!m) return false;
  const [r, g, b] = m.map(Number);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ active, dir }) {
  const cls = `shrink-0 transition-colors ${active ? "text-blue-600" : "text-gray-300 group-hover:text-gray-400"}`;
  if (!active) return <ArrowUpDown size={11} className={cls} />;
  return dir === "asc" ? <ArrowUp size={11} className={cls} /> : <ArrowDown size={11} className={cls} />;
}

// ─── HeatmapTable ─────────────────────────────────────────────────────────────
const HeatmapTable = ({
  title,
  subtitle,
  rows = [],
  columns = [],
  data = {},
  rowLabel = "Category",
  colorScheme = "vibrant",
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [hoverRow, setHoverRow] = useState(null);
  const [hoverCol, setHoverCol] = useState(null);
  const [showPct, setShowPct] = useState(false);

  // ── Derived numbers ──────────────────────────────────────────────────────
  const rowTotals = useMemo(() => {
    const t = {};
    rows.forEach(r => { t[r] = columns.reduce((s, c) => s + (data[r]?.[c] ?? 0), 0); });
    return t;
  }, [rows, columns, data]);

  const colTotals = useMemo(() => {
    const t = {};
    columns.forEach(c => { t[c] = rows.reduce((s, r) => s + (data[r]?.[c] ?? 0), 0); });
    return t;
  }, [rows, columns, data]);

  const grandTotal = useMemo(() =>
    rows.reduce((s, r) => s + rowTotals[r], 0), [rows, rowTotals]);

  const maxVal = useMemo(() => {
    const vals = rows.flatMap(r => columns.map(c => data[r]?.[c] ?? 0));
    return vals.length > 0 ? Math.max(...vals) : 0;
  }, [rows, columns, data]);

  // ── Sorting ──────────────────────────────────────────────────────────────
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      let av, bv;
      if (sortKey === "__name__") { return sortDir === "asc" ? a.localeCompare(b) : b.localeCompare(a); }
      if (sortKey === "__total__") { av = rowTotals[a]; bv = rowTotals[b]; }
      else { av = data[a]?.[sortKey] ?? 0; bv = data[b]?.[sortKey] ?? 0; }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [rows, sortKey, sortDir, rowTotals, data]);

  // ── Formatters ───────────────────────────────────────────────────────────
  const fmtCell = (v) => !v ? "—" : showPct ? `${((v / Math.max(1, grandTotal)) * 100).toFixed(1)}%` : v.toLocaleString();
  const fmtTotal = (v) => showPct ? `${((v / Math.max(1, grandTotal)) * 100).toFixed(1)}%` : v.toLocaleString();

  // ── Color ramp legend stops ───────────────────────────────────────────────
  const rampStops = COLOR_RAMPS[colorScheme] ?? COLOR_RAMPS.vibrant;

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-100 text-sm select-none transition-all duration-300 hover:shadow-2xl relative">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-50 bg-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 leading-tight truncate text-lg tracking-tight">{title}</p>
            <div className="group relative">
              <Info size={14} className="text-gray-300 cursor-help hover:text-blue-500 transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                Darker colors indicate higher frequency or values in the dataset.
              </div>
            </div>
          </div>
          {subtitle && <p className="text-xs font-medium text-gray-400 mt-0.5 leading-tight">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* % toggle */}
          <button
            onClick={() => setShowPct(p => !p)}
            className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all ${showPct
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
              : "bg-white text-gray-400 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            title={showPct ? "Show raw values" : "Show % of total"}
          >
            {showPct ? "%" : "#"}
          </button>

          {/* Legend */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400">0</span>
            <div className="flex rounded-full overflow-hidden" style={{ height: 6, width: 80 }}>
              {rampStops.map((stop, i) => (
                <div key={i} className="flex-1" style={{ background: stop }} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-gray-400">{maxVal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto p-4 overflow-hidden rounded-b-2xl">
        <table className="w-full min-w-max border-separate border-spacing-1">
          <thead>
            <tr>
              <th
                className="group sticky left-0 z-20 bg-gray-50 px-3 py-2 text-left font-bold text-[10px] text-gray-500 uppercase tracking-widest border border-gray-100 cursor-pointer rounded-xl transition-colors hover:bg-blue-50"
                onClick={() => toggleSort("__name__")}
                style={{ minWidth: 160 }}
              >
                <span className="flex items-center gap-1">
                  {rowLabel}
                  <SortIcon active={sortKey === "__name__"} dir={sortDir} />
                </span>
              </th>

              {columns.map(col => (
                <th
                  key={col}
                  className={`group px-2 py-2 text-center font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all border border-gray-100 rounded-xl ${hoverCol === col
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                    : "bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                    }`}
                  style={{ minWidth: 85 }}
                  onClick={() => toggleSort(col)}
                  onMouseEnter={() => setHoverCol(col)}
                  onMouseLeave={() => setHoverCol(null)}
                >
                  <span className="flex items-center justify-center gap-1">
                    <span className="truncate" style={{ maxWidth: 65 }}>{col}</span>
                    <SortIcon active={sortKey === col} dir={sortDir} />
                  </span>
                </th>
              ))}

              <th
                className="group px-3 py-2 text-right font-bold text-[10px] uppercase tracking-widest text-gray-500 bg-gray-50 border border-gray-100 cursor-pointer hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl"
                style={{ minWidth: 85 }}
                onClick={() => toggleSort("__total__")}
              >
                <span className="flex items-center justify-end gap-1">
                  Total
                  <SortIcon active={sortKey === "__total__"} dir={sortDir} />
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row}
                className="group"
                onMouseEnter={() => setHoverRow(row)}
                onMouseLeave={() => setHoverRow(null)}
              >
                <td
                  className={`sticky left-0 z-10 px-3 py-2 text-[10px] font-bold border border-gray-100 transition-all rounded-xl ${hoverRow === row ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" : "bg-white text-gray-600"
                    }`}
                >
                  <span className="truncate block" style={{ maxWidth: 145 }}>{row}</span>
                </td>

                {columns.map(col => {
                  const val = data[row]?.[col] ?? 0;
                  const bgColor = getHeatColor(val, maxVal, colorScheme);
                  const onCol = hoverCol === col;
                  const onRow = hoverRow === row;
                  const dark = isDarkBg(bgColor);

                  return (
                    <td
                      key={col}
                      className={`px-2 py-2 text-center tabular-nums font-bold text-xs transition-all duration-200 h-11 border rounded-xl ${onCol || onRow ? "border-blue-200" : "border-transparent"
                        } ${!bgColor && onCol ? "bg-blue-50/50" : ""} ${!bgColor && onRow && !onCol ? "bg-gray-50/50" : ""}`}
                      style={{
                        backgroundColor: bgColor ?? undefined,
                        color: bgColor ? (dark ? "#fff" : "#1e40af") : (onRow || onCol ? "#2563eb" : "#94a3b8"),
                        transform: onRow && onCol ? "scale(1.05)" : "scale(1)",
                        zIndex: onRow && onCol ? 20 : 1,
                        boxShadow: onRow && onCol ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none"
                      }}
                      onMouseEnter={() => setHoverCol(col)}
                      onMouseLeave={() => setHoverCol(null)}
                    >
                      {fmtCell(val)}
                    </td>
                  );
                })}

                <td
                  className={`px-3 py-2 text-right tabular-nums font-bold text-xs border border-gray-100 transition-all rounded-xl ${hoverRow === row ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-500"
                    }`}
                >
                  {fmtTotal(rowTotals[row])}
                </td>
              </tr>
            ))}

            <tr className="border-t-2 border-gray-100">
              <td className="sticky left-0 z-10 px-3 py-3 text-[10px] font-bold uppercase text-gray-500 bg-gray-50 border border-gray-100 rounded-xl">
                Year Total
              </td>
              {columns.map(col => (
                <td
                  key={col}
                  className={`px-2 py-3 text-center tabular-nums font-bold text-xs bg-gray-50 transition-all border border-gray-100 rounded-xl ${hoverCol === col ? "bg-blue-50 text-blue-700" : "text-gray-400"
                    }`}
                  onMouseEnter={() => setHoverCol(col)}
                  onMouseLeave={() => setHoverCol(null)}
                >
                  {fmtTotal(colTotals[col])}
                </td>
              ))}
              <td className="px-3 py-3 text-right tabular-nums font-bold text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl">
                {showPct ? "100%" : grandTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50 bg-gray-50/50">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {rows.length} {rowLabel.toLowerCase()}s analyzed · {columns.length} {rowLabel === 'Gender' ? 'categories' : 'months'}
        </span>
        <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-widest">
          <BarChart2 size={12} className="opacity-70" />
          Sorted by {sortKey === "__name__" ? rowLabel : sortKey === "__total__" ? "Total" : sortKey || "Date"} ({sortDir})
        </span>
      </div>
    </div>
  );
};

export default HeatmapTable;