import type { WorkspaceModuleKey, WorkspaceSettings } from "@/lib/domain/types";

export const moduleOptions: Array<{
  key: WorkspaceModuleKey;
  label: string;
  description: string;
}> = [
  { key: "case_import", label: "名冊匯入", description: "動態欄位對應與匯入模板。" },
  { key: "assignment", label: "派案", description: "人工派案與規則推薦。" },
  { key: "visit_form", label: "訪查表單", description: "對話式填報與表單模板。" },
  { key: "consent", label: "同意治理", description: "同意範圍、撤回與匯出檢查。" },
  { key: "audit", label: "稽核", description: "阻擋項目 / 提醒項目檢核規則。" },
  { key: "payment", label: "核銷", description: "依規則計算與鎖定金額。" },
  { key: "export", label: "匯出", description: "Excel / CSV 報表模板。" },
  { key: "kpi", label: "KPI", description: "訪查完成率、拒訪率、核銷準確率。" },
  { key: "notification", label: "通知", description: "in-app、email、SMS、LINE 預留。" },
];

export const defaultWorkspaceSettings: WorkspaceSettings = {
  workspaceId: "ws_elder_visit_115",
  workspaceLogo: "",
  workspaceThemeColor: "#16645f",
  enabledModules: [
    "case_import",
    "assignment",
    "visit_form",
    "consent",
    "audit",
    "payment",
    "export",
    "kpi",
  ],
  sponsorSettings: {
    enabled: true,
    primarySponsorId: "sp_warmcare",
    exposureLevel: "standard",
    placements: {
      adminHeader: true,
      dashboardImpact: true,
      publicReportCover: true,
      visitorComplete: false,
    },
    disclosureText: "本專案由公益夥伴支持，所有成果揭露皆採彙整與匿名化資料。",
  },
  legalOwnerName: "示範公所",
  responsiblePerson: "社會課承辦人",
  insuranceInfo: "公共意外責任保險：示範保單 115-001",
  serviceDisclaimer: "本服務用於訪查紀錄、稽核與核銷，不取代緊急醫療或社政通報。",
  logRetentionMonths: 12,
  archiveAfterMonths: 12,
  restoreDeadlineDays: 30,
};

export function toggleModule(
  settings: WorkspaceSettings,
  moduleKey: WorkspaceModuleKey,
): WorkspaceSettings {
  const enabledModules = settings.enabledModules.includes(moduleKey)
    ? settings.enabledModules.filter((key) => key !== moduleKey)
    : [...settings.enabledModules, moduleKey];

  return {
    ...settings,
    enabledModules,
  };
}

export function getSoftDeletePreview(days: number) {
  const restoreDeadline = new Date();
  restoreDeadline.setDate(restoreDeadline.getDate() + days);

  return {
    canRestoreUntil: restoreDeadline.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    message: `停用後不可操作，資料保留並可於 ${days} 天內恢復。`,
  };
}
