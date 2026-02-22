# BDS OS V2 --- Discovery Document

**Version:** 1.0
**Date:** 2026-02-22
**Status:** Draft --- awaiting review

---

## 1. Product Vision

### Who BDS OS is for

BDS OS serves **CEOs, COOs, and leadership teams of $1M--$100M businesses** preparing for or undergoing operational scaling, PE-backed growth, or exit preparation. Secondary users include:

- **Functional leaders / department heads** who own specific operational practices
- **PE operating partners and board members** who need credible operational diligence
- **Business consultants** who embed BDS OS as their delivery platform

### The core problem

Mid-market companies have no objective, continuous way to measure operational maturity across their business. Maturity assessments happen episodically (annual consulting engagement or ad-hoc spreadsheet), produce subjective results, and generate bursty effort that doesn't compound. Leadership teams are misaligned on what to fix first, consultants create dependency rather than capability, and key-person risk remains invisible until a crisis.

### The BDS OS loop

BDS OS implements a continuous 5-phase operating loop:

```
Assess --> Orient/OPI --> Focus Portfolio --> Execute Initiatives --> Govern & Learn
  ^                                                                        |
  +------------------------------------------------------------------------+
```

Each cycle produces a maturity snapshot, an objective priority ranking, a WIP-limited work plan, evidence-graded progress, and governance reports---then feeds back into the next assessment round.

---

## 2. Core Pains (10)

These pains are addressed in V2. Items P1--P5 are founding pains; P6--P12 are newly promoted to Core based on impact and architectural alignment.

| ID  | Pain | Why Core |
|-----|------|----------|
| P1  | **Subjective, fuzzy maturity** | Founding pain. The 82-practice x 5-level ontology exists to solve this. |
| P2  | **Misaligned, slow execution** | Founding pain. OPI engine + focus portfolio + quarterly cycles directly address it. |
| P3  | **Siloed, fragmented information** | Founding pain. Evidence vault + artifact uploads consolidate proof-of-work in one place. |
| P4  | **Bursty effort, not compounding progress** | Founding pain. Kanban state machine + WIP limits enforce steady flow. |
| P5  | **Knowledge bottlenecks and failed consulting** | Founding pain. "Applied MBA in a box" --- coaching prompts, rubrics, and grading replace consultant dependency. |
| P6  | **Key-person / succession risk** | Delegation index engine already built. PE investors ask about this in every diligence. |
| P7  | **Initiative overload / change fatigue** | WIP limits and focus portfolio engine enforce this structurally. Behavioral complement to P2. |
| P9  | **No early-warning system for emerging crises** | Evidence expiry, declining OPI, and stalled Kanban cards are already in the schema. Alerting is a thin view layer. |
| P10 | **Due-diligence / transaction readiness** | Maturity map + evidence vault + governance reports form a standing diligence room. |
| P12 | **Middle management is the weakest link** | Functional leader governance view + coaching prompts target the strategy-to-execution translation gap. |

---

## 3. Core Jobs-to-Be-Done (11)

| ID  | Job | Why Core |
|-----|-----|----------|
| J1  | **Maintain a live maturity map across ~82 practices** | Founding job. Assessment --> round_responses --> maturity scoring pipeline is the product's spine. |
| J2  | **Give each practice owner an objective 1--5 benchmark** | Founding job. 410 maturity levels with descriptors and evidence criteria already seeded. |
| J3  | **Turn uploaded artifacts into evidence-based grading via agents** | Founding job. `grade-evidence` edge function with criteria matching already built. |
| J4  | **Align leadership around a focused portfolio with quarterly cycles** | Founding job. `select-focus-portfolio` engine + WIP limits already built. |
| J5  | **Act as an applied MBA in a box** | Founding job. Coaching prompts + maturity rubrics + OPI prioritization deliver this. |
| J6  | **Provide clear, quantified progress for boards and investors** | Founding job. `governance-report` edge function with Executive/Board/Functional views. |
| J7  | **Predict which practices will decay and alert the right owner** | Evidence expiry + OPI deltas are in the data model. Makes BDS OS a daily tool, not a quarterly exercise. |
| J10 | **Produce a transaction-ready operational profile on demand** | Governance report + evidence vault + jsPDF export are the foundation. Thin packaging layer. |
| J11 | **Cap work-in-progress so the org finishes before starting new things** | Focus portfolio + `wip-limits.ts` enforce structurally. UI must enforce visibly. |
| J13 | **Make delegation visible and measurable so the CEO can step back** | Delegation index engine already built. Most emotionally compelling job for founder-CEOs. |
| J16 | **Equip functional leaders with coaching prompts to develop teams** | Functional leader governance view includes coaching prompts. Evidence grader returns recommendations. |

