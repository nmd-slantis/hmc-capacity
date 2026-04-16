"use client";

import React from "react";
import { VISIBLE_MONTHS } from "@/config/months";
import { ProjectRow } from "./ProjectRow";
import type { CapacityRow } from "@/types/capacity";

interface CapacityTableProps {
  initialRows: CapacityRow[];
}

// Header bg + bullet color per group
const GROUP_STYLE: Record<string, { header: string; bullet: string }> = {
  "Ongoing":          { header: "bg-blue-700 text-white",    bullet: "bg-blue-300"    },
  "Service Pipeline": { header: "bg-orange-600 text-white",  bullet: "bg-orange-300"  },
  "To-Do":            { header: "bg-slate-600 text-white",   bullet: "bg-slate-400"   },
  "Sales Pipeline":   { header: "bg-amber-600 text-white",   bullet: "bg-amber-300"   },
  "Closed Won":       { header: "bg-emerald-700 text-white", bullet: "bg-emerald-300" },
  "Completed":        { header: "bg-green-700 text-white",   bullet: "bg-green-300"   },
  "Closed Lost":      { header: "bg-rose-600 text-white",    bullet: "bg-rose-300"    },
  "No Dates":         { header: "bg-gray-500 text-white",    bullet: "bg-gray-300"    },
};

// Shared colgroup for consistent column widths across all group tables
function ColGroup() {
  return (
    <colgroup>
      <col style={{ width: "220px" }} />
      <col style={{ width: "50px" }} />
      <col style={{ width: "95px" }} />
      <col style={{ width: "95px" }} />
      <col style={{ width: "60px" }} />
      <col style={{ width: "50px" }} />
      {VISIBLE_MONTHS.map((m) => (
        <React.Fragment key={m.key}>
          <col style={{ width: "48px" }} />
          <col style={{ width: "40px" }} />
        </React.Fragment>
      ))}
    </colgroup>
  );
}

// Shared thead with month labels and sub-headers
function TableHead() {
  return (
    <thead>
      <tr className="bg-[#202022] text-white">
        <th colSpan={6} className="px-3 py-2 text-left border-r-2 border-gray-500" />
        {VISIBLE_MONTHS.map((m, i) => (
          <th
            key={m.key}
            colSpan={2}
            className={`px-2 py-2 text-[11px] whitespace-nowrap ${
              i === 0
                ? "border-l-2 border-gray-400"
                : m.quarterStart
                ? "border-l-2 border-gray-500"
                : "border-l border-gray-700"
            }`}
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{m.label}</span>
              <span className="text-gray-400 font-normal">{m.workdayHours} hs</span>
            </div>
          </th>
        ))}
      </tr>
      <tr className="bg-[#2e2e30] text-gray-300 text-[10px] uppercase tracking-wider">
        <th className="px-3 py-1.5 text-left">Project / Deal</th>
        <th className="px-2 py-1.5 text-center">Src</th>
        <th className="px-2 py-1.5 text-left">Start</th>
        <th className="px-2 py-1.5 text-left">Finish</th>
        <th className="px-2 py-1.5 text-right">Effort h</th>
        <th className="px-2 py-1.5 text-center border-r-2 border-gray-600">SO</th>
        {VISIBLE_MONTHS.map((m, i) => (
          <React.Fragment key={m.key}>
            <th className={`px-1 py-1.5 text-right ${
              i === 0
                ? "border-l-2 border-gray-500"
                : m.quarterStart
                ? "border-l-2 border-gray-600"
                : "border-l border-gray-700"
            }`}>h</th>
            <th className="px-1 py-1.5 text-right bg-gray-800/40">FTE</th>
          </React.Fragment>
        ))}
      </tr>
    </thead>
  );
}

export function CapacityTable({ initialRows }: CapacityTableProps) {
  if (initialRows.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 rounded-xl border border-gray-200">
        No projects or deals found. Check your API credentials.
      </div>
    );
  }

  // Group rows by their precomputed group label, preserving sort order
  const groups: { label: string; rows: CapacityRow[] }[] = [];
  for (const row of initialRows) {
    const last = groups[groups.length - 1];
    if (last && last.label === row.group) {
      last.rows.push(row);
    } else {
      groups.push({ label: row.group, rows: [row] });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ label, rows }, groupIndex) => {
        const style = GROUP_STYLE[label] ?? { header: "bg-gray-500 text-white", bullet: "bg-gray-300" };

        return (
          <div key={label} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Group header bar */}
            <div
              className={`flex items-center gap-2.5 px-4 py-2 ${style.header}`}
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.bullet}`} />
              <span className="font-semibold text-[13px] tracking-wide">{label}</span>
              <span className="ml-1 text-[11px] font-normal opacity-70">({rows.length})</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table
                className="min-w-full border-collapse text-xs"
                style={{ tableLayout: "fixed" }}
              >
                <ColGroup />
                {/* Only show full header for the first group; subsequent ones get a compact sub-header */}
                {groupIndex === 0 ? (
                  <TableHead />
                ) : (
                  <thead>
                    <tr className="bg-[#2e2e30] text-gray-300 text-[10px] uppercase tracking-wider">
                      <th className="px-3 py-1 text-left" />
                      <th className="px-2 py-1 text-center" />
                      <th className="px-2 py-1 text-left" />
                      <th className="px-2 py-1 text-left" />
                      <th className="px-2 py-1 text-right" />
                      <th className="px-2 py-1 text-center border-r-2 border-gray-600" />
                      {VISIBLE_MONTHS.map((m, i) => (
                        <React.Fragment key={m.key}>
                          <th className={`px-1 py-1 text-right text-gray-500 ${
                            i === 0
                              ? "border-l-2 border-gray-500"
                              : m.quarterStart
                              ? "border-l-2 border-gray-600"
                              : "border-l border-gray-700"
                          }`}>h</th>
                          <th className="px-1 py-1 text-right text-gray-500 bg-gray-800/40">FTE</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {rows.map((row) => (
                    <ProjectRow key={row.id} initialRow={row} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
