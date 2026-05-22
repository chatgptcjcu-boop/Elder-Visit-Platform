import { getCurrentWorkspace } from "@/lib/domain/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  UserRegistrationDecision,
  UserRegistrationDecisionResult,
  UserRegistrationRequest,
  VisitorInvitationResult,
  VisitorRegistrationSubmission,
  VisitorRegistrationSubmissionResult,
  VisitorRegistrationWorkerGroup,
  VisitorRemittanceReviewStatus,
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
      registrationCode: "REG-115-YH-0001",
      authInviteStatus: "not_sent",
      authInvitedAt: null,
      authActivatedAt: null,
      profileCompletionStatus: "submitted",
      profileSubmittedAt: "2026-04-26T09:15:00+08:00",
      profileReviewedAt: null,
      profileReturnReason: null,
      visitorCode: null,
      qrCodePayload: null,
      bankAccountLast5: null,
      bankName: null,
      bankCode: null,
      bankBranchName: null,
      bankAccountName: null,
      passbookCoverUrl: null,
      passbookUploadedAt: null,
      remittanceReviewStatus: "pending",
      remittanceReady: false,
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

function getInitialProfileCompletionStatus(submission: VisitorRegistrationSubmission) {
  return submission.fullName &&
    submission.email &&
    submission.nationalId &&
    submission.phone &&
    submission.headshotProcessedUrl
    ? "submitted"
    : "incomplete";
}

export async function submitVisitorRegistration(
  submission: VisitorRegistrationSubmission,
): Promise<VisitorRegistrationSubmissionResult> {
  const displayName = createVisitorDisplayName(submission);
  const submittedAt = new Date().toISOString();
  const profileCompletionStatus = getInitialProfileCompletionStatus(submission);
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
    submittedAt,
    reviewNote: submission.trainingCompleted
      ? "訪員已送出註冊資料，待承辦與社會局覆核。"
      : "尚未完成教育訓練，需承辦先退補或保留待補。",
    visitorRegistrationProfile: {
      ...submission,
      displayName,
      socialBureauReviewStatus: submission.trainingCompleted ? "pending" : "not_sent",
      socialBureauReviewedAt: null,
      socialBureauReviewNote: null,
      registrationCode: null,
      authInviteStatus: "not_sent",
      authInvitedAt: null,
      authActivatedAt: null,
      profileCompletionStatus,
      profileSubmittedAt: profileCompletionStatus === "submitted" ? submittedAt : null,
      profileReviewedAt: null,
      profileReturnReason: null,
      visitorCode: null,
      qrCodePayload: null,
      bankAccountLast5: null,
      bankName: null,
      bankCode: null,
      bankBranchName: null,
      bankAccountName: null,
      passbookCoverUrl: null,
      passbookUploadedAt: null,
      remittanceReviewStatus: "pending",
      remittanceReady: false,
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
    return {
      ...supabaseResult,
      source: "supabase",
    };
  }

  const request = registrationRequests.find((item) => item.id === decision.requestId);

  if (!request) {
    return {
      requestId: decision.requestId,
      status: "rejected",
      message: "找不到註冊申請。",
      nextStep: "請重新整理使用者管理頁。",
      source: "memory_fallback",
    };
  }

  if (decision.decision === "reject") {
    return {
      requestId: request.id,
      status: "rejected",
      message: `${request.fullName} 的加入申請已退回。`,
      nextStep: "目前未連上正式 Supabase 寫入，畫面會先保留本次操作結果。",
      source: "memory_fallback",
    };
  }

  return {
    requestId: request.id,
    status: "approved",
    message: `${request.fullName} 已加入 ${request.requestedWorkspaceName}。`,
    nextStep:
      "目前未連上正式 Supabase 寫入，畫面會先保留本次操作結果；正式大量使用前請確認 Cloudflare 的 Supabase service role key。",
    source: "memory_fallback",
  };
}

