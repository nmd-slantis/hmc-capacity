"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface OfficeOption {
  id: number;
  label: string;
}

interface OfficeDropdownProps {
  rowId: string;
  value: string | null;
  onSaved: (v: string | null) => void;
}

export function OfficeDropdown({ rowId, value, onSaved }: OfficeDropdownProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<OfficeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState("");
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (editingId !== null) setTimeout(() => editInputRef.current?.focus(), 0);
  }, [editingId]);

  const loadOptions = async () => {
    const res = await fetch("/api/offices");
    if (res.ok) setOptions(await res.json());
  };

  const openDropdown = async () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPanelPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 180) });
    }
    setLoading(true);
    await loadOptions();
    setLoading(false);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setEditDraft("");
    setAdding(false);
    setAddDraft("");
  };

  const selectOption = async (label: string | null) => {
    onSaved(label); // optimistic
    close();
    await fetch(`/api/planning/${rowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ office: label }),
    });
  };

  const startEdit = (opt: OfficeOption) => {
    setEditingId(opt.id);
    setEditDraft(opt.label);
    setAdding(false);
  };

  const saveEdit = async (opt: OfficeOption) => {
    if (!editDraft.trim() || editDraft.trim() === opt.label) { setEditingId(null); return; }
    const res = await fetch(`/api/offices/${opt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editDraft.trim() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOptions((prev) => prev.map((o) => o.id === opt.id ? updated : o));
      if (value === opt.label) onSaved(updated.label);
    }
    setEditingId(null);
    setEditDraft("");
  };

  const deleteOption = async (opt: OfficeOption) => {
    const res = await fetch(`/api/offices/${opt.id}`, { method: "DELETE" });
    if (res.ok) {
      setOptions((prev) => prev.filter((o) => o.id !== opt.id));
      if (value === opt.label) onSaved(null);
    }
  };

  const saveAdd = async () => {
    if (!addDraft.trim()) return;
    const res = await fetch("/api/offices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: addDraft.trim() }),
    });
    if (res.ok) {
      const created = await res.json();
      setOptions((prev) => [...prev, created].sort((a, b) => a.label.localeCompare(b.label)));
    }
    setAdding(false);
    setAddDraft("");
  };

  const panel = open && (
    <div
      style={{ position: "fixed", top: panelPos.top, left: panelPos.left, minWidth: panelPos.width, zIndex: 200 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 py-1 overflow-hidden"
    >
      {loading ? (
        <div className="px-3 py-2 text-xs text-gray-400">Loading…</div>
      ) : (
        <>
          {value && (
            <button
              onClick={() => selectOption(null)}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50"
            >
              — Clear
            </button>
          )}
          {options.length === 0 && !value && (
            <div className="px-3 py-1.5 text-xs text-gray-400">No offices yet</div>
          )}
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center group hover:bg-gray-50">
              {editingId === opt.id ? (
                <div className="flex items-center gap-1 px-3 py-1.5 w-full">
                  <input
                    ref={editInputRef}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(opt); if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 text-xs border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-[#FF7700] min-w-0"
                  />
                  <button onClick={() => saveEdit(opt)} className="text-[#FF7700] text-xs flex-shrink-0">✓</button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs flex-shrink-0">✕</button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => selectOption(opt.label)}
                    className={`flex-1 text-left px-3 py-1.5 text-xs ${value === opt.label ? "text-[#FF7700] font-medium" : "text-gray-700"}`}
                  >
                    {value === opt.label && <span className="mr-1 text-[10px]">✓</span>}
                    {opt.label}
                  </button>
                  <div className="flex items-center gap-0 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(opt)} className="text-gray-400 hover:text-gray-700 text-[10px] px-1 py-1">✎</button>
                    <button onClick={() => deleteOption(opt)} className="text-gray-400 hover:text-rose-500 text-[10px] px-1 py-1">✕</button>
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="border-t border-gray-100 mt-0.5">
            {adding ? (
              <div className="flex items-center gap-1 px-3 py-1.5">
                <input
                  value={addDraft}
                  onChange={(e) => setAddDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveAdd(); if (e.key === "Escape") { setAdding(false); setAddDraft(""); } }}
                  placeholder="New office…"
                  className="flex-1 text-xs border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-[#FF7700] min-w-0"
                  autoFocus
                />
                <button onClick={saveAdd} className="text-[#FF7700] text-xs flex-shrink-0">✓</button>
                <button onClick={() => { setAdding(false); setAddDraft(""); }} className="text-gray-400 text-xs flex-shrink-0">✕</button>
              </div>
            ) : (
              <button
                onClick={() => { setAdding(true); setEditingId(null); }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#FF7700] hover:bg-orange-50 flex items-center gap-1"
              >
                <span className="text-base leading-none">+</span> Add office
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={open ? close : openDropdown}
        className="w-full flex items-center gap-1 text-xs text-left group"
      >
        <span className={`flex-1 truncate ${value ? "text-gray-700" : "text-gray-400"}`}>
          {value ?? "—"}
        </span>
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
