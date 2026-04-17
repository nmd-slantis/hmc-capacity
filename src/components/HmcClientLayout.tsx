"use client";

import { useState } from "react";
import { CollapsibleHeader } from "./CollapsibleHeader";
import { PlanningTable } from "./PlanningTable";
import type { PlanningRow } from "@/types/planning";

export type ActiveTab = "planning" | "admin";

interface HmcClientLayoutProps {
  initialRows: PlanningRow[];
  email: string | null | undefined;
  today: string;
  rowCount: number;
  signOut: () => Promise<void>;
}

export function HmcClientLayout({ initialRows, email, today, rowCount, signOut }: HmcClientLayoutProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("planning");

  return (
    <>
      <CollapsibleHeader
        email={email}
        today={today}
        rowCount={rowCount}
        signOut={signOut}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="px-6 py-6 pb-10">
        <PlanningTable initialRows={initialRows} showMonths={activeTab === "planning"} />
      </main>
    </>
  );
}
