"use client";

export default function OPIPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            OPI — Operational Priority Index
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Practices ranked by priority. Compute after completing an assessment
            round.
          </p>
        </div>
        <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90">
          Compute OPI
        </button>
      </div>

      {/* Phase Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { phase: "Proof", color: "bg-phase-proof", count: 0 },
          { phase: "Structure", color: "bg-phase-structure", count: 0 },
          { phase: "Scale", color: "bg-phase-scale", count: 0 },
        ].map((p) => (
          <div
            key={p.phase}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${p.color}`} />
              <span className="text-sm font-medium">Phase: {p.phase}</span>
            </div>
            <p className="text-2xl font-semibold mt-2">{p.count}</p>
            <p className="text-xs text-muted-foreground">practices</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          No OPI scores computed yet. Complete an assessment round first, then
          click "Compute OPI".
        </p>
      </div>
    </div>
  );
}
