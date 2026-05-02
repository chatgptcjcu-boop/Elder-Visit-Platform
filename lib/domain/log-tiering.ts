import type { LogRetentionPolicy, LogTier } from "@/lib/domain/types";

export const logTierLabels: Record<LogTier, string> = {
  active: "Active",
  warm_archive: "Warm Archive",
  cold_archive: "Cold Archive",
  delete_queue: "Delete Queue",
};

export const logRetentionPolicies: LogRetentionPolicy[] = [
  {
    entityType: "workspace_activity_logs",
    label: "工作空間操作紀錄",
    tier: "active",
    retentionMonths: 12,
    archiveAfterMonths: 12,
    estimatedRows: 4280,
    containsPersonalData: true,
  },
  {
    entityType: "workflow_instance_logs",
    label: "流程節點紀錄",
    tier: "warm_archive",
    retentionMonths: 36,
    archiveAfterMonths: 6,
    estimatedRows: 12140,
    containsPersonalData: false,
  },
  {
    entityType: "export_logs",
    label: "匯出紀錄",
    tier: "active",
    retentionMonths: 24,
    archiveAfterMonths: 12,
    estimatedRows: 860,
    containsPersonalData: true,
  },
  {
    entityType: "consent_usage_logs",
    label: "同意用途紀錄",
    tier: "active",
    retentionMonths: 60,
    archiveAfterMonths: 24,
    estimatedRows: 310,
    containsPersonalData: true,
  },
  {
    entityType: "notification_logs",
    label: "通知發送紀錄",
    tier: "cold_archive",
    retentionMonths: 18,
    archiveAfterMonths: 3,
    estimatedRows: 6120,
    containsPersonalData: false,
  },
];

export function getLogTieringSummary() {
  const totalRows = logRetentionPolicies.reduce((sum, policy) => sum + policy.estimatedRows, 0);
  const personalDataRows = logRetentionPolicies
    .filter((policy) => policy.containsPersonalData)
    .reduce((sum, policy) => sum + policy.estimatedRows, 0);

  return {
    totalPolicies: logRetentionPolicies.length,
    totalRows,
    personalDataRows,
    archiveCandidates: logRetentionPolicies.filter(
      (policy) => policy.tier === "warm_archive" || policy.tier === "cold_archive",
    ).length,
  };
}

export function getLogTieringWarnings() {
  const warnings: string[] = [];
  const shortPersonalRetention = logRetentionPolicies.filter(
    (policy) => policy.containsPersonalData && policy.retentionMonths < 24,
  );

  if (shortPersonalRetention.length > 0) {
    warnings.push("含個資紀錄保留期低於 24 個月，正式上線前需由資料治理負責人確認。");
  }

  if (logRetentionPolicies.some((policy) => policy.archiveAfterMonths > policy.retentionMonths)) {
    warnings.push("部分紀錄的封存時間晚於保留期，需修正政策設定。");
  }

  return warnings;
}
