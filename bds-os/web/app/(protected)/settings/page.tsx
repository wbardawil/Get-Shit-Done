"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organization profile, lifecycle detection, and team management.
        </p>
      </div>

      {/* Organization Profile */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-medium">Organization Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Organization Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              placeholder="Your company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Industry
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              placeholder="e.g. SaaS, Manufacturing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Revenue Range
            </label>
            <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
              <option>Pre-revenue</option>
              <option>$0 - $100K</option>
              <option>$100K - $1M</option>
              <option>$1M - $10M</option>
              <option>$10M - $50M</option>
              <option>$50M+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Employee Count
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              placeholder="e.g. 25"
            />
          </div>
        </div>
      </div>

      {/* Lifecycle Stage */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Lifecycle Stage</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-detected from revenue and employee count.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
              Not detected
            </span>
            <button className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted">
              Detect
            </button>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Team Members</h2>
          <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90">
            Invite Member
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          No team members yet. Invite your team to start collaborative
          assessments.
        </p>
      </div>
    </div>
  );
}