---

## 4. Optional/Later Items

### Optional Pains (6)

| ID  | Pain | Why Deferred |
|-----|------|-------------|
| P8  | New-leader ramp-up takes 6--12 months | Maturity map inherently helps; no dedicated feature needed in V2. |
| P11 | Cross-functional dependencies invisible | `practice_dependencies` table exists but has no seed data. High content-creation cost. |
| P13 | Unit economics felt, not measured | Connecting `pnl_impact` scores to actual financials requires accounting integration. |
| P14 | Compliance / regulatory surprise | 82 practices aren't structured around regulatory frameworks; requires mapping layer. |
| P15 | Institutional memory loss | Partially addressed by evidence history; dedicated knowledge-base UX is V3 scope. |
| P16 | Tool / vendor sprawl | Interesting as a byproduct of evidence uploads but not a standalone pain for V2. |

### Optional Jobs (5)

| ID  | Job | Why Deferred |
|-----|-----|-------------|
| J8  | Onboard a new executive with a live operating picture | Maturity map is inherently an onboarding tool; revisit for "new leader walkthrough" later. |
| J9  | Quantify the dollar cost of operational immaturity | Requires connecting pnl_impact to actual financial data. High integration cost. |
| J12 | Benchmark against peers in my industry/stage | Requires aggregated multi-tenant data at scale. Not feasible until critical mass. |
| J14 | Track cross-functional dependencies | Same blocker as P11 --- practice_dependencies has no data yet. |
| J15 | Run operating-system-level retrospectives | Round-over-round comparison naturally supports this. No dedicated feature needed in V2. |

---

## 5. Design Principles

These seven principles must be reflected in every V2 feature. Each is testable: a feature that violates a principle must be redesigned.

### 5.1 Agent grades, human approves

AI grading produces a **pre-approved score (amber)**. Provisional until a human reviewer **confirms (green)**, **adjusts**, or **rejects (red, resubmit)**. Orgs can enable **auto-approval** later, but HITL is the default.

**Test:** Does every AI-generated score pass through a human confirmation step before affecting the maturity map?

### 5.2 Configurable cadence, not forced rhythm

Support **weekly, biweekly, monthly, or quarterly** cadences. Orgs choose per area or globally. Do not force a weekly cadence.

**Test:** Can an org set monthly reviews for Finance practices and quarterly reviews for IT practices, with the system respecting both?

### 5.3 Practice owner first, CEO second

The person responsible for each practice sees **their maturity, benchmark, coaching, and evidence**. The CEO gets the holistic map.

**Test:** Does a functional leader's home screen show their practices, evidence status, and coaching prompts before anything else?

### 5.4 Finish before starting, with a visible parking lot

WIP limits enforced structurally. Kanban includes a **parking lot** (backlog/icebox) visible to management so nothing is lost, just sequenced.

**Test:** When the focus portfolio is full, can a new idea be added to a visible parking lot that leadership can review?

### 5.5 The platform is the consultant

BDS OS must deliver what a multi-hundred-thousand-dollar consulting engagement delivers (maturity diagnosis, prioritized roadmap, governance cadence, progress reporting) but as a self-serve product with agent coaching.

**Test:** Does this feature reduce the need to hire a consultant?

### 5.6 Always transaction-ready

Maturity map, evidence vault, OPI trajectory, and governance reports form a **standing due-diligence room**. Every reporting feature must ask: "Would a PE operating partner find this credible?"

