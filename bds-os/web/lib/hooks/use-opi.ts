"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { computeOPI } from "@/lib/edge-functions";

export function useOPIScores(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["opi-scores", organizationId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("opi_scores")
        .select("*, practices!inner(name, area_id, areas!inner(name))")
        .eq("organization_id", organizationId!)
        .order("final_opi", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useComputeOPI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      round_id: string;
      organization_id: string;
    }) => {
      return computeOPI(params.round_id, params.organization_id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["opi-scores", variables.organization_id],
      });
    },
  });
}
