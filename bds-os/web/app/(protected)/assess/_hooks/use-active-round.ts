"use client";

import { useEffect, useRef } from "react";
import {
  useAssessmentRounds,
  useCreateRound,
} from "@/lib/hooks/use-assessment";

export function useActiveRound(organizationId: string | undefined) {
  const { data: rounds, isLoading } = useAssessmentRounds(organizationId);
  const createRound = useCreateRound();
  const creatingRef = useRef(false);

  const activeRound = rounds?.find((r: { completed_at: string | null }) => r.completed_at === null) ?? null;

  useEffect(() => {
    if (!organizationId || isLoading || creatingRef.current) return;
    if (!rounds || rounds.length === 0 || rounds.every((r: { completed_at: string | null }) => r.completed_at)) {
      creatingRef.current = true;
      const roundNumber = (rounds?.length ?? 0) + 1;
      createRound.mutate(
        { organization_id: organizationId, name: `Round ${roundNumber}` },
        { onSettled: () => { creatingRef.current = false; } },
      );
    }
  }, [organizationId, isLoading, rounds, createRound]);

  return {
    activeRound,
    isLoading: isLoading || createRound.isPending,
  };
}