**Test:** Can the org produce a credible operational profile for a buyer/investor at any time, without a preparation sprint?

### 5.7 Simpler inputs, richer outputs with visual trust signals

User uploads an artifact, agent grades it (pre-approved / amber), human approves (confirmed / green), or rejects (red / resubmit). Minimal user effort, rich system output, trust through visible human oversight.

**Test:** Is the user's action a simple upload/click, and does the system provide a rich, color-coded, explainable result?

---

## 6. Evidence Grading Lifecycle (HITL Default)

```
Uploaded (gray)
    |
    v
Pre-approved (amber, AI graded)
    |
    +--> Approved (green, human confirmed)
    |
    +--> Rejected (red, resubmit)

Auto-approved (green + badge) --- when org enables it per practice/level
```

### States

| State | Color | Meaning |
|-------|-------|---------|
| `uploaded` | Gray | Artifact uploaded, not yet graded |
| `ai_graded` | Amber | AI has graded; awaiting human review |
| `approved` | Green | Human reviewer confirmed the grade |
| `rejected` | Red | Human reviewer rejected; resubmit required |
| `auto_approved` | Green + badge | Org enabled auto-approval; AI confidence met threshold |

### Auto-approval rules

- Disabled by default (HITL is the default)
- Org-level setting: `auto_approval_config { enabled, min_confidence, per_practice_overrides }`
- When enabled: if AI confidence >= `min_confidence`, evidence status is set to `auto_approved` and the maturity score is updated without human review
- Visual distinction: auto-approved items show a "bot" badge alongside the green indicator

---

## 7. Positioning vs Frameworks

### What BDS OS V2 replaces

| Alternative | What it provides | BDS OS V2 advantage |
|-------------|-----------------|---------------------|
| **McKinsey-style programs** | Episodic diagnosis + recommendations | Continuous, evidence-based, 10x cheaper, self-serve |
| **EOS / Traction** | Meeting rhythm + accountability chart + Rocks | BDS OS covers EOS scope AND adds maturity measurement, AI grading, evidence vault, transaction readiness |
| **Scaling Up / Rockefeller Habits** | Strategy + execution + cash + people framework | BDS OS is narrower (no cash/people deep-dives) but deeper on operational maturity measurement and evidence |
| **OKR tools (Lattice, 15Five)** | Goal-setting + tracking | BDS OS starts from operational capability, not goals. OKRs measure intent; BDS OS measures evidence of capability. |
| **Manual spreadsheets** | Ad-hoc maturity tracking | No AI grading, no evidence vault, no governance reports, no WIP limits |

### Positioning statement

BDS OS V2 replaces episodic consulting and manual frameworks with a **continuous, evidence-based software + agent system** that is simpler, cheaper, and faster than those alternatives while covering the critical operational pains that block scaling, PE readiness, and leadership delegation.

---

## 8. Out of Scope for V2

The following are explicitly excluded from V2 to maintain focus:

- **Market strategy** ("where to play / how to win")
- **Org design and headcount planning**
- **Deep financial modeling** (connecting pnl_impact to actual P&L)
- **Culture change programs**
- **Compliance framework mapping** (SOC 2, ISO, GDPR)
- **Multi-tenant benchmarking** (requires critical mass of users)
- **Custom practice ontology editing** (82 practices are reference data in V2)

---

## 9. Architecture (Two-Repo Topology)

### Repository structure

