"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useInitiatives(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["initiatives", organizationId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("initiatives")
        .select("*, practices!inner(name, area_id, areas!inner(name))")
        .eq("organization_id", organizationId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useUpdateInitiativeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      initiative_id: string;
      status: string;
      organization_id: string;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("initiatives")
        .update({ status: params.status })
        .eq("id", params.initiative_id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["initiatives", variables.organization_id],
      });
    },
  });
}
