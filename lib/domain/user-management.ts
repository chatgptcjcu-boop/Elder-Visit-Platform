import { getCurrentWorkspace } from "@/lib/domain/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  UserRegistrationDecision,
  UserRegistrationDecisionResult,
  UserRegistrationRequest,
  VisitorRegistrationSubmission,
  VisitorRegistrationSubmissionResult,
  VisitorRegistrationWorkerGroup,
  WorkspaceRoleKey,
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

export async function getUserManagementOverview() {
  const workspace = getCurrentWorkspace();
  const supabaseRequests = await getSupabaseRegistrationRequests();

  return {
    workspace,
    registrationRequests: mergeRegistrationRequests(supabaseRequests, registrationRequests),
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

export async function submitVisitorRegistration(
  submission: VisitorRegistrationSubmission,
): Promise<VisitorRegistrationSubmissionResult> {
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
  const supabaseResult = await insertSupabaseRegistrationRequest(request);

  return {
    request: supabaseResult.request ?? request,
    message: `${displayName} 的訪員註冊資料已送出。`,
    nextStep:
      supabaseResult.source === "supabase"
        ? "已正式寫入 Supabase，承辦管理者可在使用者管理頁審核。"
        : "目前已暫存送出，請設定 SUPABASE_SERVICE_ROLE_KEY 後才會永久寫入 Supabase。",
    source: supabaseResult.source,
    warning: supabaseResult.warning,
  };
}

export async function reviewRegistration(
  decision: UserRegistrationDecision,
): Promise<UserRegistrationDecisionResult> {
  const supabaseResult = await reviewSupabaseRegistration(decision);
  if (supabaseResult) {
    return supabaseResult;
  }

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

async function reviewSupabaseRegistration(
  decision: UserRegistrationDecision,
): Promise<UserRegistrationDecisionResult | null> {
  try {
    const supabase = createAdminClient();
    const reviewedAt = new Date().toISOString();
    const status = decision.decision === "approve" ? "approved" : "rejected";
    const reviewNote =
      decision.note ||
      (decision.decision === "approve" ? "承辦管理者已核准加入。" : "承辦管理者已退回申請。");

    const { data, error } = await (supabase as unknown as RegistrationRequestReviewClient)
      .from("workspace_registration_requests")
      .update({
        status,
        requested_role_key: decision.roleKey,
        requested_workspace_id: decision.workspaceId,
        review_note: reviewNote,
        reviewed_at: reviewedAt,
        social_bureau_review_status: status,
        social_bureau_reviewed_at: reviewedAt,
        social_bureau_review_note: reviewNote,
      })
      .eq("id", decision.requestId)
      .select("*")
      .single();

    if (error || !data) {
      return null;
    }

    if (decision.decision === "approve") {
      await activateApprovedRegistration(supabase, data, decision);
    }

    const request = mapRegistrationRow(data);
    return {
      requestId: request.id,
      status: request.status,
      message:
        decision.decision === "approve"
          ? `${request.fullName} 已核准加入 ${request.requestedWorkspaceName}。`
          : `${request.fullName} 的加入申請已退回。`,
      nextStep:
        decision.decision === "approve"
          ? `已更新 Supabase 審核狀態，並建立 workspace_membership，角色為 ${decision.roleKey}。`
          : "已更新 Supabase 審核狀態，不建立 Workspace 成員關聯。",
    };
  } catch {
    return null;
  }
}

async function activateApprovedRegistration(
  supabase: unknown,
  row: WorkspaceRegistrationRequestRow,
  decision: UserRegistrationDecision,
) {
  const workspaceId = row.requested_workspace_id ?? decision.workspaceId;
  if (!workspaceId) return;

  const { data: account } = await (supabase as AccountWriteClient)
    .from("accounts")
    .upsert(
      {
        email: row.email,
        full_name: row.full_name,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (!account?.id) return;

  await (supabase as RegistrationRequestReviewClient)
    .from("workspace_registration_requests")
    .update({ account_id: account.id })
    .eq("id", row.id);

  await (supabase as WorkspaceMembershipWriteClient)
    .from("workspace_memberships")
    .upsert(
      {
        workspace_id: workspaceId,
        account_id: account.id,
        role_name: decision.roleKey,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id,account_id" },
    );

  if (decision.roleKey === "visitor") {
    await upsertVisitorProfile(supabase, row, account.id, workspaceId);
  }
}

async function upsertVisitorProfile(
  supabase: unknown,
  row: WorkspaceRegistrationRequestRow,
  accountId: string,
  workspaceId: string,
) {
  const { data: existing } = await (supabase as VisitorProfileReviewClient)
    .from("visitor_profiles")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("account_id", accountId)
    .limit(1)
    .maybeSingle();

  const profileRow = {
    workspace_id: workspaceId,
    account_id: accountId,
    full_name: row.full_name,
    status: "available",
    worker_type: normalizeWorkerGroup(row.worker_group) === "civil_affairs" ? "civil_affairs" : "social_affairs",
    visitor_certificate_no: row.visitor_certificate_no,
    certificate_status: row.visitor_certificate_no ? "valid" : "missing",
    training_date: row.training_completed_at,
    root_unit_name: row.root_unit_name,
    department_name: row.department_name,
    job_title: row.job_title,
    display_name: row.display_name ?? row.full_name,
    gender: normalizeGender(row.gender),
    national_id: row.national_id,
    official_email: row.official_email ?? row.email,
    phone: row.phone,
    headshot_processed_url: row.headshot_processed_url,
    social_bureau_review_status: "approved",
    social_bureau_reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await (supabase as VisitorProfileReviewClient)
      .from("visitor_profiles")
      .update(profileRow)
      .eq("id", existing.id);
    return;
  }

  await (supabase as VisitorProfileReviewClient).from("visitor_profiles").insert(profileRow);
}

async function getSupabaseRegistrationRequests(): Promise<UserRegistrationRequest[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as unknown as RegistrationRequestClient)
      .from("workspace_registration_requests")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(100);

    if (error || !data) {
      return [];
    }

    return data.map(mapRegistrationRow);
  } catch {
    return [];
  }
}

async function insertSupabaseRegistrationRequest(
  request: UserRegistrationRequest,
): Promise<{
  request: UserRegistrationRequest | null;
  source: "supabase" | "memory_fallback";
  warning: string | null;
}> {
  try {
    const supabase = createAdminClient();
    const workspace = await getSupabaseActiveWorkspace();
    const profile = request.visitorRegistrationProfile;
    const { data, error } = await (supabase as unknown as RegistrationRequestWriteClient)
      .from("workspace_registration_requests")
      .insert({
        email: request.email,
        full_name: request.fullName,
        requested_unit_name: request.requestedUnitName,
        requested_workspace_id: workspace?.id ?? null,
        requested_role_key: request.requestedRoleKey,
        status: request.status,
        review_note: request.reviewNote,
        submitted_at: request.submittedAt,
        root_unit_name: profile?.rootUnitName ?? null,
        department_name: profile?.departmentName ?? null,
        department_other: profile?.departmentOther ?? null,
        job_title: profile?.jobTitle ?? null,
        job_title_other: profile?.jobTitleOther ?? null,
        display_name: profile?.displayName ?? request.fullName,
        gender: profile?.gender ?? null,
        national_id: profile?.nationalId ?? null,
        worker_group: profile?.workerGroup ?? null,
        official_email: profile?.officialEmail ?? request.email,
        phone: profile?.phone ?? null,
        training_completed: profile?.trainingCompleted ?? false,
        training_completed_at: profile?.trainingCompletedAt ?? null,
        visitor_certificate_no: profile?.visitorCertificateNo ?? null,
        headshot_original_url: profile?.headshotOriginalUrl ?? null,
        headshot_processed_url: profile?.headshotProcessedUrl ?? null,
        social_bureau_review_status: profile?.socialBureauReviewStatus ?? "not_sent",
        social_bureau_reviewed_at: profile?.socialBureauReviewedAt ?? null,
        social_bureau_review_note: profile?.socialBureauReviewNote ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      return {
        request: null,
        source: "memory_fallback",
        warning: "Supabase 寫入失敗，已改用暫存。請確認 0026 migration 與 service role key。",
      };
    }

    return {
      request: mapRegistrationRow(data),
      source: "supabase",
      warning: null,
    };
  } catch {
    return {
      request: null,
      source: "memory_fallback",
      warning: "Supabase 管理端環境尚未設定，已改用暫存。",
    };
  }
}

async function getSupabaseActiveWorkspace() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as unknown as ActiveWorkspaceClient)
      .from("workspaces")
      .select("id, workspace_name")
      .eq("status", "active")
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function mergeRegistrationRequests(
  supabaseRequests: UserRegistrationRequest[],
  fallbackRequests: UserRegistrationRequest[],
) {
  const seen = new Set<string>();
  return [...supabaseRequests, ...fallbackRequests].filter((request) => {
    const key = `${request.id}:${request.email}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapRegistrationRow(row: WorkspaceRegistrationRequestRow): UserRegistrationRequest {
  const fallbackWorkspace = getCurrentWorkspace();
  const workerGroup = normalizeWorkerGroup(row.worker_group);
  const status = normalizeRegistrationStatus(row.status);
  const socialBureauReviewStatus = normalizeReviewStatus(row.social_bureau_review_status);

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    requestedUnitName: row.requested_unit_name ?? row.root_unit_name ?? "未指定單位",
    requestedWorkspaceId: row.requested_workspace_id,
    requestedWorkspaceName: fallbackWorkspace.name,
    requestedRoleKey: normalizeRoleKey(row.requested_role_key),
    status,
    submittedAt: row.submitted_at,
    reviewNote: row.review_note,
    visitorRegistrationProfile:
      row.root_unit_name || row.department_name || row.job_title || row.national_id
        ? {
            rootUnitName: row.root_unit_name ?? "永和區公所",
            departmentName: row.department_name ?? "其他",
            departmentOther: row.department_other,
            jobTitle: row.job_title ?? "其他",
            jobTitleOther: row.job_title_other,
            displayName: row.display_name ?? row.full_name,
            gender: normalizeGender(row.gender),
            nationalId: row.national_id ?? "",
            workerGroup,
            officialEmail: row.official_email ?? row.email,
            phone: row.phone ?? "",
            trainingCompleted: Boolean(row.training_completed),
            trainingCompletedAt: row.training_completed_at,
            visitorCertificateNo: row.visitor_certificate_no,
            headshotOriginalUrl: row.headshot_original_url,
            headshotProcessedUrl: row.headshot_processed_url,
            socialBureauReviewStatus,
            socialBureauReviewedAt: row.social_bureau_reviewed_at,
            socialBureauReviewNote: row.social_bureau_review_note,
            note: null,
          }
        : undefined,
  };
}

function normalizeRegistrationStatus(value: string): UserRegistrationRequest["status"] {
  if (
    value === "draft" ||
    value === "email_verified" ||
    value === "pending_workspace_review" ||
    value === "pending_supervisor_review" ||
    value === "pending_social_bureau_review" ||
    value === "approved" ||
    value === "rejected"
  ) {
    return value;
  }

  return "pending_workspace_review";
}

function normalizeRoleKey(value: string): WorkspaceRoleKey {
  if (
    value === "workspace_owner" ||
    value === "workspace_manager" ||
    value === "supervisor" ||
    value === "visitor" ||
    value === "auditor" ||
    value === "viewer"
  ) {
    return value;
  }

  return "visitor";
}

function normalizeWorkerGroup(value: string | null): VisitorRegistrationWorkerGroup {
  if (value === "social_affairs" || value === "civil_affairs") {
    return value;
  }

  return "civil_affairs";
}

function normalizeGender(value: string | null): "男" | "女" | "其他" {
  if (value === "男" || value === "女" || value === "其他") {
    return value;
  }

  return "其他";
}

function normalizeReviewStatus(value: string | null) {
  if (value === "not_sent" || value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }

  return "not_sent";
}

type WorkspaceRegistrationRequestRow = {
  id: string;
  email: string;
  full_name: string;
  requested_unit_name: string | null;
  requested_workspace_id: string | null;
  requested_role_key: string;
  status: string;
  review_note: string | null;
  submitted_at: string;
  root_unit_name: string | null;
  department_name: string | null;
  department_other: string | null;
  job_title: string | null;
  job_title_other: string | null;
  display_name: string | null;
  gender: string | null;
  national_id: string | null;
  worker_group: string | null;
  official_email: string | null;
  phone: string | null;
  training_completed: boolean;
  training_completed_at: string | null;
  visitor_certificate_no: string | null;
  headshot_original_url: string | null;
  headshot_processed_url: string | null;
  social_bureau_review_status: string;
  social_bureau_reviewed_at: string | null;
  social_bureau_review_note: string | null;
};

type RegistrationRequestClient = {
  from(table: "workspace_registration_requests"): {
    select(query: string): {
      order(column: string, options: { ascending: boolean }): {
        limit(count: number): Promise<{
          data: WorkspaceRegistrationRequestRow[] | null;
          error: unknown;
        }>;
      };
    };
  };
};

type RegistrationRequestWriteClient = {
  from(table: "workspace_registration_requests"): {
    insert(row: Record<string, unknown>): {
      select(query: string): {
        single(): Promise<{
          data: WorkspaceRegistrationRequestRow | null;
          error: unknown;
        }>;
      };
    };
  };
};

type RegistrationRequestReviewClient = {
  from(table: "workspace_registration_requests"): {
    update(row: Record<string, unknown>): {
      eq(column: string, value: string): {
        select(query: string): {
          single(): Promise<{
            data: WorkspaceRegistrationRequestRow | null;
            error: unknown;
          }>;
        };
      } & PromiseLike<{
        data: WorkspaceRegistrationRequestRow | null;
        error: unknown;
      }>;
    };
  };
};

type AccountWriteClient = {
  from(table: "accounts"): {
    upsert(row: Record<string, unknown>, options: { onConflict: string }): {
      select(query: string): {
        single(): Promise<{
          data: { id: string } | null;
          error: unknown;
        }>;
      };
    };
  };
};

type WorkspaceMembershipWriteClient = {
  from(table: "workspace_memberships"): {
    upsert(row: Record<string, unknown>, options: { onConflict: string }): Promise<{
      data: unknown;
      error: unknown;
    }>;
  };
};

type VisitorProfileReviewClient = {
  from(table: "visitor_profiles"): {
    select(query: string): {
      eq(column: string, value: string): {
        eq(column: string, value: string): {
          limit(count: number): {
            maybeSingle(): Promise<{
              data: { id: string } | null;
              error: unknown;
            }>;
          };
        };
      };
    };
    update(row: Record<string, unknown>): {
      eq(column: string, value: string): Promise<{
        data: unknown;
        error: unknown;
      }>;
    };
    insert(row: Record<string, unknown>): Promise<{
      data: unknown;
      error: unknown;
    }>;
  };
};

type ActiveWorkspaceClient = {
  from(table: "workspaces"): {
    select(query: string): {
      eq(column: string, value: string): {
        limit(count: number): {
          single(): Promise<{
            data: { id: string; workspace_name: string } | null;
            error: unknown;
          }>;
        };
      };
    };
  };
};
