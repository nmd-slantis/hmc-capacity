"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Office, PlanningRow } from "@/types/planning";
import { chipTextColor } from "@/lib/color";
import { BRAND_COLORS } from "@/lib/brand-colors";

interface OfficesTableProps {
  offices: Office[];
  planningRows: PlanningRow[];
  onUpdate: (updated: Office) => void;
  onCreate: (created: Office) => void;
  onDelete: (id: number) => void;
  onOfficesRefresh?: (offices: Office[]) => void;
}

const CUSTOM_COLORS_KEY = "hmc-custom-colors";

function getStoredColors(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CUSTOM_COLORS_KEY) ?? "[]") as string[]; }
  catch { return []; }
}

function storeColor(hex: string): string[] {
  const existing = getStoredColors();
  if (existing.includes(hex)) return existing;
  const updated = [hex, ...existing].slice(0, 20);
  localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(updated));
  return updated;
}

function ColorPickerCell({ color, onSave }: { color: string | null; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [pendingCustom, setPendingCustom] = useState(color ?? "#6b7280");
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeChangedRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  const openPanel = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPanelPos({ top: rect.bottom + 4, left: rect.left });
    setCustomColors(getStoredColors());
    setPendingCustom(color ?? "#6b7280");
    nativeChangedRef.current = false;
    setOpen(true);
  };

  const close = () => setOpen(false);

  const select = (hex: string) => { close(); onSave(hex); };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingCustom(e.target.value);
    nativeChangedRef.current = true;
  };

  const handleNativeBlur = () => {
    if (nativeChangedRef.current) {
      const updated = storeColor(pendingCustom);
      setCustomColors(updated);
      onSave(pendingCustom);
      nativeChangedRef.current = false;
    }
    close();
  };

  const display = color ?? "#6b7280";

  const panel = open && (
    <div
      style={{ position: "fixed", top: panelPos.top, left: panelPos.left, zIndex: 300 }}
      className="bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-52"
    >
      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Brand</div>
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {BRAND_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => select(c)}
            style={{ backgroundColor: c }}
            title={c}
            className={`w-7 h-7 rounded-full hover:scale-110 transition-transform border-2 ${
              color === c ? "border-gray-700 shadow-sm scale-105" : "border-transparent hover:border-gray-300"
            }`}
          />
        ))}
      </div>
      {customColors.length > 0 && (
        <>
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Custom</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {customColors.map((c) => (
              <button
                key={c}
                onClick={() => select(c)}
                style={{ backgroundColor: c }}
                title={c}
                className={`w-7 h-7 rounded-full hover:scale-110 transition-transform border-2 ${
                  color === c ? "border-gray-700 shadow-sm scale-105" : "border-transparent hover:border-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
      <div className="border-t border-gray-100 pt-2">
        <label className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
          <span
            className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0"
            style={{ backgroundColor: nativeChangedRef.current ? pendingCustom : undefined }}
          />
          <input
            type="color"
            value={pendingCustom}
            onChange={handleNativeChange}
            onBlur={handleNativeBlur}
            className="sr-only"
          />
          Add custom color…
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={open ? close : openPanel}
        title={color ?? "Pick color"}
        className="w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform flex-shrink-0"
        style={{ backgroundColor: display, borderColor: color ? display : "#d1d5db" }}
      />
      {mounted && createPortal(
        <>
          {open && <div className="fixed inset-0 z-[299]" onMouseDown={close} />}
          {panel}
        </>,
        document.body
      )}
    </div>
  );
}

function EditText({
  value,
  onSave,
  placeholder,
  className,
  chipStyle,
}: {
  value: string | null;
  onSave: (v: string | null) => void;
  placeholder?: string;
  className?: string;
  chipStyle?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  const commit = () => {
    setEditing(false);
    const v = draft.trim() || null;
    if (v !== value) onSave(v);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value ?? ""); setEditing(false); }
        }}
        className={`w-full outline-none bg-white border border-[#FF7700] rounded px-1.5 py-0.5 text-xs ${className ?? ""}`}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value ?? ""); setEditing(true); }}
      className={`text-left text-xs group/cell w-full ${className ?? ""}`}
    >
      {value ? (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium transition-opacity group-hover/cell:opacity-80"
          style={chipStyle ?? { backgroundColor: "#f3f4f6", color: "#374151" }}
        >
          {value}
        </span>
      ) : (
        <span className="text-gray-400">{placeholder ?? "—"}</span>
      )}
    </button>
  );
}

function LinkedProjectsCell({ officeLabelOrNew, planningRows }: { officeLabelOrNew: string | null; planningRows: PlanningRow[] }) {
  if (!officeLabelOrNew) return <span className="text-gray-300 text-xs">—</span>;
  const linked = planningRows.filter((r) => r.office === officeLabelOrNew);
  if (linked.length === 0) return <span className="text-gray-400 text-xs italic">None</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {linked.slice(0, 4).map((r) => (
        <span key={r.id} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] border border-orange-200 truncate max-w-[140px]" title={r.name}>
          {r.name}
        </span>
      ))}
      {linked.length > 4 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">
          +{linked.length - 4} more
        </span>
      )}
    </div>
  );
}

export function OfficesTable({ offices, planningRows, onUpdate, onCreate, onDelete, onOfficesRefresh }: OfficesTableProps) {
  const [filters, setFilters] = useState({ label: "", address: "", contact: "", email: "", notes: "" });
  const sf = (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters((p) => ({ ...p, [k]: e.target.value }));
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    const res = await fetch("/api/offices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newLabel.trim(),
        address: newAddress.trim() || null,
        contactName: newContact.trim() || null,
        contactEmail: newEmail.trim() || null,
        notes: newNotes.trim() || null,
      }),
    });
    if (res.ok) {
      onCreate(await res.json());
      setNewLabel(""); setNewAddress(""); setNewContact(""); setNewEmail(""); setNewNotes("");
      setCreating(false);
    }
  };

  const handleUpdate = async (id: number, patch: Partial<Pick<Office, "label" | "color" | "address" | "contactName" | "contactEmail" | "notes">>) => {
    const res = await fetch(`/api/offices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) onUpdate(await res.json());
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    await fetch(`/api/offices/${id}`, { method: "DELETE" });
    onDelete(id);
    setDeleting(null);
  };

  const handleSeedColors = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/offices/seed-colors", { method: "POST" });
      if (res.ok) {
        const updated: Office[] = await res.json();
        onOfficesRefresh?.(updated);
      }
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <table className="w-full text-xs" style={{ tableLayout: "fixed", borderCollapse: "collapse" }}>
        <colgroup>
          <col style={{ width: "40px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "200px" }} />
          <col style={{ width: "160px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "200px" }} />
          <col style={{ width: "40px" }} />{/* color */}
          <col />
          <col style={{ width: "16px" }} />{/* gutter */}
        </colgroup>
        <thead>
          <tr className="bg-[#2e2e30] text-gray-300 text-[10px] tracking-wider uppercase select-none" style={{ height: "36px" }}>
            <th className="px-2 py-2.5" />
            <th className="px-4 py-2.5 text-left font-medium">Office</th>
            <th className="px-4 py-2.5 text-left font-medium">Address</th>
            <th className="px-4 py-2.5 text-left font-medium">Contact</th>
            <th className="px-4 py-2.5 text-left font-medium">Email</th>
            <th className="px-4 py-2.5 text-left font-medium">Notes</th>
            <th className="px-2 py-2.5 text-center font-medium">Color</th>
            <th className="px-4 py-2.5 text-left font-medium">Projects / Deals</th>
            <th className="p-0" />
          </tr>
          <tr className="bg-[#111113]" style={{ height: "28px" }}>
            <th className="px-1 py-0.5" />
            {(["label","address","contact","email","notes"] as const).map((k) => (
              <th key={k} className="px-2 py-0.5">
                <input value={filters[k]} onChange={sf(k)} placeholder="…"
                  className="w-full bg-transparent text-gray-400 text-[10px] outline-none placeholder:text-gray-700 border-b border-transparent focus:border-gray-600" />
              </th>
            ))}
            <th className="px-1 py-0.5" />{/* color — no filter */}
            <th className="px-1 py-0.5" />
            <th className="p-0" />
          </tr>
        </thead>
        <tbody>
          {offices.length === 0 && !creating && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-xs text-gray-400">
                No offices yet — click the button below to add one.
              </td>
            </tr>
          )}
          {offices.filter((o) => {
            const q = (k: string, v: string | null) => !k || (v ?? "").toLowerCase().includes(k.toLowerCase());
            return q(filters.label, o.label) && q(filters.address, o.address) && q(filters.contact, o.contactName) && q(filters.email, o.contactEmail) && q(filters.notes, o.notes);
          }).map((office) => (
            <tr key={office.id} className="border-b border-gray-100 bg-white hover:brightness-[0.97] transition-all group">
              <td className="px-2 py-2 text-center">
                <button
                  onClick={() => handleDelete(office.id)}
                  disabled={deleting === office.id}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors text-[10px] opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  ✕
                </button>
              </td>
              <td className="px-4 py-2">
                <EditText
                  value={office.label}
                  placeholder="Office name"
                  chipStyle={office.color ? { backgroundColor: office.color, color: chipTextColor(office.color) } : undefined}
                  onSave={(v) => v && handleUpdate(office.id, { label: v })}
                />
              </td>
              <td className="px-4 py-2">
                <EditText
                  value={office.address}
                  placeholder="Address…"
                  onSave={(v) => handleUpdate(office.id, { address: v })}
                />
              </td>
              <td className="px-4 py-2">
                <EditText
                  value={office.contactName}
                  placeholder="Contact…"
                  onSave={(v) => handleUpdate(office.id, { contactName: v })}
                />
              </td>
              <td className="px-4 py-2">
                <EditText
                  value={office.contactEmail}
                  placeholder="Email…"
                  onSave={(v) => handleUpdate(office.id, { contactEmail: v })}
                />
              </td>
              <td className="px-4 py-2">
                <EditText
                  value={office.notes}
                  placeholder="Notes…"
                  onSave={(v) => handleUpdate(office.id, { notes: v })}
                />
              </td>
              <td className="px-2 py-2">
                <ColorPickerCell
                  color={office.color}
                  onSave={(c) => handleUpdate(office.id, { color: c })}
                />
              </td>
              <td className="px-4 py-2">
                <LinkedProjectsCell officeLabelOrNew={office.label} planningRows={planningRows} />
              </td>
              <td className="p-0" />
            </tr>
          ))}

          {creating && (
            <tr className="border-b border-gray-100 bg-orange-50/50">
              <td className="px-2 py-2 text-center">
                <button
                  onClick={handleCreate}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FF7700] text-white hover:opacity-90 transition-opacity text-sm font-bold shadow-sm mx-auto"
                  title="Save"
                >
                  ✓
                </button>
              </td>
              <td className="px-4 py-2">
                <input
                  autoFocus
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                  placeholder="Office name"
                  className="w-full outline-none bg-transparent border-b border-[#FF7700] text-xs px-0.5 py-0.5 placeholder:text-gray-300"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                  placeholder="Address…"
                  className="w-full outline-none bg-transparent border-b border-[#FF7700] text-xs px-0.5 py-0.5 placeholder:text-gray-400"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                  placeholder="Contact…"
                  className="w-full outline-none bg-transparent border-b border-[#FF7700] text-xs px-0.5 py-0.5 placeholder:text-gray-400"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                  placeholder="Email…"
                  className="w-full outline-none bg-transparent border-b border-[#FF7700] text-xs px-0.5 py-0.5 placeholder:text-gray-400"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                  placeholder="Notes…"
                  className="w-full outline-none bg-transparent border-b border-[#FF7700] text-xs px-0.5 py-0.5 placeholder:text-gray-400"
                />
              </td>
              <td className="px-2 py-2 text-center text-gray-400 text-[10px]">auto</td>
              <td className="px-4 py-2 text-gray-400 text-xs italic">
                <div className="flex items-center gap-2">
                  <span>Projects link after saving</span>
                  <button
                    onClick={() => { setCreating(false); setNewLabel(""); setNewAddress(""); setNewContact(""); setNewEmail(""); setNewNotes(""); }}
                    className="text-gray-400 hover:text-gray-600 text-[10px] ml-auto"
                  >
                    ✕
                  </button>
                </div>
              </td>
              <td className="p-0" />
            </tr>
          )}
        </tbody>
      </table>

      <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4">
        <button
          onClick={() => setCreating(true)}
          className="text-xs text-[#FF7700] hover:bg-orange-50 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
        >
          <span className="text-base leading-none">+</span> New office
        </button>
        <button
          onClick={handleSeedColors}
          disabled={seeding || offices.length === 0}
          className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-40"
          title="Assign random brand colors to all offices"
        >
          {seeding ? "Assigning…" : "✦ Randomize colors"}
        </button>
      </div>
    </div>
  );
}
