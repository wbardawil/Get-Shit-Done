export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your BDS Operating System loop
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assessment", status: "Not started", color: "bg-muted" },
          { label: "OPI Computed", status: "Pending", color: "bg-muted" },
          { label: "Focus Portfolio", status: "Not selected", color: "bg-muted" },
          { label: "Active Initiatives", status: "0", color: "bg-muted" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-lg font-semibold mt-1">{card.status}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-medium mb-4">BDS Loop Progress</h2>
        <div className="flex items-center gap-2 text-sm">
          {["Assess", "Orient (OPI)", "Focus Portfolio", "Execute", "Govern"].map(
            (phase, i) => (
              <div key={phase} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">
                  {i + 1}
                </div>
                <span className="text-muted-foreground">{phase}</span>
                {i < 4 && (
                  <div className="w-8 h-px bg-border" />
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
