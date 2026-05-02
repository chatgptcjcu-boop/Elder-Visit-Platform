import {
  activityItems,
  dashboardMetrics,
  getCase,
  getCurrentWorkspace,
  getUnit,
  visitSchedules,
  workspaces,
} from "@/lib/domain/mock-data";
import type { AppRepository } from "@/lib/repositories/types";

export const mockRepository: AppRepository = {
  async getCurrentWorkspace() {
    return getCurrentWorkspace();
  },
  async getWorkspaces() {
    return workspaces.map((workspace) => ({
      ...workspace,
      unit: getUnit(workspace.unitId),
    }));
  },
  async getDashboardMetrics() {
    return dashboardMetrics;
  },
  async getActivityItems() {
    return activityItems;
  },
  async getVisitorTasks() {
    return visitSchedules.flatMap((schedule) => {
      const elderCase = getCase(schedule.caseId);

      if (!elderCase) {
        return [];
      }

      return [{ schedule, elderCase }];
    });
  },
  async getCaseRegistry() {
    const { getCaseRegistry } = await import("@/lib/domain/cases");
    return getCaseRegistry();
  },
  async getCaseRegistrySummary() {
    const { getCaseRegistrySummary } = await import("@/lib/domain/cases");
    return getCaseRegistrySummary();
  },
};
