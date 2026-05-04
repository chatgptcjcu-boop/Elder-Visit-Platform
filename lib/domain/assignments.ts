import { elderCases, visitSchedules } from "@/lib/domain/mock-data";
import type {
  AssignmentDecisionResult,
  AssignmentRecommendation,
  VisitorWorkerType,
  VisitorProfile,
  ElderCase,
  VisitSchedule,
} from "@/lib/domain/types";

const workerTypeLabels: Record<VisitorWorkerType, string> = {
  social_affairs: "社政訪查人員",
  civil_affairs: "民政訪查人員",
  general: "一般訪員",
};

export const visitors: VisitorProfile[] = [
  {
    id: "visitor_001",
    fullName: "王社政",
    workerType: "social_affairs",
    districtCoverage: ["北區", "西區"],
    villageCoverage: ["錦村里", "邱厝里"],
    activeTaskCount: 3,
    maxDailyTasks: 6,
    trainedModules: ["visit_form", "consent"],
    visitorCertificateNo: "SOC-115-001",
    certificateStatus: "valid",
    trainingDate: "2026-03-12",
    bankAccountLast5: "31809",
    remittanceReady: true,
    status: "available",
  },
  {
    id: "visitor_002",
    fullName: "李民政",
    workerType: "civil_affairs",
    districtCoverage: ["北區"],
    villageCoverage: ["錦村里", "賴厝里"],
    activeTaskCount: 5,
    maxDailyTasks: 5,
    trainedModules: ["visit_form"],
    visitorCertificateNo: "CIV-115-006",
    certificateStatus: "valid",
    trainingDate: "2026-03-18",
    bankAccountLast5: "77620",
    remittanceReady: true,
    status: "busy",
  },
  {
    id: "visitor_003",
    fullName: "陳督導",
    workerType: "general",
    districtCoverage: ["北區", "南區"],
    villageCoverage: ["邱厝里"],
    activeTaskCount: 1,
    maxDailyTasks: 4,
    trainedModules: ["visit_form", "consent", "audit"],
    visitorCertificateNo: null,
    certificateStatus: "missing",
    trainingDate: null,
    bankAccountLast5: null,
    remittanceReady: false,
    status: "available",
  },
];

export function getAssignmentRecommendations(): AssignmentRecommendation[] {
  return createAssignmentRecommendations(visitSchedules, elderCases, visitors);
}

export function createAssignmentRecommendations(
  schedules: VisitSchedule[],
  cases: ElderCase[],
  visitorProfiles: VisitorProfile[],
): AssignmentRecommendation[] {
  return schedules.map((schedule, index) => {
    const elderCase = cases.find((item) => item.id === schedule.caseId);
    const visitor =
      visitorProfiles.find((item) => item.id === schedule.visitorId) ?? visitorProfiles[0];
    if (!visitor) {
      return {
        id: `assign_rec_${schedule.id}`,
        caseId: schedule.caseId,
        scheduleId: schedule.id,
        visitorId: schedule.visitorId,
        score: 0,
        status: "manual_review",
        reasons: ["尚未建立訪員資料"],
        warnings: ["找不到可比對的訪員資格資料。"],
      };
    }
    const coVisitor = schedule.coVisitorId
      ? visitorProfiles.find((item) => item.id === schedule.coVisitorId)
      : null;
    const sameDistrict = elderCase ? visitor.districtCoverage.includes(elderCase.district) : false;
    const sameVillage = elderCase ? visitor.villageCoverage.includes(elderCase.village) : false;
    const hasCapacity = visitor.activeTaskCount < visitor.maxDailyTasks;
    const consentTrained = visitor.trainedModules.includes("consent");
    const workerTypeMatched = elderCase?.requiredVisitorTypes.includes(visitor.workerType) ?? false;
    const coVisitMatched =
      !elderCase?.coVisitRequired ||
      Boolean(
        coVisitor &&
          elderCase.requiredVisitorTypes.includes(coVisitor.workerType) &&
          coVisitor.workerType !== visitor.workerType,
      );
    const certificateValid = visitor.certificateStatus === "valid";
    const riskBonus = elderCase?.riskLevel === "high" ? 15 : 6;
    const score =
      45 +
      (sameVillage ? 25 : sameDistrict ? 15 : 0) +
      (hasCapacity ? 15 : -15) +
      (consentTrained ? 10 : 0) +
      (workerTypeMatched ? 15 : -10) +
      (coVisitMatched ? 10 : -20) +
      (certificateValid ? 10 : -25) +
      (visitor.remittanceReady ? 5 : -10) +
      riskBonus -
      index * 3;

    const warnings: string[] = [];

    if (!hasCapacity) {
      warnings.push("訪員今日任務已達上限，建議改派或主管覆核。");
    }

    if (!consentTrained) {
      warnings.push("訪員尚未完成同意治理訓練，不建議處理需簽名案件。");
    }

    if (!workerTypeMatched) {
      warnings.push("訪員身分未符合本案需配置的民政或社政訪查人員。");
    }

    if (!coVisitMatched) {
      warnings.push("本案需要民政與社政共訪，尚未完成雙角色搭配。");
    }

    if (!certificateValid) {
      warnings.push("訪員證或受訓紀錄尚未有效，不可直接派案。");
    }

    if (!visitor.remittanceReady) {
      warnings.push("訪員匯款帳戶尚未建檔，後續核銷會被阻擋。");
    }

    return {
      id: `assign_rec_${schedule.id}`,
      caseId: schedule.caseId,
      scheduleId: schedule.id,
      visitorId: visitor.id,
      score,
      status: warnings.length > 0 ? "manual_review" : "recommended",
      reasons: [
        sameVillage ? `同里別：${elderCase?.village}` : sameDistrict ? "同區域派案" : "跨區派案",
        workerTypeMatched ? `${workerTypeLabels[visitor.workerType]}符合` : "訪員身分需覆核",
        coVisitMatched
          ? elderCase?.coVisitRequired
            ? `共訪搭配：${coVisitor?.fullName ?? "未指定"}`
            : "不需共訪"
          : "缺少共訪搭配",
        hasCapacity ? "訪員仍有容量" : "訪員容量不足",
        consentTrained ? "已完成同意治理訓練" : "缺少同意治理訓練",
        certificateValid ? "訪員證有效" : "訪員證待補",
        visitor.remittanceReady ? "匯款資料完整" : "匯款資料待補",
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