```
wbardawil/Get-Shit-Done       (private)
  bds-os/                     BDS OS V2 core
    src/
      engines/                Pure TypeScript engines (no Supabase dependency)
        delegation-index.ts   Delegation Index computation
        evidence-grader.ts    Evidence grading logic
        focus-portfolio.ts    Adaptive Focus Portfolio selection
        lifecycle.ts          Lifecycle stage determination
        operating-debt.ts     Operating Debt scoring
        opi.ts                OPI (Operational Priority Index) computation
      constants/
        wip-limits.ts         WIP limits per lifecycle stage
      types/
        database.ts           Core database type definitions
        governance.ts         Governance view types (Executive, Board, Functional)
        kanban.ts             Kanban state machine + transition logic
        opi.ts                OPI engine types + helper functions
    supabase/
      migrations/             8 migration files (enums, core, assessment, OPI, execution, governance, indexes, RLS)
      functions/
        compute-opi/          Edge function: batch OPI computation
        determine-lifecycle/  Edge function: lifecycle stage determination
        governance-report/    Edge function: Executive/Board/Functional views
        grade-evidence/       Edge function: AI evidence grading
        select-focus-portfolio/ Edge function: focus portfolio selection
        shared/               Shared utilities (cors, supabase-client)
    seeds/                    Seed data (8 areas, 82 practices, 410 maturity levels, metadata, lifecycle weights)

wbardawil/strategy-spark-86   (Lovable-generated frontend)
  src/
    pages/                    React pages (Assessment, Dashboard, Results, CompanyDashboard, etc.)
    components/               UI components (Assessment wizard, Results charts, Dashboard cards)
    hooks/                    React Query hooks for Supabase
    data/                     Question bank + recommendation engine
    lib/                      PDF generation, utilities
```

### Data flow

```
[User: Assessment]
    |
    v
round_responses (importance + competency per practice)
    |
    v
[Engine: OPI Computation]
    |
    v
opi_scores (ranked, phased, scored)
    |
    v
[Engine: Focus Portfolio Selection]
    |
    v
focus_portfolios (WIP-limited active set + parking lot)
    |
    v
[User: Execute Initiatives]
    |
    v
initiatives --> artifacts --> evidence
    |
    v
[Agent: Grade Evidence]
    |
    v
evidence (graded: quality_score, criteria_alignment, level_proposal)
    |
    v
[Human: Approve/Reject]
    |
    v
score_change_requests --> approvals
    |
    v
[Engine: Governance Report]
    |
    v
Executive / Board / Functional Leader views
```

---

## 10. Integration Plan (6 Phases)

### Phase 1: Schema Hardening

Add missing tables and columns identified in the critique. No engine changes.

- `practice_assignments` table (org_id, practice_id, owner_user_id, assigned_at)
- `evidence_status` enum (uploaded, ai_graded, approved, rejected, auto_approved) + column on evidence table
- `auto_approval_config` jsonb on organizations table
- `cadence_config` jsonb on organizations table
- `previous_opi` + `opi_delta` columns on opi_scores table
- `parking_lot_practice_ids` + `selection_rationale` jsonb on focus_portfolios table
- `criteria_alignment` jsonb on evidence table
- `rejected` added to initiative_status enum
- Assessment round status tracking (draft/in_progress/completed + timestamps)
- `biweekly` added to meeting_type enum

### Phase 2: Engine Wiring

Wire existing engines into edge functions. No new algorithms.

- Governance report: query round_responses for current competency levels (replace zeros)
- Governance report: call calculateDelegationIndex() for executive view (replace zeros)
- Governance report: call calculateOperatingDebt() for board view (replace zeros)
- Governance report: compute area_maturity_delta from round-over-round comparison
- Functional leader view: derive ownership from practice_assignments, not initiative ownership

### Phase 3: Evidence Lifecycle

Implement the full gray/amber/green/red trust signal lifecycle.

- Add evidence_status transitions to grade-evidence edge function
- Implement auto-approval logic (check org config, confidence threshold)
- Persist criteria_alignment on evidence table during grading
- Add rejected state to Kanban with rejection reason + coaching prompt

### Phase 4: Focus Portfolio Enhancements

- Persist full selection_rationale (included + excluded + reasons)
- Output parking_lot_practice_ids for non-selected practices
- Surface parking lot in governance views

### Phase 5: Coaching & Alerts

- Enrich coaching prompts with maturity-level context (use rubric descriptors)
- Feed delegation index into executive view risk alerts
- Add OPI delta trend alerts (declining practices trigger warnings)
- Respect configured cadence in meeting health calculations

### Phase 6: Type Safety & Tests

- Update TypeScript types for all new columns and enums
- Add unit tests for engine changes
- Add integration tests for edge function wiring

---

## 11. Must-Do Adjustments (14)

