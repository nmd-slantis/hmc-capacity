"use client";

import { useState, useRef, useEffect } from "react";

interface EditableCellProps {
  rowId: string;
  field: string;
  value: string | number | null;
  type?: "number" | "date" | "text";
  onSaved?: (newValue: string | number | null) => void;
  className?: string;
  placeholder?: string;
}

function isMonthKey(field: string): boolean {
  return /^[a-z]{3}-\d{2}$/.test(field);
}

export function EditableCell({
  rowId,
  field,
  value,
  type = "number",
  onSaved,
  className = "",
  placeholder = "—",
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) setDraft(String(value ?? ""));
  }, [value, editing]);

  const save = async () => {
    setSaving(true);
    setEditing(false);

    let body: Record<string, unknown>;
    let optimisticValue: string | number | null;

    if (isMonthKey(field)) {
      const hrs = draft === "" ? 0 : parseFloat(draft) || 0;
      body = { monthKey: field, monthHours: hrs };
      optimisticValue = hrs;
    } else if (field === "effort") {
      const v = draft === "" ? null : parseFloat(draft) || null;
      body = { effort: v };
      optimisticValue = v;
    } else {
      const v = draft === "" ? null : draft;
      body = { [field]: v };
      optimisticValue = v;
    }

    // Show the new value immediately — no waiting for the API
    onSaved?.(optimisticValue);

    try {
      const res = await fetch(`/api/planning/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const updated = await res.json();
        let serverValue: string | number | null = null;

        if (isMonthKey(field)) {
          const monthly = (() => {
            try {
              return typeof updated.monthlyData === "string"
                ? JSON.parse(updated.monthlyData)
                : updated.monthlyData;
            } catch { return {}; }
          })();
          serverValue = monthly[field] ?? 0;
        } else if (field === "effort") {
          serverValue = updated.effort ?? null;
        } else {
          serverValue = updated[field] ?? null;
        }

        // Correct if server normalized the value
        if (serverValue !== optimisticValue) onSaved?.(serverValue);
      } else {
        // Revert on failure
        onSaved?.(value);
      }
    } catch {
      onSaved?.(value);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(String(value ?? ""));
    setEditing(false);
  };

  const formatDisplay = (v: string | number | null): string | null => {
    if (v === null || v === undefined || v === "") return null;
    const s = String(v);
    if (type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split("-");
      return `${m}/${d}/${y}`;
    }
    return s;
  };

  const displayValue = formatDisplay(value);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") cancel();
        }}
        className={`w-full border border-[#FF7700] rounded px-1 py-0.5 text-xs outline-none bg-orange-50 ${className}`}
        style={{ boxSizing: "border-box" }}
      />
    );
  }

  return (
    <div
      onClick={() => { setDraft(String(value ?? "")); setEditing(true); }}
      className={`editable-cell px-1 py-0.5 min-h-[1.5rem] text-xs rounded transition-colors ${saving ? "opacity-40" : ""} ${className}`}
      title="Click to edit"
    >
      {displayValue ?? <span className="text-gray-300 select-none">{placeholder}</span>}
    </div>
  );
}
