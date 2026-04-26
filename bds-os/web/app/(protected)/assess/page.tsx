"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAuth, useOrganization } from "@/lib/hooks/use-auth";
import { useAreas, usePractices, useMaturityLevels } from "@/lib/hooks/use-practices";
import { useRoundResponses, useUpsertResponse, useCompleteRound } from "@/lib/hooks/use-assessment";
import { useActiveRound } from "./_hooks/use-active-round";
import { AssessmentProgress } from "./_components/assessment-progress";
import { AreaAccordion } from "./_components/area-accordion";
import type { Practice, MaturityLevel } from "@/types";

export default function AssessPage() {
  const { user, loading: authLoading } = useAuth();
  const { organizationId, loading: orgLoading } = useOrganization(user?.id);
  const { activeRound, isLoading: roundLoading } = useActiveRound(organizationId ?? undefined);

  const { data: areas } = useAreas();
  const { data: practices } = usePractices();
  const { data: maturityLevels } = useMaturityLevels();
  const { data: responses } = useRoundResponses(activeRound?.id, organizationId ?? undefined);

  const upsertResponse = useUpsertResponse();
  const completeRound = useCompleteRound();

  const [localOverrides, setLocalOverrides] = useState<
    Map<number, { importance_score: number; competency_score: number }>
  >(new Map());
  const localOverridesRef = useRef(localOverrides);
  useEffect(() => { localOverridesRef.current = localOverrides; }, [localOverrides]);

  const debounceTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
  useEffect(() => {
    return () => { debounceTimers.current.forEach((t) => clearTimeout(t)); };
  }, []);

  const practicesByArea = useMemo(() => {
    if (!practices) return new Map<number, Practice[]>();
    return practices.reduce<Map<number, Practice[]>>((map, p) => {
      const list = map.get(p.area_id) ?? [];
      list.push(p);
      map.set(p.area_id, list);
      return map;
    }, new Map());
  }, [practices]);

  const maturityByPractice = useMemo(() => {
    if (!maturityLevels) return new Map<number, MaturityLevel[]>();
    return maturityLevels.reduce<Map<number, MaturityLevel[]>>((map, ml) => {
      const list = map.get(ml.practice_id) ?? [];
      list.push(ml);
      map.set(ml.practice_id, list);
      return map;
    }, new Map());
  }, [maturityLevels]);

  const responsesMap = useMemo(() => {
    if (!responses) return new Map<number, { importance_score: number; competency_score: number }>();
    return new Map(
      responses.map((r): [number, { importance_score: number; competency_score: number }] => [
        r.practice_id,
        { importance_score: r.importance_score, competency_score: r.competency_score },
      ]),
    );
  }, [responses]);

  const displayResponses = useMemo(() => {
    const merged = new Map(responsesMap);
    localOverrides.forEach((val, key) => merged.set(key, val));
    return merged;
  }, [responsesMap, localOverrides]);

  const scoredCount = useMemo(() => {
    return [...displayResponses.values()].filter(
      (r) => r.importance_score > 0 && r.competency_score > 0,
    ).length;
  }, [displayResponses]);

  const responsesMapRef = useRef(responsesMap);
  useEffect(() => { responsesMapRef.current = responsesMap; }, [responsesMap]);

  const handleScoreChange = useCallback(
    (practiceId: number, field: "importance_score" | "competency_score", value: number) => {
      setLocalOverrides((prev) => {
        const existing =
          prev.get(practiceId) ??
          responsesMapRef.current.get(practiceId) ??
          { importance_score: 0, competency_score: 0 };
        const next = new Map(prev);
        next.set(practiceId, { ...existing, [field]: value });
        return next;
      });

      const existingTimer = debounceTimers.current.get(practiceId);
      if (existingTimer) clearTimeout(existingTimer);

      debounceTimers.current.set(
        practiceId,
        setTimeout(() => {
          const overrides = localOverridesRef.current;
          const base =
            overrides.get(practiceId) ??
            responsesMapRef.current.get(practiceId) ??
            { importance_score: 0, competency_score: 0 };
          const payload = { ...base, [field]: value };

          upsertResponse.mutate({
            round_id: activeRound!.id,
            organization_id: organizationId!,
            practice_id: practiceId,
            importance_score: payload.importance_score,
            competency_score: payload.competency_score,
          });
          debounceTimers.current.delete(practiceId);
        }, 500),
      );
    },
    [activeRound, organizationId, upsertResponse],
  );

  const handleCompleteRound = useCallback(async () => {
    if (!activeRound || !organizationId) return;

    // Flush all pending debounced saves
    const pendingPromises: Promise<void>[] = [];
    debounceTimers.current.forEach((timer, practiceId) => {
      clearTimeout(timer);
      const overrides = localOverridesRef.current;
      const payload =
        overrides.get(practiceId) ??
        responsesMapRef.current.get(practiceId) ??
        { importance_score: 0, competency_score: 0 };

      pendingPromises.push(
        new Promise<void>((resolve, reject) => {
          upsertResponse.mutate(
            {
              round_id: activeRound.id,
              organization_id: organizationId,
              practice_id: practiceId,
              ...payload,
            },
            { onSuccess: () => resolve(), onError: reject },
          );
        }),
      );
    });
    debounceTimers.current.clear();

    if (pendingPromises.length > 0) await Promise.all(pendingPromises);

    completeRound.mutate({
      round_id: activeRound.id,
      organization_id: organizationId,
    });

    setLocalOverrides(new Map());
  }, [activeRound, organizationId, upsertResponse, completeRound]);

  const isLoading = authLoading || orgLoading || roundLoading;
  const isCompleted = !!activeRound?.completed_at;
  const totalPractices = practices?.length ?? 82;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-2 bg-muted rounded-full animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          No organization found. Contact your admin.
        </p>
      </div>
    );
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Assessment</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rate 82 practices across 8 areas on importance and competency (1-5)
          </p>
          {activeRound && (
            <p className="text-xs text-muted-foreground mt-1">
              {activeRound.name}
              {isCompleted && (
                <span className="ml-2 text-xs text-green-600 font-medium">
                  Completed
                </span>
              )}
            </p>
          )}
        </div>

        <AssessmentProgress
          totalPractices={totalPractices}
          scoredCount={scoredCount}
        />

        <Accordion.Root type="single" collapsible className="space-y-2">
          {areas?.map((area) => (
            <AreaAccordion
              key={area.id}
              area={area}
              practices={practicesByArea.get(area.id) ?? []}
              maturityLevelsByPractice={maturityByPractice}
              responsesMap={displayResponses}
              onScoreChange={handleScoreChange}
              disabled={isCompleted}
            />
          ))}
        </Accordion.Root>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCompleteRound}
            disabled={scoredCount < totalPractices || isCompleted || completeRound.isPending}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completeRound.isPending ? "Completing..." : "Complete Round"}
          </button>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
