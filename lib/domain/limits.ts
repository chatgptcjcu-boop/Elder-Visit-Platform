import type { PlanLimitUsage } from "@/lib/domain/types";

export function getUsagePercent(limit: PlanLimitUsage) {
  if (limit.limit <= 0) {
    return 100;
  }

  return Math.min(Math.round((limit.used / limit.limit) * 100), 100);
}

export function isLimitExceeded(limit: PlanLimitUsage) {
  return limit.used >= limit.limit;
}

export function getLimitByKey(limits: PlanLimitUsage[], key: PlanLimitUsage["key"]) {
  return limits.find((limit) => limit.key === key);
}

export function evaluatePlanLimit(limits: PlanLimitUsage[], key: PlanLimitUsage["key"]) {
  const limit = getLimitByKey(limits, key);

  if (!limit) {
    return {
      state: "ok" as const,
      message: "此操作未設定方案限制。",
      limit: null,
    };
  }

  if (isLimitExceeded(limit)) {
    return {
      state: "blocked" as const,
      message: `${limit.label}已達 ${limit.limit} 次上限，需升級方案或由管理者調整額度。`,
      limit,
    };
  }

  if (getUsagePercent(limit) >= 80) {
    return {
      state: "warning" as const,
      message: `${limit.label}已使用 ${limit.used}/${limit.limit}，即將達到方案上限。`,
      limit,
    };
  }

  return {
    state: "ok" as const,
    message: `${limit.label}使用量正常：${limit.used}/${limit.limit}。`,
    limit,
  };
}

export function getLimitSummary(limits: PlanLimitUsage[]) {
  const exceeded = limits.filter(isLimitExceeded);

  if (exceeded.length > 0) {
    return {
      state: "blocked" as const,
      message: `${exceeded[0].label}已達上限，建立資料前需升級方案。`,
    };
  }

  const nearing = limits.find((limit) => getUsagePercent(limit) >= 80);

  if (nearing) {
    return {
      state: "warning" as const,
      message: `${nearing.label}使用量接近上限。`,
    };
  }

  return {
    state: "ok" as const,
    message: "目前方案使用量正常。",
  };
}
