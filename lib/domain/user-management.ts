import { getCurrentWorkspace } from "@/lib/domain/mock-data";
import type {
  UserRegistrationDecision,
  UserRegistrationDecisionResult,
  UserRegistrationRequest,
} from "@/lib/domain/types";

export const registrationRequests: UserRegistrationRequest[] = [
  {
    id: "reg_001",
    email: "new.visitor@example.org",
    fullName: "新進訪員",
    requestedUnitName: "示範公所",
    requestedWorkspaceId: "ws_elder_visit_115",
    requestedWorkspaceName: "115 年獨居長者訪查",
    requestedRoleKey: "visitor",
    status: "pending_workspace_review",
    submittedAt: "2026-04-26T09:15:00+08:00",
    reviewNote: null,
  },
  {
    id: "reg_002",
    email: "case.viewer@example.org",
    fullName: "成果檢視者",
    requestedUnitName: "示範公所",
    requestedWorkspaceId: "ws_elder_visit_115",
    requestedWorkspaceName: "115 年獨居長者訪查",
    requestedRoleKey: "viewer",
    status: "email_verified",
    submittedAt: "2026-04-26T10:10:00+08:00",
    reviewNote: "已完成 email 驗證，等待管理者選擇 Workspace 與角色。",
  },
];

export function getUserManagementOverview() {
  const workspace = getCurrentWorkspace();

  return {
    workspace,
    registrationRequests,
    flow: [
      "使用者建立帳號並完成 email 驗證。",
      "使用者選擇或輸入單位，系統比對既有 Unit。",
      "使用者申請加入 Workspace，選擇預期角色或由管理者指定。",
      "Workspace 管理者審核申請，核准後建立 workspace_membership。",
      "系統依角色權限決定登入後首頁、選單與操作權限。",
    ],
  };
}

export function reviewRegistration(
  decision: UserRegistrationDecision,
): UserRegistrationDecisionResult {
  const request = registrationRequests.find((item) => item.id === decision.requestId);

  if (!request) {
    return {
      requestId: decision.requestId,
      status: "rejected",
      message: "找不到註冊申請。",
      nextStep: "請重新整理使用者管理頁。",
    };
  }

  if (decision.decision === "reject") {
    return {
      requestId: request.id,
      status: "rejected",
      message: `${request.fullName} 的加入申請已退回。`,
      nextStep: "系統會保留審核紀錄，不建立 Workspace 成員關聯。",
    };
  }

  return {
    requestId: request.id,
    status: "approved",
    message: `${request.fullName} 已加入 ${request.requestedWorkspaceName}。`,
    nextStep: `建立 workspace_membership，角色為 ${decision.roleKey}，下次登入依此角色顯示畫面。`,
  };
}
