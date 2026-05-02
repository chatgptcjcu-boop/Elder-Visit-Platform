import type {
  ActivityItem,
  DashboardMetric,
  ElderCase,
  Unit,
  VisitSchedule,
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

export type AppRepository = {
  getCurrentWorkspace(): Promise<Workspace>;
  getWorkspaces(): Promise<WorkspaceWithUnit[]>;
  getDashboardMetrics(): Promise<DashboardMetric[]>;
  getActivityItems(): Promise<ActivityItem[]>;
  getVisitorTasks(): Promise<VisitorTask[]>;
  getCaseRegistry(): Promise<CaseRegistryItem[]>;
  getCaseRegistrySummary(): Promise<CaseRegistrySummary>;
};
