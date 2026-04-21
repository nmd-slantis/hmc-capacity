"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ServiceOrder } from "@/types/planning";

interface SoRelationCellProps {
  planningId: string;
  serviceOrders: ServiceOrder[];
  linkedSoId: string | null;
  onLink: (newSoId: string | null, oldSoId: string | null) => void;
  onSoCreate?: (so: ServiceOrder) => void;
}

export function SoRelationCell({ planningId, serviceOrders, linkedSoId, onLink, onSoCreate }: SoRelationCellProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSoNo, setNewSoNo] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const soNoRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open && !creating) setTimeout(() => searchRef.current?.focus(), 0);
  }, [open, creating]);
  useEffect(() => {
    if (creating) setTimeout(() => soNoRef.current?.focus(), 0);
  }, [creating]);

  const linkedSo = serviceOrders.find((so) => so.id === linkedSoId) ?? null;
  const displayLabel = linkedSo
    ? (linkedSo.serviceOrderNo ?? linkedSo.name ?? "—")
    : "—";

  const filtered = serviceOrders.filter((so) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return so.serviceOrderNo?.toLowerCase().includes(q) || so.name.toLowerCase().includes(q);
  });

  const nextSoNo = (() => {
    const nums = serviceOrders.map(s => parseInt(s.serviceOrderNo ?? "")).filter(n => !isNaN(n));
    return nums.length > 0 ? String(Math.max(...nums) + 1) : "1";
  })();

  const openPanel = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPanelPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 260) });
    setCreating(false);
    setOpen(true);
  };

  const close = () => { setOpen(false); setSearch(""); setCreating(false); setNewSoNo(""); setNewName(""); };

  const handleSelect = async (soId: string | null) => {
    const oldId = linkedSoId;
    onLink(soId, oldId);
    close();

    if (oldId) {
      await fetch(`/api/service-orders/${oldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removePlanningId: planningId }),
      });
    }
    if (soId) {
      await fetch(`/api/service-orders/${soId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addPlanningId: planningId }),
      });
    }
  };

  const handleCreate = async () => {
    if (!newSoNo.trim() && !newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/service-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceOrderNo: newSoNo.trim() || null, name: newName.trim() }),
      });
      if (res.ok) {
        const created = await res.json() as ServiceOrder;
        onSoCreate?.(created);
        // auto-link to this row
        const oldId = linkedSoId;
        onLink(created.id, oldId);
        if (oldId) {
          await fetch(`/api/service-orders/${oldId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ removePlanningId: planningId }),
          });
        }
        await fetch(`/api/service-orders/${created.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addPlanningId: planningId }),
        });
        close();
      }
    } finally {
      setSaving(false);
    }
  };

  const panel = open && (
    <div
      style={{ position: "fixed", top: panelPos.top, left: panelPos.left, minWidth: panelPos.width, zIndex: 200 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {!creating ? (
        <>
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service orders…"
              className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-[#FF7700]"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {linkedSoId && (
              <button
                onClick={() => handleSelect(null)}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50"
              >
                — Clear
              </button>
            )}
            {filtered.length === 0 && serviceOrders.length > 0 && (
              <div className="px-3 py-2 text-xs text-gray-400">No results</div>
            )}
            {filtered.map((so) => (
              <button
                key={so.id}
                onClick={() => handleSelect(so.id)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 ${so.id === linkedSoId ? "text-[#FF7700]" : "text-gray-700"}`}
              >
                <span className="w-3 flex-shrink-0 text-[10px]">{so.id === linkedSoId ? "✓" : ""}</span>
                <span className="font-medium flex-shrink-0">{so.serviceOrderNo ?? "—"}</span>
                {so.name && <span className="text-gray-400 truncate">{so.name}</span>}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 px-3 py-1.5">
            <button
              onClick={() => setCreating(true)}
              className="text-xs text-[#FF7700] hover:bg-orange-50 w-full text-left px-1 py-1 rounded flex items-center gap-1"
            >
              <span className="text-sm leading-none">+</span> New service order
            </button>
          </div>
        </>
      ) : (
        <div className="p-3 flex flex-col gap-2">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">New Service Order</div>
          <div className="flex gap-2">
            <input
              ref={soNoRef}
              value={newSoNo}
              onChange={(e) => setNewSoNo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              placeholder={nextSoNo}
              className="w-20 text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-[#FF7700] placeholder:text-gray-300"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              placeholder="Name…"
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-[#FF7700]"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || (!newSoNo.trim() && !newName.trim())}
              className="text-xs bg-[#FF7700] text-white px-3 py-1 rounded-lg hover:opacity-90 disabled:opacity-40"
            >
              {saving ? "Saving…" : "Create & Link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={open ? close : openPanel}
        className="w-full flex items-center gap-1 text-xs text-left group"
      >
        {linkedSo ? (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium truncate max-w-full bg-violet-100 text-violet-700">
            {displayLabel}
          </span>
        ) : (
          <span className="flex-1 text-gray-400">—</span>
        )}
        <span className="text-gray-400 flex-shrink-0 text-[10px] group-hover:text-gray-600">▾</span>
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
