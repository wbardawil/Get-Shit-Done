"use client";

import * as Accordion from "@radix-ui/react-accordion";
import type { Area, Practice, MaturityLevel } from "@/types";
import { PracticeRow } from "./practice-row";

interface AreaAccordionProps {
  area: Area;
  practices: Practice[];
  maturityLevelsByPractice: Map<number, MaturityLevel[]>;
  responsesMap: Map<number, { importance_score: number; competency_score: number }>;
  onScoreChange: (
    practiceId: number,
    field: "importance_score" | "competency_score",
    value: number,
  ) => void;
  disabled?: boolean;
}

export function AreaAccordion({
  area,
  practices,
  maturityLevelsByPractice,
  responsesMap,
  onScoreChange,
  disabled,
}: AreaAccordionProps) {
  const scoredCount = practices.filter((p) => {
    const r = responsesMap.get(p.id);
    return r && r.importance_score > 0 && r.competency_score > 0;
  }).length;

  return (
    <Accordion.Item value={String(area.id)} className="rounded-lg border border-border bg-card">
      <Accordion.Header>
        <Accordion.Trigger className="group w-full flex items-center justify-between px-4 py-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
              {area.sort_order}
            </div>
            <span className="font-medium text-sm">{area.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {scoredCount}/{practices.length} rated
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="border-t border-border px-4 py-2">
          <div className="grid grid-cols-[1fr_180px_180px] items-center gap-2 py-1 px-1 text-xs text-muted-foreground font-medium">
            <span>Practice</span>
            <span>Importance</span>
            <span>Competency</span>
          </div>
          {practices.map((practice) => {
            const response = responsesMap.get(practice.id);
            return (
              <PracticeRow
                key={practice.id}
                practice={practice}
                maturityLevels={maturityLevelsByPractice.get(practice.id) ?? []}
                importanceScore={response?.importance_score ?? null}
                competencyScore={response?.competency_score ?? null}
                onScoreChange={onScoreChange}
                disabled={disabled}
              />
            );
          })}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  );
}
