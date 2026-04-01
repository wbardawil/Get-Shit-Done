"use client";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Focus Portfolio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            WIP-limited set of active practices. Select after OPI is computed.
          </p>
        </div>
        <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90">
          Generate Portfolio
        </button>
      </div>

      {/* WIP Indicator */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">WIP Capacity</span>
          <span className="text-sm text-muted-foreground">0 / -- slots</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
        </div>
      </div>

      {/* Active Practices */}
      <div>
        <h2 className="text-sm font-medium mb-3">Active Practices</h2>
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No portfolio selected yet. Compute OPI first, then generate your
            focus portfolio.
          </p>
        </div>
      </div>

      {/* Parking Lot */}
      <div>
        <h2 className="text-sm font-medium mb-3 text-muted-foreground">
          Parking Lot
        </h2>
        <p className="text-xs text-muted-foreground">
          Practices not in the active set, queued by OPI rank.
        </p>
      </div>
    </div>
  );
}
