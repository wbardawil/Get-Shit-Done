"use client";

import * as Slider from "@radix-ui/react-slider";
import type { Practice, MaturityLevel } from "@/types";
import { MaturityTooltip } from "./maturity-tooltip";

interface PracticeRowProps {
  practice: Practice;
  maturityLevels: MaturityLevel[];
  importanceScore: number | null;
  competencyScore: number | null;
  onScoreChange: (
    practiceId: number,
    field: "importance_score" | "competency_score",
    value: number,
  ) => void;
  disabled?: boolean;
}

function ScoreSlider({
  value,
  onChange,
  variant,
  disabled,
}: {
  value: number | null;
  onChange: (v: number) => void;
  variant: "importance" | "competency";
  disabled?: boolean;
}) {
  const scored = value !== null && value > 0;
  const rangeColor =
    variant === "importance" ? "bg-amber-500" : "bg-primary";

  return (
    <div className="flex items-center gap-2">
      <Slider.Root
        className={`relative flex items-center select-none touch-none w-32 h-5 ${
          disabled ? "opacity-50" : ""
        }`}
        min={1}
        max={5}
        step={1}
        value={[scored ? value : 3]}
        onValueCommit={(values: number[]) => onChange(values[0])}
        disabled={disabled}
      >
        <Slider.Track className="relative grow h-1.5 rounded-full bg-muted">
          <Slider.Range
            className={`absolute h-full rounded-full ${scored ? rangeColor : "bg-muted-foreground/20"}`}
          />
        </Slider.Track>
        <Slider.Thumb
          className={`block w-4 h-4 rounded-full border-2 shadow focus:outline-none focus:ring-2 focus:ring-ring ${
            scored
              ? `bg-white ${variant === "importance" ? "border-amber-500" : "border-primary"}`
              : "bg-muted-foreground/30 border-muted-foreground/40"
          }`}
        />
      </Slider.Root>
      <span
        className={`text-xs tabular-nums w-4 text-center ${
          scored ? "text-foreground" : "text-muted-foreground/40"
        }`}
      >
        {scored ? value : "-"}
      </span>
    </div>
  );
}

export function PracticeRow({
  practice,
  maturityLevels,
  importanceScore,
  competencyScore,
  onScoreChange,
  disabled,
}: PracticeRowProps) {
  return (
    <div className="grid grid-cols-[1fr_180px_180px] items-center gap-2 py-2 px-1">
      <MaturityTooltip levels={maturityLevels} currentCompetency={competencyScore}>
        <button className="text-left text-sm text-foreground hover:text-primary transition-colors truncate">
          {practice.name}
        </button>
      </MaturityTooltip>

      <ScoreSlider
        value={importanceScore}
        onChange={(v) => onScoreChange(practice.id, "importance_score", v)}
        variant="importance"
        disabled={disabled}
      />

      <ScoreSlider
        value={competencyScore}
        onChange={(v) => onScoreChange(practice.id, "competency_score", v)}
        variant="competency"
        disabled={disabled}
      />
    </div>
  );
}
