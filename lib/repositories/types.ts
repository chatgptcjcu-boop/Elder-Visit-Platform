import type {
  ActivityItem,
  AssignmentDecisionResult,
  AssignmentRecommendation,
  DashboardMetric,
  ElderCase,
  PaymentBatch,
  PaymentFeeRule,
  Unit,
  VisitSchedule,
  VisitorProfile,
  Workspace,
} from "@/lib/domain/types";

export type WorkspaceWithUnit = Workspace & {
  unit?: Unit;
};

export type VisitorTask = {
  schedule: VisitSchedule;
  elderCase: ElderCase;
};

export type CaseRegistryItem = ElderCase & {
  visitCount: number;
  latestVisitDate: string | null;
  latestAssignmentReason: string;
};

export type CaseRegistrySummary = {
  total: number;
  highRisk: number;
  pending: number;
  assigned: number;
  closed: number;
};

export type AssignmentDashboardData = {
  visitors: VisitorProfile[];
  recommendations: AssignmentRecommendation[];
};

export type PaymentBatchData = {
  batch: PaymentBatch;
  feeRule: PaymentFeeRule;
};

export type AppRepository = {
  getCurrentWorkspace(): Promise<Workspace>;
  getWorkspaces(): Promise<WorkspaceWithUnit[]>;
  getDashboardMetrics(): Promise<DashboardMetric[]>;
  getActivityItems(): Promise<ActivityItem[]>;
  getVisitorTasks(): Promise<VisitorTask[]>;
  getCaseRegistry(): Promise<CaseRegistryItem[]>;
  getCaseRegistrySummary(): Promise<CaseRegistrySummary>;
  getAssignmentDashboard(): Promise<AssignmentDashboardData>;
  confirmAssignment(recommendationId: string): Promise<AssignmentDecisionResult>;
  getPaymentBatchPreview(): Promise<PaymentBatchData>;
  createPaymentBatch(): Promise<PaymentBatchData>;
};
