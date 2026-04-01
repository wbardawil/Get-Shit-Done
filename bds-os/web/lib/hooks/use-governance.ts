"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchGovernanceReport,
  type GovernanceViewType,
} from "@/lib/edge-functions";

export function useGovernanceReport(
  organizationId: string | undefined,
  viewType: GovernanceViewType,
  userId?: string,
) {
  return useQuery({
    queryKey: ["governance-report", organizationId, viewType, userId],
    queryFn: async () => {
      return fetchGovernanceReport(organizationId!, viewType, userId);
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
