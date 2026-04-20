"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { PlanningRow } from "@/types/planning";

interface ProjectRelationCellProps {
  soId: string;
  planningRows: PlanningRow[];
  linkedIds: string[];
  onLink: (newIds: string[]) => void;
}

export function ProjectRelationCell({ soId, planningRows, linkedIds, onLink }: ProjectRelationCellProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  const linkedRows = planningRows.filter((r) => linkedIds.includes(r.id));

  const filtered = planningRows.filter((row) => {
    if (!search) return true;
    return row.name.toLowerCase().includes(search.toLowerCase());
  });

  const openPanel = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPanelPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 280) });
    setOpen(true);
  };

  const close = () => { setOpen(false); setSearch(""); };

  const toggle = async (rowId: string) => {
    const isLinked = linkedIds.includes(rowId);
    const newIds = isLinked ? linkedIds.filter((id) => id !== rowId) : [...linkedIds, rowId];
    onLink(newIds);

    await fetch(`/api/service-orders/${soId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isLinked ? { removePlanningId: rowId } : { addPlanningId: rowId }),
    });
  };

  const panel = open && (
    <div
      style={{ position: "fixed", top: panelPos.top, left: panelPos.left, minWidth: panelPos.width, zIndex: 200 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
    >
      <div className="p-2 border-b border-gray-100">
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects & deals…"
          className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-[#FF7700]"
        />
      </div>
      <div className="max-h-64 overflow-y-auto py-1">
        {filtered.length === 0 && (
          <div className="px-3 py-2 text-xs text-gray-400">No results</div>
        )}
        {filtered.map((row) => {
          const isLinked = linkedIds.includes(row.id);
          return (
            <button
              key={row.id}
              onClick={() => toggle(row.id)}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 ${isLinked ? "text-[#FF7700]" : "text-gray-700"}`}
            >
              <span className="w-3 flex-shrink-0 text-[10px]">{isLinked ? "✓" : ""}</span>
              <span className="flex-1 truncate">{row.name}</span>
              <span className="text-gray-400 text-[10px] flex-shrink-0">{row.group}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={open ? close : openPanel}
        className="w-full text-left group min-h-[22px] flex items-start gap-1"
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {linkedRows.length === 0 ? (
            <span className="text-gray-400 text-xs">—</span>
          ) : (
            linkedRows.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-orange-100 text-[#FF7700] text-[11px] font-medium max-w-[160px] truncate"
              >
                {r.name}
              </span>
            ))
          )}
        </div>
        <span className="text-gray-400 flex-shrink-0 text-[10px] group-hover:text-gray-600 mt-0.5">▾</span>
      </button>
      {mounted && createPortal(
        <>
          {open && <div className="fixed inset-0 z-[199]" onMouseDown={close} />}
          {panel}
        </>,
        document.body
      )}
    </>
  );
}
