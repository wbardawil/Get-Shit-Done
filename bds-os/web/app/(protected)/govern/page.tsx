"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ViewTab = "executive" | "board" | "functional";

export default function GovernPage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("executive");

  const tabs: { id: ViewTab; label: string }[] = [
    { id: "executive", label: "Executive" },
    { id: "board", label: "Board" },
    { id: "functional", label: "Functional Leader" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Governance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Three perspectives on organizational maturity and operational health.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border border-border bg-card p-6">
        {activeTab === "executive" && (
          <div className="space-y-4">
            <h2 className="font-medium">Executive View</h2>
            <p className="text-sm text-muted-foreground">
              Active practices, P&L impact, delegation index, decision cycle,
              and risk alerts. Data from governance-report edge function.
            </p>
          </div>
        )}
        {activeTab === "board" && (
          <div className="space-y-4">
            <h2 className="font-medium">Board View</h2>
            <p className="text-sm text-muted-foreground">
              Area maturity delta, phase distribution, operating debt, governance
              health, and narrative summary.
            </p>
          </div>
        )}
        {activeTab === "functional" && (
          <div className="space-y-4">
            <h2 className="font-medium">Functional Leader View</h2>
            <p className="text-sm text-muted-foreground">
              Owned practices, evidence requirements, coaching prompts, and
              adoption tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
