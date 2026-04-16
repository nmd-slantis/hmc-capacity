"use client";

import React from "react";
import { VISIBLE_MONTHS } from "@/config/months";
import { ProjectRow } from "./ProjectRow";
import type { CapacityRow } from "@/types/capacity";

interface CapacityTableProps {
  initialRows: CapacityRow[];
}

export function CapacityTable({ initialRows }: CapacityTableProps) {
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

  const totalCols = 6 + VISIBLE_MONTHS.length * 2;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          {/* Month group headers */}
          <tr className="bg-[#202022] text-white">
            <th colSpan={6} className="px-3 py-2 text-left" />
            {VISIBLE_MONTHS.map((m) => (
              <th
                key={m.key}
                colSpan={2}
                className={`px-2 py-2 text-[11px] whitespace-nowrap ${
                  m.quarterStart
                    ? "border-l-2 border-gray-500"
                    : "border-l border-gray-700"
                }`}
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-gray-400 font-normal">{m.workdayHours} hs</span>
                </div>
              </th>
            ))}
          </tr>

          {/* Sub-headers */}
          <tr className="bg-[#2e2e30] text-gray-300 text-[10px] uppercase tracking-wider">
            <th className="px-3 py-1.5 text-left min-w-[200px]">Project / Deal</th>
            <th className="px-2 py-1.5 text-center">Src</th>
            <th className="px-2 py-1.5 text-left min-w-[90px]">Start</th>
            <th className="px-2 py-1.5 text-left min-w-[90px]">Finish</th>
            <th className="px-2 py-1.5 text-right min-w-[52px]">Effort h</th>
            <th className="px-2 py-1.5 text-center min-w-[40px]">SO</th>
            {VISIBLE_MONTHS.map((m) => (
              <React.Fragment key={m.key}>
                <th className={`px-1 py-1.5 text-right min-w-[44px] ${
                  m.quarterStart ? "border-l-2 border-gray-600" : "border-l border-gray-700"
                }`}>
                  h
                </th>
                <th className="px-1 py-1.5 text-right min-w-[36px] bg-gray-800/40">
                  FTE
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {groups.map(({ label, rows }) => (
            <React.Fragment key={label}>
              {/* Group header */}
              <tr>
                <td
                  colSpan={totalCols}
                  className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500 bg-gray-50 border-t border-gray-200"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {label} <span className="font-normal text-gray-400">({rows.length})</span>
                </td>
              </tr>

              {rows.map((row) => (
                <ProjectRow key={row.id} initialRow={row} />
              ))}
            </React.Fragment>
          ))}

          {initialRows.length === 0 && (
            <tr>
              <td colSpan={totalCols} className="text-center py-16 text-gray-400">
                No projects or deals found. Check your API credentials.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
