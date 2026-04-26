// Re-export all backend types for frontend use.
// These are pure TypeScript interfaces — no runtime code.

export type {
  Organization,
  User,
  Area,
  Practice,
  PracticeMetadata,
  MaturityLevel,
  PracticeDependency,
  AssessmentRound,
  RoundResponse,
  LifecycleWeightsRow,
  OPIScore,
  FocusPortfolio,
  Initiative,
  Artifact,
  Evidence,
  ScoreChangeRequest,
  Approval,
  Meeting,
  KPI,
  AdoptionMetric,
  LifecycleStage,
  InitiativeStatus,
  ScoreChangeStatus,
  MeetingType,
  UserRole,
  OPIPhase,
} from "@bds/types/database";

export type {
  ExecutiveView,
  BoardView,
  FunctionalLeaderView,
  DelegationMetrics,
  OperatingDebt,
} from "@bds/types/governance";

export type {
  OPIResult,
  OPIInput,
  LifecycleWeights,
  FocusPortfolioResult,
} from "@bds/types/opi";

export {
  KANBAN_TRANSITIONS,
  COLUMN_DISPLAY_NAMES,
  isValidTransition,
} from "@bds/types/kanban";

export type { KanbanBoardView, KanbanCard, KanbanColumn } from "@bds/types/kanban";