export async function inviteApprovedVisitor(
  requestId: string,
  origin: string,
): Promise<VisitorInvitationResult> {
  try {
    const supabase = createAdminClient();
    const { data: request, error } = await (supabase as unknown as RegistrationRequestByIdClient)
      .from("workspace_registration_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (error || !request) {
      return {
        requestId,
        email: "",
        status: "failed",
        message: "找不到這筆已通過訪員註冊資料。",
        nextStep: "請重新整理使用者管理頁後再試一次。",
      };
    }

    if (request.status !== "approved") {
      return {
        requestId,
        email: request.email,
        status: "failed",
        message: "這筆註冊尚未審核通過，不能發送登入邀請。",
        nextStep: "請先完成核准加入，再發送登入邀請。",
      };
    }

    const redirectTo = `${origin}/login?invited=1`;
    const inviteResult = await supabase.auth.admin.inviteUserByEmail(request.email, {
      redirectTo,
      data: {
        full_name: request.full_name,
        role_key: request.requested_role_key,
        visitor_code: request.visitor_code,
        registration_code: request.registration_code,
      },
    });

    if (inviteResult.error || !inviteResult.data.user) {
      await updateInvitationStatus(supabase, request, "failed", null);
      return {
        requestId,
        email: request.email,
        status: "failed",
        message: inviteResult.error?.message ?? "Supabase Auth 邀請信發送失敗。",
        nextStep: "請確認 Supabase Email Auth、SMTP 或專案寄信限制，修正後可重寄邀請。",
      };
    }

    await updateInvitationStatus(supabase, request, "sent", inviteResult.data.user.id);

    return {
      requestId,
      email: request.email,
      status: "sent",
      message: `已發送登入設定邀請到 ${request.email}。`,
      nextStep: "訪員收到信後可進入設定密碼流程；若未收到，可在後台重寄邀請。",
    };
  } catch {
    return {
      requestId,
      email: "",
      status: "failed",
      message: "發送登入邀請失敗，可能是 Supabase 管理端環境尚未設定。",
      nextStep: "請確認 NEXT_PUBLIC_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY 已設定。",
    };
  }
}

async function updateInvitationStatus(
  supabase: unknown,
  request: WorkspaceRegistrationRequestRow,
  status: "sent" | "failed",
  authUserId: string | null,
) {
  const now = new Date().toISOString();

  await (supabase as RegistrationRequestReviewClient)
    .from("workspace_registration_requests")
    .update({
      auth_invite_status: status,
      auth_invited_at: status === "sent" ? now : request.auth_invited_at,
    })
    .eq("id", request.id);

  if (authUserId && request.account_id) {
    await (supabase as AccountAuthUserUpdateClient)
      .from("accounts")
      .update({
        auth_user_id: authUserId,
        updated_at: now,
      })
      .eq("id", request.account_id);
  }
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
        profile_completion_status: decision.decision === "approve" ? "submitted" : "returned",
        profile_reviewed_at: reviewedAt,
        profile_return_reason: decision.decision === "reject" ? reviewNote : null,
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
    const visitorIdentity = await upsertVisitorProfile(supabase, row, account.id, workspaceId);
    await (supabase as RegistrationRequestReviewClient)
      .from("workspace_registration_requests")
      .update({
        visitor_code: visitorIdentity.visitorCode,
        qr_code_payload: visitorIdentity.qrCodePayload,
      })
      .eq("id", row.id);
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
    .select("id, visitor_code")
    .eq("workspace_id", workspaceId)
    .eq("account_id", accountId)
    .limit(1)
    .maybeSingle();

  const workerType = normalizeWorkerGroup(row.worker_group) === "civil_affairs" ? "civil_affairs" : "social_affairs";
  const visitorCode =
    existing?.visitor_code ?? (await createVisitorCode(supabase, workspaceId, workerType, row.registration_code ?? row.id));
  const qrCodePayload = createVisitorQrCodePayload(visitorCode);
  const profileCompletionStatus = getRowProfileCompletionStatus(row);
  const now = new Date().toISOString();

  const profileRow = {
    workspace_id: workspaceId,
    account_id: accountId,
    full_name: row.full_name,
    status: profileCompletionStatus === "submitted" ? "available" : "pending_profile_completion",
    worker_type: workerType,
    visitor_code: visitorCode,
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
    social_bureau_reviewed_at: now,
    profile_completion_status: profileCompletionStatus,
    profile_completed_at: profileCompletionStatus === "submitted" ? (row.profile_submitted_at ?? now) : null,
    profile_reviewed_at: row.profile_reviewed_at,
    qr_code_payload: qrCodePayload,
    qr_code_generated_at: now,
    is_assignable: false,
    updated_at: now,
  };

  if (existing?.id) {
    await (supabase as VisitorProfileReviewClient)
      .from("visitor_profiles")
      .update(profileRow)
      .eq("id", existing.id);
    return { visitorCode, qrCodePayload };
  }

  await (supabase as VisitorProfileReviewClient).from("visitor_profiles").insert(profileRow);
  return { visitorCode, qrCodePayload };
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

    const profiles = await getSupabaseVisitorProfileRemittance(data);

    return data.map((row) => mapRegistrationRow(row, profiles.get(row.account_id ?? "")));
  } catch {
    return [];
  }
}