These adjustments were identified by critiquing each V2 phase against the Core Pains, Core Jobs, and Design Principles. All 14 are required before V2 can launch.

### Schema additions (10)

| ID | Adjustment | Pains/Jobs | Principle |
|----|-----------|------------|-----------|
| A1 | Add `practice_assignments` table (org_id, practice_id, owner_user_id, assigned_at) | P12, J16 | Practice owner first |
| A2 | Add assessment round status tracking: `assessment_status` enum (draft/in_progress/completed) + `started_at`, `completed_at` timestamps on assessment_rounds | P4, J1 | Configurable cadence |
| A4 | Add `previous_opi` + `opi_delta` columns to opi_scores. Compute delta against same practice's score from prior round. | P9, J7 | Always transaction-ready |
| A5 | Add `parking_lot_practice_ids integer[]` + `selection_rationale jsonb` to focus_portfolios. Store full rationale for included AND excluded practices. | P7, J11 | Finish before starting + parking lot |
| A8 | Add `cadence_config jsonb` to organizations: `{ assessment_cadence, review_cadence }` with values weekly/biweekly/monthly/quarterly. Add `biweekly` to meeting_type enum. | P4, J4 | Configurable cadence |
| A9 | Persist full PracticeSelectionRationale[] (included + excluded + reasons) in focus_portfolios.selection_rationale. | P7 | Platform is consultant |
| A11 | Add `evidence_status` enum: uploaded/ai_graded/approved/rejected/auto_approved. Add column to evidence table. | P5, J3 | Agent grades, human approves + trust signals |
| A12 | Add `auto_approval_config jsonb` to organizations: `{ enabled, min_confidence, per_practice_overrides }`. | J3 | Agent grades, human approves |
| A14 | Add `criteria_alignment jsonb` to evidence table. Persist which criteria were met/unmet at grading time. | P5, J3 | Simpler inputs, richer outputs |
| A15 | Add `rejected` to initiative_status enum. Allow `pending_verification --> rejected`. Surface rejection reason + coaching prompt. | J3 | Agent grades, human approves + trust signals |

### Engine/function wiring (4)

| ID | Adjustment | Pains/Jobs | Principle |
|----|-----------|------------|-----------|
| A6 | Feed delegation index into executive view risk alerts. If `delegation_health === 'concentrated'`, generate a risk alert. | P6, J13 | Always transaction-ready |
| A13 | Enrich coaching prompts with maturity-level context. Read target level descriptor + evidence_criteria. Generate: "To reach Level N, you need: [criteria]. You've covered X of Y. Focus on: [missing]." | P5, P12, J16 | Platform is consultant |
| A16--A18 | Wire governance report to real data. Query round_responses for current levels. Call calculateDelegationIndex(). Call calculateOperatingDebt(). Compute area_maturity_delta from round history. | P6, P9, P10, J6, J10, J13 | Always transaction-ready |
| A19--A20 | Fix functional leader view to use practice_assignments (A1). Respect configured cadence (A8) in meeting health calculations. | P12, J16 | Practice owner first + configurable cadence |

---

## 12. Nice-to-Have Items (4)

Deferred to post-V2 launch. Can be implemented on the main branch after the must-do adjustments are complete.

| ID | Item | Why Deferred |
|----|------|-------------|
| A3 | Multi-respondent scoring (allow multiple leaders to assess the same practice; aggregate with weighted average) | High value but requires UX for consensus resolution. V2 can ship with single-respondent. |
| A7 | Historical debt trend computation (compare operating debt across rounds) | Operating debt engine exists; computing trend requires historical query. Can ship with `stable` placeholder initially. |
| A10 | Mid-cycle portfolio rebalancing (when a practice reaches target, auto-suggest pulling next from parking lot) | Useful but adds complexity to the portfolio lifecycle. V2 can rebalance at assessment boundaries. |
| A21--A22 | Diligence export (packaged PDF/data room) + Adoption tracking writer (cron that computes adoption scores from evidence upload frequency, initiative velocity, meeting attendance) | V2 can launch with the governance report as the "diligence view." Dedicated export and adoption metrics can follow. |

