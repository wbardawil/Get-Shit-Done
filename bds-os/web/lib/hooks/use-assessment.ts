"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useAssessmentRounds(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["assessment-rounds", organizationId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("assessment_rounds")
        .select("*")
        .eq("organization_id", organizationId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useRoundResponses(
  roundId: string | undefined,
  organizationId: string | undefined,
) {
  return useQuery({
    queryKey: ["round-responses", roundId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("round_responses")
        .select("*")
        .eq("round_id", roundId!)
        .eq("organization_id", organizationId!);
      if (error) throw error;
      return data;
    },
    enabled: !!roundId && !!organizationId,
  });
}

export function useUpsertResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      round_id: string;
      organization_id: string;
      practice_id: number;
      importance_score: number;
      competency_score: number;
    }) => {
      const supabase = createClient();
      const { error } = await supabase.from("round_responses").upsert(params, {
        onConflict: "round_id,organization_id,practice_id",
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["round-responses", variables.round_id],
      });
    },
  });
}
