"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: Infinity, // Reference data never changes
  });
}

export function usePractices() {
  return useQuery({
    queryKey: ["practices"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("practices")
        .select("*, areas!inner(name)")
        .order("area_id")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });
}

export function useMaturityLevels(practiceId?: number) {
  return useQuery({
    queryKey: ["maturity-levels", practiceId],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("maturity_levels")
        .select("*")
        .order("practice_id")
        .order("level");
      if (practiceId) {
        query = query.eq("practice_id", practiceId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });
}
