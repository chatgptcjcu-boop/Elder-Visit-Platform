import { elderCases, visitSchedules } from "@/lib/domain/mock-data";
import type { CaseStatusDecision, CaseStatusResult, ElderCase } from "@/lib/domain/types";

export function getCaseRegistry() {
  return elderCases.map((elderCase) => {
    const schedules = visitSchedules.filter((schedule) => schedule.caseId === elderCase.id);
    const latestSchedule = schedules.at(-1);

    return {
      ...elderCase,
      visitCount: schedules.length,
      latestVisitDate: latestSchedule?.visitDate ?? null,
      latestAssignmentReason: latestSchedule?.assignmentReason ?? "尚未派案",
    };
  });
}

export function getCaseRegistrySummary() {
  const registry = getCaseRegistry();
  const highRisk = registry.filter((elderCase) => elderCase.riskLevel === "high").length;
  const pending = registry.filter((elderCase) => elderCase.status === "pending").length;
  const assigned = registry.filter((elderCase) => elderCase.status === "assigned").length;
  const closed = registry.filter((elderCase) => elderCase.status === "closed").length;

  return {
    total: registry.length,
    highRisk,
    pending,
    assigned,
    closed,
  };
}

export function updateCaseStatus(decision: CaseStatusDecision): CaseStatusResult {
  const elderCase = elderCases.find((item) => item.id === decision.caseId);

  if (!elderCase) {
    return {
      caseId: decision.caseId,
      status: "pending",
      updatedAt: new Date().toISOString(),
      message: "找不到個案，請重新整理名冊。",
      activityLog: {
        entityType: "elder_case",
        action: "case_status_update",
      },
    };
  }

  return {
    caseId: elderCase.id,
    status: decision.status,
    updatedAt: new Date().toISOString(),
    message: `${elderCase.caseCode} 已標記為 ${getCaseStatusLabel(decision.status)}。`,
    activityLog: {
      entityType: "elder_case",
      action: "case_status_update",
    },
  };
}

export function getCaseStatusLabel(status: ElderCase["status"]) {
  const labels: Record<ElderCase["status"], string> = {
    pending: "待派案",
    assigned: "已派案",
    visited: "已訪查",
    auditing: "稽核中",
    closed: "已結案",
  };

  return labels[status];
}
