import type {
  ConsentGovernanceResult,
  ConsentRecord,
  ConsentScope,
  ExportTemplateSummary,
} from "@/lib/domain/types";

export const consentScopeLabels: Record<ConsentScope, string> = {
  internal_use: "單位內部服務",
  government_report: "政府成果回報",
  anonymous_kpi: "匿名統計 KPI",
  research_use: "研究分析",
  sponsor_reporting: "贊助成果揭露",
};

export const consentRecords: ConsentRecord[] = [
  {
    id: "consent_001",
    caseCode: "EV-115-0001",
    elderName: "林阿梅",
    signed: true,
    scopes: ["internal_use", "government_report", "anonymous_kpi"],
    signedDate: "2026-04-18",
    expiryDate: "2027-04-18",
    revoked: false,
    revokedAt: null,
    source: "visit_form",
  },
  {
    id: "consent_002",
    caseCode: "EV-115-0002",
    elderName: "陳水木",
    signed: true,
    scopes: ["internal_use", "anonymous_kpi"],
    signedDate: "2026-03-30",
    expiryDate: "2026-12-31",
    revoked: false,
    revokedAt: null,
    source: "paper_import",
  },
  {
    id: "consent_003",
    caseCode: "EV-115-0003",
    elderName: "黃秋霞",
    signed: false,
    scopes: [],
    signedDate: null,
    expiryDate: null,
    revoked: true,
    revokedAt: "2026-04-20T09:10:00+08:00",
    source: "guardian_upload",
  },
];

const personalDataKeys = new Set(["name"]);

export function getConsentPurposeOptions() {
  return Object.entries(consentScopeLabels).map(([value, label]) => ({
    value: value as ConsentScope,
    label,
  }));
}

export function getConsentGovernanceSummary() {
  const active = consentRecords.filter((record) => isConsentActive(record));
  const revoked = consentRecords.filter((record) => record.revoked);

  return {
    total: consentRecords.length,
    active: active.length,
    revoked: revoked.length,
    expiringSoon: consentRecords.filter(isExpiringSoon).length,
  };
}

export function evaluateExportConsent(
  template: ExportTemplateSummary,
  purpose: ConsentScope,
): ConsentGovernanceResult {
  const hasPersonalData = template.columns.some((column) => personalDataKeys.has(column.key));
  const allowsPersonalData = purpose === "internal_use" || purpose === "government_report";
  const redactedColumns =
    hasPersonalData && !allowsPersonalData
      ? template.columns
          .filter((column) => personalDataKeys.has(column.key))
          .map((column) => column.label)
      : [];
  const warnings: string[] = [];

  if (redactedColumns.length > 0) {
    warnings.push("此用途不得揭露可識別個資，姓名欄位已自動去識別化。");
  }

  const missingScopeCount = consentRecords.filter(
    (record) => isConsentActive(record) && !record.scopes.includes(purpose),
  ).length;

  if (missingScopeCount > 0) {
    warnings.push(`${missingScopeCount} 筆同意書未涵蓋此用途，匯出前需主管覆核。`);
  }

  const inactiveCount = consentRecords.filter((record) => !isConsentActive(record)).length;

  if (inactiveCount > 0) {
    warnings.push(`${inactiveCount} 筆同意書已撤回、缺簽或過期，不得用於可識別資料匯出。`);
  }

  return {
    purpose,
    purposeLabel: consentScopeLabels[purpose],
    allowsPersonalData,
    warnings,
    redactedColumns,
  };
}

export function redactExportCell(key: string, value: string, governance: ConsentGovernanceResult) {
  if (personalDataKeys.has(key) && !governance.allowsPersonalData) {
    return "已去識別";
  }

  return value;
}

function isConsentActive(record: ConsentRecord) {
  if (!record.signed || record.revoked) {
    return false;
  }

  if (!record.expiryDate) {
    return true;
  }

  return new Date(`${record.expiryDate}T23:59:59+08:00`) >= new Date("2026-04-26T00:00:00+08:00");
}

function isExpiringSoon(record: ConsentRecord) {
  if (!isConsentActive(record) || !record.expiryDate) {
    return false;
  }

  const today = new Date("2026-04-26T00:00:00+08:00");
  const expiryDate = new Date(`${record.expiryDate}T00:00:00+08:00`);
  const daysUntilExpiry = (expiryDate.getTime() - today.getTime()) / 86_400_000;

  return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
}