---

## 13. Confirmed Assumptions

These assumptions are treated as confirmed based on the existing codebase and prior conversations.

| ID | Assumption | Evidence |
|----|-----------|----------|
| A1 | The 82-practice ontology is fixed reference data for V2 (users cannot add/edit practices) | `practices` table has no `organization_id`; practices are global, versioned (`version text DEFAULT '1.0'`) |
| A2 | Each organization has exactly one lifecycle stage at a time | `organizations.lifecycle_stage` is a single enum column, not an array |
| A3 | OPI weights are per-lifecycle-stage, not per-organization | `lifecycle_weights` table is keyed by `lifecycle_stage`, not `organization_id` |
| A4 | Evidence is linked to initiatives, not directly to practices | `evidence.initiative_id` is the foreign key; no direct `evidence.practice_id` exists |
| A5 | The Kanban state machine is the canonical workflow for initiative execution | `KANBAN_TRANSITIONS` defines a strict directed graph; no alternative workflows exist |
| A6 | WIP limits are per-lifecycle-stage, not per-organization | `WIP_LIMITS` constant uses `LifecycleStage` as key, not org_id |
| A7 | Risk floor overrides WIP limits (critical practices are always included) | `focus-portfolio.ts` line 72--76: risk floor practices added before WIP cap check |
| A8 | The Lovable app (strategy-spark-86) is the V1 frontend; V2 may extend or replace it | Lovable app has assessment wizard + results + dashboard but no V2 features (Kanban, evidence grading, governance views) |
| A9 | Supabase edge functions are the backend API layer | All business logic edge functions use Deno runtime with Supabase client |
| A10 | AI grading currently uses keyword matching, not LLM calls | `grade-evidence` splits criteria into keywords and checks description for matches; no API call to an LLM |

---

## 14. Open Questions

These questions need answers before or during implementation. They do not block starting Phase 1 (Schema Hardening).

| ID | Question | Impact if Unanswered |
|----|---------|---------------------|
| Q1 | **Should the evidence grader call an LLM (Claude) for richer grading, or stay with keyword matching for V2?** | Keyword matching works but produces shallow grading. LLM grading would dramatically improve coaching quality (A13) and evidence evaluation, but adds latency + cost. |
| Q2 | **What is the initial practice dependency graph?** The `practice_dependencies` table has no seed data. | Focus portfolio's dependency ordering (Rule 6) is a no-op without data. Not blocking for V2, but dependency-based selection won't work. |
| Q3 | **Should practice_assignments support multiple owners per practice?** (e.g., co-ownership between VP Sales and VP Marketing for "Revenue Forecasting") | Affects A1 table design: single `owner_user_id` vs. join table with multiple owners. |
| Q4 | **How should multi-round OPI deltas handle lifecycle stage changes?** If an org moves from Growth to Scale between rounds, OPI weights change. Is the delta still meaningful? | Affects A4 computation. Could normalize by showing delta within same lifecycle stage only, or flag "lifecycle change" as a context marker. |
| Q5 | **What auto-approval confidence threshold is appropriate?** | Affects A12 default config. Suggest 0.85 as default; orgs can adjust. |
| Q6 | **Should the parking lot be editable?** Can leadership manually promote/demote practices between active and parking lot, or is it algorithm-only? | Affects A5 design. If editable, need a `manual_override` flag and audit trail. |
| Q7 | **What is the Lovable app's role in V2?** Is it the V2 frontend, a V1 legacy, or being replaced? | Determines whether V2 UI work happens in strategy-spark-86 or a new frontend repo. |
| Q8 | **Should governance reports be generated on-demand only, or also on a schedule (cron)?** | Affects P9 (early-warning). On-demand means alerts are only seen when someone requests a report. Cron means alerts can be pushed via email/Slack. |
| Q9 | **What is the target user count per organization?** (5? 20? 100?) | Affects performance of round_responses queries, governance report generation time, and RLS policy design. |
| Q10 | **Should the assessment support partial completion?** (save progress, resume later) | Affects A2 (assessment status tracking). Current design has no `draft` concept for round_responses. |
