import { createClient } from "@/lib/supabase/client";

// Typed wrappers for BDS OS edge functions.
// Each function calls the corresponding Supabase edge function and returns typed data.

export async function computeOPI(roundId: string, organizationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("compute-opi", {
    body: { round_id: roundId, organization_id: organizationId },
  });
  if (error) throw new Error(`compute-opi failed: ${error.message}`);
  return data;
}

export async function determineLifecycle(organizationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke(
    "determine-lifecycle",
    {
      body: { organization_id: organizationId },
    },
  );
  if (error) throw new Error(`determine-lifecycle failed: ${error.message}`);
  return data;
}

export async function selectFocusPortfolio(
  organizationId: string,
  roundId: string,
  quarter: string,
) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke(
    "select-focus-portfolio",
    {
      body: {
        organization_id: organizationId,
        round_id: roundId,
        quarter,
      },
    },
  );
  if (error)
    throw new Error(`select-focus-portfolio failed: ${error.message}`);
  return data;
}

export async function gradeEvidence(evidenceId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("grade-evidence", {
    body: { evidence_id: evidenceId },
  });
  if (error) throw new Error(`grade-evidence failed: ${error.message}`);
  return data;
}

export type GovernanceViewType = "executive" | "board" | "functional";

export async function fetchGovernanceReport(
  organizationId: string,
  viewType: GovernanceViewType,
  userId?: string,
  reportingPeriod?: string,
) {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke(
    "governance-report",
    {
      body: {
        organization_id: organizationId,
        view_type: viewType,
        user_id: userId,
        reporting_period: reportingPeriod,
      },
    },
  );
  if (error) throw new Error(`governance-report failed: ${error.message}`);
  return data;
}
