import type { BlueprintMigrationPreview, Workspace } from "@/lib/domain/types";

const elderVisitLatestVersion = "1.1.0";

export function createBlueprintMigrationPreview(workspace: Workspace): BlueprintMigrationPreview {
  if (workspace.status === "soft_deleted") {
    return {
      workspaceId: workspace.id,
      blueprintId: workspace.blueprint.id,
      fromVersion: workspace.blueprint.version,
      toVersion: workspace.blueprint.version,
      status: "blocked",
      canAutoApply: false,
      summary: "工作空間已停用，恢復前不可升級藍圖。",
      impacts: [],
      requiredApprovals: ["workspace_manager"],
    };
  }

  if (workspace.blueprint.type !== "elder_visit") {
    return {
      workspaceId: workspace.id,
      blueprintId: workspace.blueprint.id,
      fromVersion: workspace.blueprint.version,
      toVersion: workspace.blueprint.version,
      status: "blocked",
      canAutoApply: false,
      summary: "v2.4 第一市場聚焦獨居長者訪查，非第一市場 Blueprint 暫不開放升級。",
      impacts: [],
      requiredApprovals: ["platform_owner"],
    };
  }

  if (workspace.blueprint.version === elderVisitLatestVersion) {
    return {
      workspaceId: workspace.id,
      blueprintId: workspace.blueprint.id,
      fromVersion: workspace.blueprint.version,
      toVersion: elderVisitLatestVersion,
      status: "ready",
      canAutoApply: false,
      summary: "目前已是最新 Blueprint 版本，無需套用 migration。",
      impacts: [],
      requiredApprovals: [],
    };
  }

  return {
    workspaceId: workspace.id,
    blueprintId: workspace.blueprint.id,
    fromVersion: workspace.blueprint.version,
    toVersion: elderVisitLatestVersion,
    status: "preview_only",
    canAutoApply: false,
    summary: "偵測到新版 Blueprint。依 Binding 規則，既有 Workspace 不會被直接覆寫，需確認差異後再升級。",
    impacts: [
      {
        key: "visit_form_consent_scope",
        label: "訪查表單新增同意用途欄位",
        impactType: "added",
        severity: "medium",
        detail: "新增 consent_scope，多用途同意會影響稽核與匯出遮罩規則。",
      },
      {
        key: "export_consent_guard",
        label: "匯出模板加入 Consent Guard",
        impactType: "changed",
        severity: "high",
        detail: "政府回報可保留必要個資，贊助與研究用途需自動去識別化。",
      },
      {
        key: "log_tiering_policy",
        label: "新增日誌分層保存政策",
        impactType: "added",
        severity: "low",
        detail: "workspace_activity_logs、export_logs、consent_usage_logs 需納入分層保存。",
      },
    ],
    requiredApprovals: ["workspace_manager", "data_governance_owner"],
  };
}

export function getBlueprintBindingRuleNotes() {
  return [
    "已被 Workspace 使用的 Blueprint 不可直接覆寫。",
    "新版 Blueprint 必須重新 publish，並產生 migration preview。",
    "第一市場以獨居長者訪查為主，其他 Blueprint 暫列第二階段。",
  ];
}
