"use client";

const COLUMNS = [
  "Backlog",
  "Planned",
  "In Progress",
  "Evidence Ready",
  "AI Pre-Graded",
  "Pending Verification",
  "Approved",
];

export default function ExecutePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Execute</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kanban board for initiative tracking, evidence upload, and approval
          workflow.
        </p>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col}
            className="min-w-[200px] w-[200px] flex-shrink-0 rounded-lg border border-border bg-muted/50"
          >
            <div className="px-3 py-2 border-b border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {col}
              </h3>
              <span className="text-xs text-muted-foreground">0</span>
            </div>
            <div className="p-2 min-h-[200px]">
              {/* Initiative cards will go here */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
