"use client";

import { useState } from "react";

export default function AssessPage() {
  const [expandedArea, setExpandedArea] = useState<number | null>(null);

  // Placeholder areas — will be replaced with real data from Supabase
  const areas = [
    { id: 1, name: "Finance & Unit Economics", practiceCount: 10 },
    { id: 2, name: "Product & Offering", practiceCount: 11 },
    { id: 3, name: "Go-To-Market & Sales", practiceCount: 11 },
    { id: 4, name: "Marketing & Brand", practiceCount: 10 },
    { id: 5, name: "People & Organization", practiceCount: 10 },
    { id: 6, name: "Technology & Infrastructure", practiceCount: 10 },
    { id: 7, name: "Delivery & Operations", practiceCount: 10 },
    { id: 8, name: "Governance & Leadership", practiceCount: 10 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rate 82 practices across 8 areas on importance and competency (1-5)
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
        </div>
        <span className="text-sm text-muted-foreground">0 / 82</span>
      </div>

      {/* Area Accordion */}
      <div className="space-y-2">
        {areas.map((area) => (
          <div key={area.id} className="rounded-lg border border-border bg-card">
            <button
              onClick={() =>
                setExpandedArea(expandedArea === area.id ? null : area.id)
              }
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                  {area.id}
                </div>
                <span className="font-medium text-sm">{area.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  0/{area.practiceCount} rated
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`text-muted-foreground transition-transform ${
                    expandedArea === area.id ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>
            {expandedArea === area.id && (
              <div className="border-t border-border px-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Practice rows with dual sliders will be loaded here from
                  Supabase.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted">
          Save Draft
        </button>
        <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90">
          Complete Round
        </button>
      </div>
    </div>
  );
}
