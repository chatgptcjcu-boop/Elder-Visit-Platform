import type { ElderCase, VisitSchedule, VisitSubmission } from "@/lib/domain/types";

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

  if (!submission.visitResult) {
    missing.push("訪查結果");
  }
  if (!submission.healthStatus) {
    missing.push("健康狀況觀察");
  }
  if (!submission.livingStatus) {
    missing.push("生活支持狀態");
  }

  return {
    ok: missing.length === 0,
    missing,
  };
}

export function getPaymentEligibility(submission: VisitSubmission) {
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