async function getSupabaseVisitorProfileRemittance(
  requests: WorkspaceRegistrationRequestRow[],
): Promise<Map<string, VisitorProfileRemittanceRow>> {
  const accountIds = Array.from(
    new Set(requests.map((request) => request.account_id).filter((id): id is string => Boolean(id))),
  );

  if (accountIds.length === 0) {
    return new Map();
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as unknown as VisitorProfileRemittanceClient)
      .from("visitor_profiles")
      .select(
        "account_id, bank_account_last5, bank_name, bank_code, bank_branch_name, bank_account_name, passbook_cover_url, passbook_uploaded_at, remittance_review_status, remittance_ready",
      )
      .in("account_id", accountIds);

    if (error || !data) {
      return new Map();
    }

    return new Map(data.map((profile) => [profile.account_id, profile]));
  } catch {
    return new Map();
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
    const profileCompletionStatus = profile?.profileCompletionStatus ?? "incomplete";
    const { data, error } = await (supabase as unknown as RegistrationRequestWriteClient)
      .from("workspace_registration_requests")
      .insert({
        registration_code: profile?.registrationCode ?? createRegistrationCode(request.submittedAt),
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
        auth_invite_status: profile?.authInviteStatus ?? "not_sent",
        auth_invited_at: profile?.authInvitedAt ?? null,
        auth_activated_at: profile?.authActivatedAt ?? null,
        profile_completion_status: profileCompletionStatus,
        profile_submitted_at: profile?.profileSubmittedAt ?? (profileCompletionStatus === "submitted" ? request.submittedAt : null),
        profile_reviewed_at: profile?.profileReviewedAt ?? null,
        profile_return_reason: profile?.profileReturnReason ?? null,
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

function mapRegistrationRow(
  row: WorkspaceRegistrationRequestRow,
  remittanceProfile?: VisitorProfileRemittanceRow,
): UserRegistrationRequest {
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
            registrationCode: row.registration_code,
            authInviteStatus: normalizeAuthInviteStatus(row.auth_invite_status),
            authInvitedAt: row.auth_invited_at,
            authActivatedAt: row.auth_activated_at,
            profileCompletionStatus: normalizeProfileCompletionStatus(row.profile_completion_status),
            profileSubmittedAt: row.profile_submitted_at,
            profileReviewedAt: row.profile_reviewed_at,
            profileReturnReason: row.profile_return_reason,
            visitorCode: row.visitor_code,
            qrCodePayload: row.qr_code_payload,
            bankAccountLast5: remittanceProfile?.bank_account_last5 ?? null,
            bankName: remittanceProfile?.bank_name ?? null,
            bankCode: remittanceProfile?.bank_code ?? null,
            bankBranchName: remittanceProfile?.bank_branch_name ?? null,
            bankAccountName: remittanceProfile?.bank_account_name ?? null,
            passbookCoverUrl: remittanceProfile?.passbook_cover_url ?? null,
            passbookUploadedAt: remittanceProfile?.passbook_uploaded_at ?? null,
            remittanceReviewStatus: normalizeRemittanceReviewStatus(
              remittanceProfile?.remittance_review_status ?? null,
            ),
            remittanceReady: Boolean(remittanceProfile?.remittance_ready),
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

function normalizeAuthInviteStatus(value: string | null) {
  if (value === "not_sent" || value === "sent" || value === "activated" || value === "failed") {
    return value;
  }

  return "not_sent";
}

function normalizeProfileCompletionStatus(value: string | null) {
  if (value === "incomplete" || value === "submitted" || value === "verified" || value === "returned") {
    return value;
  }

  return "incomplete";
}

function normalizeRemittanceReviewStatus(value: string | null): VisitorRemittanceReviewStatus {
  if (value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }

  return "pending";
}

function getRowProfileCompletionStatus(row: WorkspaceRegistrationRequestRow) {
  const existingStatus = normalizeProfileCompletionStatus(row.profile_completion_status);
  if (existingStatus === "verified" || existingStatus === "returned") {
    return existingStatus;
  }

  return row.full_name &&
    row.email &&
    row.national_id &&
    row.phone &&
    row.headshot_processed_url
    ? "submitted"
    : "incomplete";
}

function createRegistrationCode(submittedAt: string) {
  const date = new Date(submittedAt);
  const compactTimestamp = Number.isNaN(date.getTime())
    ? Date.now().toString(36).toUpperCase()
    : date.getTime().toString(36).toUpperCase();
  return `REG-115-YH-${compactTimestamp}`;
}

async function createVisitorCode(
  supabase: unknown,
  workspaceId: string,
  workerType: "civil_affairs" | "social_affairs",
  fallbackSeed: string,
) {
  const typeCode = workerType === "civil_affairs" ? "CIV" : "SOC";
  const prefix = `EV-115-YH-${typeCode}`;

  try {
    const { data, error } = await (supabase as VisitorCodeLookupClient)
      .from("visitor_profiles")
      .select("visitor_code")
      .eq("workspace_id", workspaceId)
      .eq("worker_type", workerType);

    if (!error && data) {
      const nextSequence =
        data.reduce((max, item) => {
          const match = item.visitor_code?.match(/-(\d+)$/);
          const value = match ? Number(match[1]) : 0;
          return Number.isFinite(value) ? Math.max(max, value) : max;
        }, 0) + 1;
      return `${prefix}-${String(nextSequence).padStart(4, "0")}`;
    }
  } catch {
    // Fallback below keeps review from failing if code lookup is unavailable.
  }

  const suffix = fallbackSeed.replace(/[^0-9]/g, "").slice(-4) || Date.now().toString().slice(-4);
  return `${prefix}-${suffix.padStart(4, "0")}`;
}

function createVisitorQrCodePayload(visitorCode: string) {
  return `https://eldervisit.netlify.app/verify/visitor/${visitorCode}`;
}

type WorkspaceRegistrationRequestRow = {
  id: string;
  account_id: string | null;
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
  registration_code: string | null;
  auth_invite_status: string | null;
  auth_invited_at: string | null;
  auth_activated_at: string | null;
  profile_completion_status: string | null;
  profile_submitted_at: string | null;
  profile_reviewed_at: string | null;
  profile_return_reason: string | null;
  visitor_code: string | null;
  qr_code_payload: string | null;
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

type VisitorProfileRemittanceRow = {
  account_id: string;
  bank_account_last5: string | null;
  bank_name: string | null;
  bank_code: string | null;
  bank_branch_name: string | null;
  bank_account_name: string | null;
  passbook_cover_url: string | null;
  passbook_uploaded_at: string | null;
  remittance_review_status: string | null;
  remittance_ready: boolean | null;
};

type VisitorProfileRemittanceClient = {
  from(table: "visitor_profiles"): {
    select(query: string): {
      in(column: string, values: string[]): Promise<{
        data: VisitorProfileRemittanceRow[] | null;
        error: unknown;
      }>;
    };
  };
};

type RegistrationRequestByIdClient = {
  from(table: "workspace_registration_requests"): {
    select(query: string): {
      eq(column: string, value: string): {
        single(): Promise<{
          data: WorkspaceRegistrationRequestRow | null;
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

type AccountAuthUserUpdateClient = {
  from(table: "accounts"): {
    update(row: Record<string, unknown>): {
      eq(column: string, value: string): Promise<{
        data: unknown;
        error: unknown;
      }>;
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
              data: { id: string; visitor_code: string | null } | null;
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

type VisitorCodeLookupClient = {
  from(table: "visitor_profiles"): {
    select(query: string): {
      eq(column: string, value: string): {
        eq(column: string, value: string): Promise<{
          data: Array<{ visitor_code: string | null }> | null;
          error: unknown;
        }>;
      };
    };
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
