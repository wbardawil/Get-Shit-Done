"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { selectFocusPortfolio } from "@/lib/edge-functions";

export function useFocusPortfolio(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["focus-portfolio", organizationId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("focus_portfolios")
        .select("*")
        .eq("organization_id", organizationId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useSelectPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      organization_id: string;
      round_id: string;
      quarter: string;
    }) => {
      return selectFocusPortfolio(
        params.organization_id,
        params.round_id,
        params.quarter,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["focus-portfolio", variables.organization_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["initiatives", variables.organization_id],
      });
    },
  });
}
