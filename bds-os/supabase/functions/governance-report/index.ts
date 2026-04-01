// BDS OS — Edge Function: Governance Report
// POST { organization_id, view_type, user_id?, reporting_period? }
// Produces structured governance views: executive, board, or functional leader.
// All responses are structured objects for direct UI rendering.
//
// NOTE: Engine logic (delegation-index, operating-debt) is reimplemented inline here
// because Deno edge functions bundle independently. The canonical engine implementations
// live in src/engines/ for use by the frontend and tests.

import { createServiceClient } from '../shared/supabase-client.ts';
import { corsResponse, jsonResponse, errorResponse } from '../shared/cors.ts';

type ViewType = 'executive' | 'board' | 'functional';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse();

  try {
    const body = await req.json();
    const { organization_id, view_type, user_id, reporting_period } = body;

    if (!organization_id || !view_type) {
      return errorResponse('Missing organization_id or view_type');
    }
    if (!['executive', 'board', 'functional'].includes(view_type)) {
      return errorResponse('view_type must be executive, board, or functional');
    }
    if (view_type === 'functional' && !user_id) {
      return errorResponse('user_id required for functional view');
    }

    const supabase = createServiceClient();
    const now = new Date().toISOString();

    // ── Shared Data Fetches ──────────────────────────────────────────

    // Organization
    const { data: org } = await supabase
      .from('organizations')
      .select('lifecycle_stage')
      .eq('id', organization_id)
      .single();

    if (!org) return errorResponse('Organization not found', 404);

    // Latest focus portfolio
    const { data: portfolio } = await supabase
      .from('focus_portfolios')
      .select('*')
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Practices + areas
    const { data: practices } = await supabase
      .from('practices')
      .select('id, name, area_id, areas!inner(name)');

    const practiceMap = new Map(practices?.map((p: any) => [p.id, p]) ?? []);

    // Practice metadata (risk floors, pnl_impact, etc.)
    const { data: practiceMetadata } = await supabase
      .from('practice_metadata')
      .select('practice_id, pnl_impact, speed_to_impact, dependency_score, risk_floor, risk_floor_level');

    const metadataMap = new Map(practiceMetadata?.map((m: any) => [m.practice_id, m]) ?? []);

    // Latest OPI scores
    const { data: opiScores } = await supabase
      .from('opi_scores')
      .select('practice_id, final_opi, phase_number, risk_floor_triggered')
      .eq('organization_id', organization_id)
      .order('computed_at', { ascending: false });

    // Initiatives
    const { data: initiatives } = await supabase
      .from('initiatives')
      .select('id, practice_id, title, status, owner_id, created_at, updated_at')
      .eq('organization_id', organization_id);

    // Latest two assessment rounds (for current + previous comparison)
    const { data: rounds } = await supabase
      .from('assessment_rounds')
      .select('id, created_at')
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false })
      .limit(2);

    const latestRoundId = rounds?.[0]?.id ?? null;
    const previousRoundId = rounds?.[1]?.id ?? null;

    // Latest round responses (current competency scores)
    let currentScores: any[] = [];
    if (latestRoundId) {
      const { data } = await supabase
        .from('round_responses')
        .select('practice_id, competency_score, importance_score')
        .eq('round_id', latestRoundId)
        .eq('organization_id', organization_id);
      currentScores = data ?? [];
    }
    const currentScoreMap = new Map(currentScores.map((s: any) => [s.practice_id, s]));

    // Previous round responses (for delta comparison)
    let previousScores: any[] = [];
    if (previousRoundId) {
      const { data } = await supabase
        .from('round_responses')
        .select('practice_id, competency_score')
        .eq('round_id', previousRoundId)
        .eq('organization_id', organization_id);
      previousScores = data ?? [];
    }
    const previousScoreMap = new Map(previousScores.map((s: any) => [s.practice_id, s]));

    // ── Executive View ───────────────────────────────────────────────

    if (view_type === 'executive') {
      const activePracticeIds = portfolio?.active_practice_ids ?? [];

      const activePractices = activePracticeIds.map((pid: number) => {
        const practice = practiceMap.get(pid);
        const practiceInitiatives = initiatives?.filter((i: any) => i.practice_id === pid) ?? [];
        const opi = opiScores?.find((s: any) => s.practice_id === pid);
        const score = currentScoreMap.get(pid);
        const meta = metadataMap.get(pid);
        return {
          practice_id: pid,
          practice_name: practice?.name ?? '',
          area_name: practice?.areas?.name ?? '',
          current_level: score?.competency_score ?? 0,
          target_level: Math.min(5, (score?.competency_score ?? 0) + 1),
          initiative_count: practiceInitiatives.length,
          initiatives_in_progress: practiceInitiatives.filter((i: any) => i.status === 'in_progress').length,
          initiatives_completed: practiceInitiatives.filter((i: any) => i.status === 'approved').length,
        };
      });

      // Top P&L contributors
      const topContributors = (opiScores ?? [])
        .sort((a: any, b: any) => b.final_opi - a.final_opi)
        .slice(0, 5)
        .map((s: any) => ({
          practice_id: s.practice_id,
          practice_name: practiceMap.get(s.practice_id)?.name ?? '',
          pnl_impact: metadataMap.get(s.practice_id)?.pnl_impact ?? 0,
          final_opi: s.final_opi,
          phase_number: s.phase_number,
        }));

      // Pending decisions
      const { data: pendingScrs } = await supabase
        .from('score_change_requests')
        .select('id, created_at, resolved_at, status')
        .eq('organization_id', organization_id);

      const pendingCount = pendingScrs?.filter((s: any) => s.status === 'pending').length ?? 0;

      // Delegation index — computed from approvals + score_change_requests
      const { data: approvals } = await supabase
        .from('approvals')
        .select('approved_by, created_at')
        .in('score_change_request_id', (pendingScrs ?? []).map((s: any) => s.id));

      const { data: users } = await supabase
        .from('users')
        .select('id, role')
        .eq('organization_id', organization_id);

      const userRoleMap = new Map(users?.map((u: any) => [u.id, u.role]) ?? []);
      const totalApprovals = approvals?.length ?? 0;
      const nonAdminApprovals = approvals?.filter(
        (a: any) => userRoleMap.get(a.approved_by) !== 'admin',
      ).length ?? 0;
      const pctDecisionsBelowCeo = totalApprovals > 0
        ? Math.round((nonAdminApprovals / totalApprovals) * 1000) / 10
        : 0;

      // Escalations: requests pending > 7 days
      const escalationThresholdMs = 7 * 24 * 60 * 60 * 1000;
      const nowMs = Date.now();
      const escalations = (pendingScrs ?? []).filter((scr: any) => {
        if (scr.status === 'pending') {
          return (nowMs - new Date(scr.created_at).getTime()) > escalationThresholdMs;
        }
        if (scr.resolved_at) {
          return (new Date(scr.resolved_at).getTime() - new Date(scr.created_at).getTime()) > escalationThresholdMs;
        }
        return false;
      }).length;

      // Average decision latency
      const resolvedRequests = (pendingScrs ?? []).filter((s: any) => s.resolved_at !== null);
      let avgDecisionLatencyHours = 0;
      if (resolvedRequests.length > 0) {
        const totalLatencyMs = resolvedRequests.reduce((sum: number, scr: any) => {
          return sum + (new Date(scr.resolved_at).getTime() - new Date(scr.created_at).getTime());
        }, 0);
        avgDecisionLatencyHours = Math.round((totalLatencyMs / resolvedRequests.length / (1000 * 60 * 60)) * 10) / 10;
      }

      // Delegation health
      let delegationHealth: string;
      if (pctDecisionsBelowCeo >= 60) {
        delegationHealth = 'healthy';
      } else if (pctDecisionsBelowCeo >= 30) {
        delegationHealth = 'moderate';
      } else {
        delegationHealth = 'concentrated';
      }

      // Risk alerts
      const riskAlerts: any[] = [];
      for (const score of opiScores ?? []) {
        if (score.risk_floor_triggered) {
          riskAlerts.push({
            severity: 'critical',
            category: 'risk_floor_breach',
            practice_id: score.practice_id,
            practice_name: practiceMap.get(score.practice_id)?.name ?? '',
            message: `${practiceMap.get(score.practice_id)?.name} is below its risk floor`,
            recommended_action: 'Prioritize immediate remediation of this practice',
          });
        }
      }

      // Stalled initiatives (in_progress for > 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const stalledInitiatives = (initiatives ?? []).filter(
        (i: any) => i.status === 'in_progress' && i.updated_at < thirtyDaysAgo,
      );
      for (const stalled of stalledInitiatives) {
        riskAlerts.push({
          severity: 'medium',
          category: 'stalled_initiative',
          practice_id: stalled.practice_id,
          practice_name: practiceMap.get(stalled.practice_id)?.name ?? '',
          message: `Initiative "${stalled.title}" has been in progress for over 30 days`,
          recommended_action: 'Review initiative scope and blockers',
        });
      }

      // Decision cycle trend
      const recentResolved = resolvedRequests.filter(
        (s: any) => new Date(s.resolved_at).getTime() > (nowMs - 30 * 24 * 60 * 60 * 1000),
      );
      const olderResolved = resolvedRequests.filter(
        (s: any) => {
          const resolved = new Date(s.resolved_at).getTime();
          return resolved <= (nowMs - 30 * 24 * 60 * 60 * 1000) && resolved > (nowMs - 60 * 24 * 60 * 60 * 1000);
        },
      );
      let decisionTrend = 'stable';
      if (recentResolved.length > 0 && olderResolved.length > 0) {
        const recentAvg = recentResolved.reduce((sum: number, s: any) =>
          sum + (new Date(s.resolved_at).getTime() - new Date(s.created_at).getTime()), 0) / recentResolved.length;
        const olderAvg = olderResolved.reduce((sum: number, s: any) =>
          sum + (new Date(s.resolved_at).getTime() - new Date(s.created_at).getTime()), 0) / olderResolved.length;
        decisionTrend = recentAvg < olderAvg * 0.8 ? 'improving' : recentAvg > olderAvg * 1.2 ? 'degrading' : 'stable';
      }

      return jsonResponse({
        view_type: 'executive',
        data: {
          organization_id,
          generated_at: now,
          lifecycle_stage: org.lifecycle_stage,
          active_practices: activePractices,
          estimated_60_day_pnl_impact: {
            total_score: topContributors.reduce((sum: number, c: any) => sum + c.final_opi, 0),
            top_contributors: topContributors,
          },
          delegation_index: {
            pct_decisions_below_ceo: pctDecisionsBelowCeo,
            escalations_per_month: Math.round((escalations / Math.max(1, 90 / 30)) * 10) / 10,
            avg_decision_latency_hours: avgDecisionLatencyHours,
            delegation_health: delegationHealth,
          },
          decision_cycle: {
            average_hours: avgDecisionLatencyHours,
            trend: decisionTrend,
            pending_decisions: pendingCount,
          },
          risk_alerts: riskAlerts,
        },
      });
    }

    // ── Board View ───────────────────────────────────────────────────

    if (view_type === 'board') {
      // Area maturity deltas — computed from two most recent rounds
      const { data: areas } = await supabase.from('areas').select('id, name');

      const areaMaturityDelta = (areas ?? []).map((area: any) => {
        const areaPracticeIds = practices?.filter((p: any) => p.area_id === area.id).map((p: any) => p.id) ?? [];

        // Current average competency for this area
        const currentAreaScores = areaPracticeIds
          .map((pid: number) => currentScoreMap.get(pid)?.competency_score)
          .filter((s: any) => s !== undefined);
        const currentAvg = currentAreaScores.length > 0
          ? Math.round((currentAreaScores.reduce((a: number, b: number) => a + b, 0) / currentAreaScores.length) * 10) / 10
          : 0;

        // Previous average competency for this area
        const prevAreaScores = areaPracticeIds
          .map((pid: number) => previousScoreMap.get(pid)?.competency_score)
          .filter((s: any) => s !== undefined);
        const prevAvg = prevAreaScores.length > 0
          ? Math.round((prevAreaScores.reduce((a: number, b: number) => a + b, 0) / prevAreaScores.length) * 10) / 10
          : 0;

        return {
          area_id: area.id,
          area_name: area.name,
          previous_average_level: prevAvg,
          current_average_level: currentAvg,
          delta: Math.round((currentAvg - prevAvg) * 10) / 10,
          practice_count: areaPracticeIds.length,
        };
      });

      // Phase distribution
      const phase1 = opiScores?.filter((s: any) => s.phase_number === 1) ?? [];
      const phase2 = opiScores?.filter((s: any) => s.phase_number === 2) ?? [];
      const phase3 = opiScores?.filter((s: any) => s.phase_number === 3) ?? [];
      const total = opiScores?.length ?? 1;

      // Operating debt — computed from real data
      // Practices below level 2
      const practicesBelowLevel2 = currentScores
        .filter((s: any) => s.competency_score < 2)
        .map((s: any) => {
          const practice = practiceMap.get(s.practice_id);
          const meta = metadataMap.get(s.practice_id);
          return {
            practice_id: s.practice_id,
            practice_name: practice?.name ?? '',
            area_name: practice?.areas?.name ?? '',
            current_level: s.competency_score,
            risk_floor: meta?.risk_floor ?? false,
          };
        });

      // Expired evidence
      const { data: evidenceItems } = await supabase
        .from('evidence')
        .select('id, initiative_id, created_at, initiatives!inner(practice_id, organization_id)')
        .eq('initiatives.organization_id', organization_id);

      const { data: maturityLevels } = await supabase
        .from('maturity_levels')
        .select('practice_id, level, expiry_period_days')
        .not('expiry_period_days', 'is', null);

      const expiryMap = new Map<number, number>();
      for (const ml of maturityLevels ?? []) {
        // Use the shortest expiry for any level of this practice
        const existing = expiryMap.get(ml.practice_id);
        if (!existing || ml.expiry_period_days < existing) {
          expiryMap.set(ml.practice_id, ml.expiry_period_days);
        }
      }

      const nowMs = Date.now();
      const expiredEvidenceItems = (evidenceItems ?? [])
        .filter((ev: any) => {
          const practiceId = ev.initiatives?.practice_id;
          const expiryDays = expiryMap.get(practiceId);
          if (!expiryDays) return false;
          const createdAt = new Date(ev.created_at).getTime();
          return nowMs > (createdAt + expiryDays * 24 * 60 * 60 * 1000);
        })
        .map((ev: any) => {
          const practiceId = ev.initiatives?.practice_id;
          const expiryDays = expiryMap.get(practiceId)!;
          const createdAt = new Date(ev.created_at).getTime();
          const expiresAt = createdAt + expiryDays * 24 * 60 * 60 * 1000;
          return {
            evidence_id: ev.id,
            practice_id: practiceId,
            practice_name: practiceMap.get(practiceId)?.name ?? '',
            expired_at: new Date(expiresAt).toISOString(),
            days_overdue: Math.ceil((nowMs - expiresAt) / (24 * 60 * 60 * 1000)),
          };
        });

      // Risk floor breaches — from practice_metadata + current scores
      const riskBreaches = (opiScores ?? []).filter((s: any) => s.risk_floor_triggered);
      const riskFloorBreachDetails = riskBreaches.map((s: any) => {
        const meta = metadataMap.get(s.practice_id);
        const score = currentScoreMap.get(s.practice_id);
        const riskLevel = meta?.risk_floor_level ?? 0;
        const currentLevel = score?.competency_score ?? 0;
        return {
          practice_id: s.practice_id,
          practice_name: practiceMap.get(s.practice_id)?.name ?? '',
          risk_floor_level: riskLevel,
          current_level: currentLevel,
          gap: riskLevel - currentLevel,
          severity: (riskLevel - currentLevel) >= 2 ? 'critical' : 'warning',
        };
      });

      const totalDebtScore =
        practicesBelowLevel2.length * 2 +
        expiredEvidenceItems.length * 1 +
        riskFloorBreachDetails.length * 3;

      // Meetings adherence
      const { data: meetings } = await supabase
        .from('meetings')
        .select('type, date, decisions, action_items')
        .eq('organization_id', organization_id);

      const weeklyMeetings = meetings?.filter((m: any) => m.type === 'weekly').length ?? 0;
      const monthlyMeetings = meetings?.filter((m: any) => m.type === 'monthly').length ?? 0;
      const quarterlyMeetings = meetings?.filter((m: any) => m.type === 'quarterly').length ?? 0;

      // Decision log completeness: % of meetings that have at least one decision logged
      const meetingsWithDecisions = meetings?.filter(
        (m: any) => Array.isArray(m.decisions) && m.decisions.length > 0,
      ).length ?? 0;
      const totalMeetings = meetings?.length ?? 0;
      const decisionLogCompleteness = totalMeetings > 0
        ? Math.round((meetingsWithDecisions / totalMeetings) * 100)
        : 0;

      // Action item completion rate: % of action items marked done
      let totalActionItems = 0;
      let completedActionItems = 0;
      for (const meeting of meetings ?? []) {
        if (Array.isArray(meeting.action_items)) {
          for (const item of meeting.action_items) {
            totalActionItems++;
            if (item.status === 'done' || item.status === 'completed' || item.completed === true) {
              completedActionItems++;
            }
          }
        }
      }
      const actionItemCompletionRate = totalActionItems > 0
        ? Math.round((completedActionItems / totalActionItems) * 100)
        : 0;

      return jsonResponse({
        view_type: 'board',
        data: {
          organization_id,
          generated_at: now,
          reporting_period: reporting_period ?? 'current',
          area_maturity_delta: areaMaturityDelta,
          phase_distribution: {
            proof: { count: phase1.length, percentage: Math.round((phase1.length / total) * 100) },
            structure: { count: phase2.length, percentage: Math.round((phase2.length / total) * 100) },
            scale: { count: phase3.length, percentage: Math.round((phase3.length / total) * 100) },
          },
          operating_debt: {
            total_debt_score: totalDebtScore,
            practices_below_level_2: practicesBelowLevel2,
            expired_evidence_count: expiredEvidenceItems.length,
            expired_evidence_items: expiredEvidenceItems,
            risk_floor_breaches: riskFloorBreachDetails,
            debt_trend: 'stable',
          },
          governance_health: {
            meeting_cadence_adherence: {
              weekly: { expected: 12, actual: weeklyMeetings, adherence_pct: Math.round((weeklyMeetings / 12) * 100) },
              monthly: { expected: 3, actual: monthlyMeetings, adherence_pct: Math.round((monthlyMeetings / 3) * 100) },
              quarterly: { expected: 1, actual: quarterlyMeetings, adherence_pct: Math.round((quarterlyMeetings / 1) * 100) },
            },
            decision_log_completeness: decisionLogCompleteness,
            action_item_completion_rate: actionItemCompletionRate,
            overall_health: weeklyMeetings >= 10 ? 'strong' : weeklyMeetings >= 6 ? 'adequate' : 'weak',
          },
          narrative_summary: {
            overall_trajectory: totalDebtScore > 20 ? 'at_risk' : totalDebtScore > 10 ? 'needs_attention' : 'on_track',
            key_wins: areaMaturityDelta
              .filter((a: any) => a.delta > 0)
              .map((a: any) => `${a.area_name} improved by ${a.delta} levels`),
            key_risks: riskFloorBreachDetails.map((b: any) => `${b.practice_name} is ${b.gap} level(s) below risk floor`),
            recommended_actions: [
              ...(riskFloorBreachDetails.length > 0 ? ['Address risk floor breaches before next board meeting'] : []),
              ...(expiredEvidenceItems.length > 0 ? [`Refresh ${expiredEvidenceItems.length} expired evidence item(s)`] : []),
              ...(practicesBelowLevel2.length > 3 ? ['Focus on foundational maturity — too many practices below Level 2'] : []),
              ...(riskFloorBreachDetails.length === 0 && expiredEvidenceItems.length === 0 ? ['Continue current execution cadence'] : []),
            ],
          },
        },
      });
    }

    // ── Functional Leader View ───────────────────────────────────────

    if (view_type === 'functional') {
      // Fetch user
      const { data: user } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', user_id)
        .single();

      if (!user) return errorResponse('User not found', 404);

      // Find initiatives owned by this user
      const ownedInitiatives = (initiatives ?? []).filter((i: any) => i.owner_id === user_id);
      const ownedPracticeIds = [...new Set(ownedInitiatives.map((i: any) => i.practice_id))];

      const ownedPractices = ownedPracticeIds.map((pid: number) => {
        const practice = practiceMap.get(pid);
        const opi = opiScores?.find((s: any) => s.practice_id === pid);
        const practiceInitiatives = ownedInitiatives.filter((i: any) => i.practice_id === pid);
        const score = currentScoreMap.get(pid);
        const pendingEvidence = practiceInitiatives.filter(
          (i: any) => i.status === 'evidence_ready' || i.status === 'in_progress',
        ).length;

        return {
          practice_id: pid,
          practice_name: practice?.name ?? '',
          area_name: practice?.areas?.name ?? '',
          current_level: score?.competency_score ?? 0,
          final_opi: opi?.final_opi ?? 0,
          phase_number: opi?.phase_number ?? 3,
          active_initiatives: practiceInitiatives.filter((i: any) => i.status !== 'approved').length,
          pending_evidence: pendingEvidence,
        };
      });

      // Evidence required — what's needed to level up each owned practice
      const { data: allMaturityLevels } = await supabase
        .from('maturity_levels')
        .select('practice_id, level, descriptor, evidence_criteria')
        .in('practice_id', ownedPracticeIds)
        .order('practice_id')
        .order('level');

      const evidenceRequired = ownedPractices
        .filter((op: any) => op.current_level < 5)
        .map((op: any) => {
          const targetLevel = op.current_level + 1;
          const maturity = allMaturityLevels?.find(
            (ml: any) => ml.practice_id === op.practice_id && ml.level === targetLevel,
          );
          return {
            practice_id: op.practice_id,
            practice_name: op.practice_name,
            current_level: op.current_level,
            target_level: targetLevel,
            target_descriptor: maturity?.descriptor ?? '',
            evidence_criteria: maturity?.evidence_criteria ?? '',
          };
        });

      // Coaching prompts based on practice state
      const coachingPrompts = ownedPractices.map((op: any) => {
        if (op.current_level < 2) {
          return {
            practice_id: op.practice_id,
            practice_name: op.practice_name,
            prompt_type: 'risk_mitigation',
            message: `${op.practice_name} is at Level ${op.current_level} — foundational gap`,
            suggested_action: 'Focus on establishing basic processes and documentation first',
          };
        }
        if (op.pending_evidence > 0) {
          return {
            practice_id: op.practice_id,
            practice_name: op.practice_name,
            prompt_type: 'next_step',
            message: `${op.practice_name} has ${op.pending_evidence} initiative(s) needing evidence`,
            suggested_action: 'Upload evidence artifacts and submit for AI grading',
          };
        }
        if (op.active_initiatives === 0) {
          return {
            practice_id: op.practice_id,
            practice_name: op.practice_name,
            prompt_type: 'level_up',
            message: `${op.practice_name} has no active initiatives — ready to level up?`,
            suggested_action: 'Create a new initiative targeting Level ' + (op.current_level + 1),
          };
        }
        return {
          practice_id: op.practice_id,
          practice_name: op.practice_name,
          prompt_type: 'quick_win',
          message: `${op.practice_name} is active — keep momentum`,
          suggested_action: 'Review current initiatives and identify next deliverable',
        };
      });

      // Adoption tracking — computed from initiative completion ratio + evidence activity
      const adoptionTracking = ownedPractices.map((op: any) => {
        const practiceInitiatives = ownedInitiatives.filter((i: any) => i.practice_id === op.practice_id);
        const totalInits = practiceInitiatives.length;
        const completedInits = practiceInitiatives.filter((i: any) => i.status === 'approved').length;
        const adoptionScore = totalInits > 0 ? Math.round((completedInits / totalInits) * 100) : 0;

        // Find most recent activity
        const lastActivity = practiceInitiatives
          .map((i: any) => i.updated_at)
          .sort()
          .pop() ?? null;

        return {
          practice_id: op.practice_id,
          practice_name: op.practice_name,
          adoption_score: adoptionScore,
          trend: 'stable',
          last_activity_date: lastActivity,
        };
      });

      return jsonResponse({
        view_type: 'functional',
        data: {
          user_id,
          user_name: user.name,
          generated_at: now,
          owned_practices: ownedPractices,
          evidence_required: evidenceRequired,
          coaching_prompts: coachingPrompts,
          adoption_tracking: adoptionTracking,
        },
      });
    }

    return errorResponse('Unknown view type');
  } catch (err) {
    return errorResponse(`Internal error: ${(err as Error).message}`, 500);
  }
});
