import { elderCases, visitSchedules } from "@/lib/domain/mock-data";
import type {
  AssignmentDecisionResult,
  AssignmentRecommendation,
  VisitorProfile,
} from "@/lib/domain/types";

export const visitors: VisitorProfile[] = [
  {
    id: "visitor_001",
    fullName: "王訪員",
    districtCoverage: ["北區", "西區"],
    activeTaskCount: 3,
    maxDailyTasks: 6,
    trainedModules: ["visit_form", "consent"],
    status: "available",
  },
  {
    id: "visitor_002",
    fullName: "李志工",
    districtCoverage: ["北區"],
    activeTaskCount: 5,
    maxDailyTasks: 5,
    trainedModules: ["visit_form"],
    status: "busy",
  },
  {
    id: "visitor_003",
    fullName: "陳督導",
    districtCoverage: ["北區", "南區"],
    activeTaskCount: 1,
    maxDailyTasks: 4,
    trainedModules: ["visit_form", "consent", "audit"],
    status: "available",
  },
];

export function getAssignmentRecommendations(): AssignmentRecommendation[] {
  return visitSchedules.map((schedule, index) => {
    const elderCase = elderCases.find((item) => item.id === schedule.caseId);
    const visitor = visitors.find((item) => item.id === schedule.visitorId) ?? visitors[0];
    const sameDistrict = elderCase ? visitor.districtCoverage.includes(elderCase.district) : false;
    const hasCapacity = visitor.activeTaskCount < visitor.maxDailyTasks;
    const consentTrained = visitor.trainedModules.includes("consent");
    const riskBonus = elderCase?.riskLevel === "high" ? 15 : 6;
    const score =
      45 +
      (sameDistrict ? 20 : 0) +
      (hasCapacity ? 15 : -15) +
      (consentTrained ? 10 : 0) +
      riskBonus -
      index * 3;

    const warnings: string[] = [];

    if (!hasCapacity) {
      warnings.push("訪員今日任務已達上限，建議改派或主管覆核。");
    }

    if (!consentTrained) {
      warnings.push("訪員尚未完成同意治理訓練，不建議處理需簽名案件。");
    }

    return {
      id: `assign_rec_${schedule.id}`,
      caseId: schedule.caseId,
      scheduleId: schedule.id,
      visitorId: visitor.id,
      score,
      status: warnings.length > 0 ? "manual_review" : "recommended",
      reasons: [
        sameDistrict ? "同區域派案" : "跨區派案",
        hasCapacity ? "訪員仍有容量" : "訪員容量不足",
        consentTrained ? "已完成同意治理訓練" : "缺少同意治理訓練",
        elderCase?.riskLevel === "high" ? "高風險優先" : "一般風險排序",
      ],
      warnings,
    };
  });
}

export function confirmAssignment(recommendationId: string): AssignmentDecisionResult {
  const recommendation = getAssignmentRecommendations().find((item) => item.id === recommendationId);

  if (!recommendation) {
    return {
      recommendationId,
      status: "manual_review",
      assignedAt: null,
      message: "找不到派案建議，請重新整理派案佇列。",
      activityLog: {
        entityType: "visit_schedule",
        action: "assignment_review",
      },
    };
  }

  if (recommendation.warnings.length > 0) {
    return {
      recommendationId,
      status: "manual_review",
      assignedAt: null,
      message: "此派案含風險提醒，需主管人工覆核後再確認。",
      activityLog: {
        entityType: "visit_schedule",
        action: "assignment_review",
      },
    };
  }

  return {
    recommendationId,
    status: "confirmed",
    assignedAt: new Date().toISOString(),
    message: "派案已確認，訪員端任務會顯示此訪查。",
    activityLog: {
      entityType: "visit_schedule",
      action: "assignment_confirm",
    },
  };
}
