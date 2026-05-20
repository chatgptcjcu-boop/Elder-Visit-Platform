import { getCurrentWorkspace } from "@/lib/domain/mock-data";
import type {
  UserRegistrationDecision,
  UserRegistrationDecisionResult,
  UserRegistrationRequest,
  VisitorRegistrationSubmission,
} from "@/lib/domain/types";

export const visitorRegistrationDepartments = [
  "志工",
  "所本部",
  "民政課",
  "會計室",
  "社會人文課",
  "經建課",
  "工務課",
  "秘書室",
  "人事室",
  "政風室",
  "役政災防課",
  "其他",
];

export const visitorRegistrationJobTitles = [
  "公所人員",
  "里長",
  "里幹事",
  "社工",
  "志工",
  "其他（鄰長）",
  "其他",
];

export const registrationRequests: UserRegistrationRequest[] = [
  {
    id: "reg_001",
    email: "visitor.yonghe@eldervisit.org",
    fullName: "陳怡君",
    requestedUnitName: "永和區公所民政課",
    requestedWorkspaceId: "ws_elder_visit_115",
    requestedWorkspaceName: "115 年獨居長者訪查",
    requestedRoleKey: "visitor",
    status: "pending_social_bureau_review",
    submittedAt: "2026-04-26T09:15:00+08:00",
    reviewNote: "已完成教育訓練，等待社會局覆核訪查資格。",
    visitorRegistrationProfile: {
      rootUnitName: "永和區公所",
      departmentName: "民政課",
      departmentOther: null,
      jobTitle: "里幹事",
      jobTitleOther: null,
      displayName: "永和區公所民政課-陳怡君-里幹事",
      gender: "女",
      nationalId: "A123456789",
      workerGroup: "civil_affairs",
      officialEmail: "visitor.yonghe@eldervisit.org",
      phone: "0912-345-678",
      trainingCompleted: true,
      trainingCompletedAt: "2026-04-18",
      visitorCertificateNo: "EV-YH-115-001",
      headshotOriginalUrl: null,
      headshotProcessedUrl: null,
      socialBureauReviewStatus: "pending",
      socialBureauReviewedAt: null,
      socialBureauReviewNote: null,
      note: "由民政課提報，可支援里別派案與共訪。",
    },
  },
  {
    id: "reg_002",
    email: "case.viewer@eldervisit.org",
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
      "新訪員填寫清冊欄位：姓名、性別、身分證字號、民政/社政、職稱、公務信箱與教育訓練。",
      "系統依單位、姓名、職稱產生暱稱，並建立白底一寸證件照預覽。",
      "承辦管理者先審核工作空間與角色，再送社會局覆核訪查資格。",
      "覆核通過後建立 workspace_membership 與 visitor_profiles，派案才可選用。",
    ],
  };
}

export function createVisitorDisplayName(
  submission: Pick<
    VisitorRegistrationSubmission,
    "rootUnitName" | "departmentName" | "departmentOther" | "fullName" | "jobTitle" | "jobTitleOther"
  >,
) {
  const department =
    submission.departmentName === "其他"
      ? submission.departmentOther?.trim() || "其他單位"
      : submission.departmentName;
  const jobTitle =
    submission.jobTitle === "其他"
      ? submission.jobTitleOther?.trim() || "其他職稱"
      : submission.jobTitle === "其他（鄰長）"
        ? "鄰長"
        : submission.jobTitle;

  return `${submission.rootUnitName}${department}-${submission.fullName || "未填姓名"}-${jobTitle}`;
}

export function submitVisitorRegistration(submission: VisitorRegistrationSubmission) {
  const displayName = createVisitorDisplayName(submission);
  const request: UserRegistrationRequest = {
    id: `reg_${Date.now()}`,
    email: submission.email,
    fullName: submission.fullName,
    requestedUnitName: `${submission.rootUnitName}${
      submission.departmentName === "其他"
        ? submission.departmentOther || "其他單位"
        : submission.departmentName
    }`,
    requestedWorkspaceId: submission.requestedWorkspaceId,
    requestedWorkspaceName: submission.requestedWorkspaceName,
    requestedRoleKey: "visitor",
    status: submission.trainingCompleted ? "pending_social_bureau_review" : "pending_supervisor_review",
    submittedAt: new Date().toISOString(),
    reviewNote: submission.trainingCompleted
      ? "訪員已送出註冊資料，待承辦與社會局覆核。"
      : "尚未完成教育訓練，需承辦先退補或保留待補。",
    visitorRegistrationProfile: {
      ...submission,
      displayName,
      socialBureauReviewStatus: submission.trainingCompleted ? "pending" : "not_sent",
      socialBureauReviewedAt: null,
      socialBureauReviewNote: null,
    },
  };

  registrationRequests.unshift(request);

  return {
    request,
    message: `${displayName} 的訪員註冊資料已送出。`,
    nextStep: "承辦管理者可在使用者管理頁審核，通過後再納入訪員資格檔與派案流程。",
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
