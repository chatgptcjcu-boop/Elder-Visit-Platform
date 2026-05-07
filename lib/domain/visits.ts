import type { ElderCase, VisitSchedule, VisitSubmission } from "@/lib/domain/types";

export const missedVisitClosureAttempt = 3;

export function getRiskLabel(riskLevel: ElderCase["riskLevel"]) {
  const labels = {
    low: "低風險",
    medium: "中風險",
    high: "高風險",
  };

  return labels[riskLevel];
}

export function getVisitStatusLabel(status: VisitSchedule["status"]) {
  const labels = {
    pending: "待訪查",
    in_progress: "填報中",
    submitted: "已送出",
    needs_follow_up: "需追蹤",
  };

  return labels[status];
}

export function validateVisitSubmission(submission: VisitSubmission) {
  const missing: string[] = [];
  const hasGps = typeof submission.gpsLat === "number" && typeof submission.gpsLng === "number";

  if (!submission.visitResult) {
    missing.push("訪查結果");
  }
  if (!submission.healthStatus) {
    missing.push("健康狀況觀察");
  }
  if (!submission.livingStatus) {
    missing.push("生活支持狀態");
  }
  if (submission.visitResult === "未遇") {
    if (submission.photoNames.length === 0) {
      missing.push("未遇佐證照片");
    }
    if (!hasGps) {
      missing.push("未遇定位");
    }
  }

  return {
    ok: missing.length === 0,
    missing,
  };
}

export function getMissedVisitPolicy(schedule: VisitSchedule, submission: VisitSubmission) {
  if (submission.visitResult !== "未遇") {
    return {
      applies: false,
      canClose: false,
      nextAttempt: null,
      message: "本次不是未遇案件，依一般訪視流程送督導與稽核。",
    };
  }

  if (schedule.visitAttempt >= missedVisitClosureAttempt) {
    return {
      applies: true,
      canClose: true,
      nextAttempt: null,
      message: "已達第 3 次未遇，可送督導確認後以未遇結案。",
    };
  }

  return {
    applies: true,
    canClose: false,
    nextAttempt: schedule.visitAttempt + 1,
    message: `目前是第 ${schedule.visitAttempt} 次未遇，不可直接結案；送出後應安排第 ${
      schedule.visitAttempt + 1
    } 次訪視。`,
  };
}

export function getPaymentEligibility(submission: VisitSubmission) {
  if (submission.visitResult === "未遇") {
    return {
      eligible: false,
      reason: "未遇案件不直接核銷，需累計 3 次未遇並由督導確認後結案。",
    };
  }

  if (!submission.consentSigned || !submission.signatureDataUrl?.length) {
    return {
      eligible: false,
      reason: "未取得同意或簽名，暫不可進入核銷。",
    };
  }

  if (submission.visitResult === "訪視成功") {
    return {
      eligible: true,
      reason: "可進入稽核與核銷流程。",
    };
  }

  return {
    eligible: false,
    reason: "非成功訪視，需依 payment rules 判定是否可核銷。",
  };
}
