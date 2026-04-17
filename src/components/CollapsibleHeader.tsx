"use client";

import { useState } from "react";
import type { ActiveTab } from "./HmcClientLayout";

interface CollapsibleHeaderProps {
  email: string | null | undefined;
  today: string;
  rowCount: number;
  signOut: () => Promise<void>;
  activeTab?: ActiveTab;
  onTabChange?: (tab: ActiveTab) => void;
}

export function CollapsibleHeader({ email, today, rowCount, signOut, activeTab, onTabChange }: CollapsibleHeaderProps) {
  const [open, setOpen] = useState(true);

  return (
    <header className="bg-[#202022] text-white shadow-md">
      {/* Always-visible title bar */}
      <div className="px-6 flex items-center justify-between" style={{ minHeight: "44px" }}>
        <div className="flex items-center gap-3">
          <span
            className="text-2xl font-bold text-[#FF7700]"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            /slantis
          </span>
          <span className="text-gray-500 text-lg font-light">×</span>
          <span
            className="text-white font-semibold text-base"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            HMC Architects
          </span>

          {/* Tab buttons */}
          {onTabChange && (
            <div className="flex items-center gap-1 ml-2">
              {(["planning", "admin"] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-colors ${
                    activeTab === tab
                      ? "bg-[#FF7700] text-white border-[#FF7700]"
                      : "text-[#FF7700] border-[#FF7700]/40 hover:bg-[#FF7700]/10"
                  }`}
                >
                  {tab === "planning" ? "Planning" : "Administration"}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="text-gray-400 hover:text-white transition-colors text-[11px] flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10"
          aria-label={open ? "Collapse header" : "Expand header"}
        >
          {open ? "▲ collapse" : "▼ expand"}
        </button>
      </div>

      {/* Collapsible details */}
      {open && (
        <div className="px-6 pb-2.5 pt-0.5 flex items-center gap-4 text-xs text-gray-400 border-t border-gray-700/60">
          <span className="hidden sm:block">{today}</span>
          <span className="hidden md:block">{email}</span>
          <span className="text-gray-500">
            {rowCount} project{rowCount !== 1 ? "s" : ""} · Sources: Odoo + HubSpot
          </span>
          <form action={signOut} className="ml-auto">
            <button
              type="submit"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
