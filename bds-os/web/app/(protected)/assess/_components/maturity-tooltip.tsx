"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import type { MaturityLevel } from "@/types";

interface MaturityTooltipProps {
  levels: MaturityLevel[];
  currentCompetency: number | null;
  children: React.ReactNode;
}

export function MaturityTooltip({
  levels,
  currentCompetency,
  children,
}: MaturityTooltipProps) {
  const sorted = [...levels].sort((a, b) => a.level - b.level);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="z-50 max-w-sm rounded-lg border border-border bg-popover p-3 shadow-md"
        >
          <p className="text-xs font-semibold text-foreground mb-2">
            Maturity Levels
          </p>
          <div className="space-y-1.5">
            {sorted.map((ml) => (
              <div
                key={ml.level}
                className={`flex gap-2 rounded px-1.5 py-1 text-xs ${
                  currentCompetency === ml.level
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <span className="font-medium shrink-0 w-4">{ml.level}</span>
                <span>{ml.descriptor}</span>
              </div>
            ))}
          </div>
          <Tooltip.Arrow className="fill-border" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
