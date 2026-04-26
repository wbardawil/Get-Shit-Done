"use client";

import * as Progress from "@radix-ui/react-progress";

interface AssessmentProgressProps {
  totalPractices: number;
  scoredCount: number;
}

export function AssessmentProgress({
  totalPractices,
  scoredCount,
}: AssessmentProgressProps) {
  const pct = totalPractices > 0 ? (scoredCount / totalPractices) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <Progress.Root
        className="flex-1 h-2 bg-muted rounded-full overflow-hidden"
        value={pct}
      >
        <Progress.Indicator
          className="h-full bg-primary rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </Progress.Root>
      <span className="text-sm text-muted-foreground tabular-nums">
        {scoredCount} / {totalPractices}
      </span>
    </div>
  );
}
