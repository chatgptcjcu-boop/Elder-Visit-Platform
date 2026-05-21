"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  IdCard,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserPlus,
  Volume2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCan } from "@/components/auth/permission-provider";
import { Button } from "@/components/ui/button";
import { workspaceRoles } from "@/lib/domain/permissions";
import { visitors as defaultVisitors } from "@/lib/domain/assignments";
import type {
  UserRegistrationDecisionResult,
  UserRegistrationRequest,
  VisitorInvitationResult,
  VisitorRegistrationSubmission,
  VisitorRegistrationSubmissionResult,
  VisitorRegistrationWorkerGroup,
  VisitorProfile,
  VisitorWorkerType,
  WorkspaceModuleKey,
  Workspace,
  WorkspaceRoleKey,
} from "@/lib/domain/types";

type UsersPayload = {
  workspace: Workspace;
  registrationRequests: UserRegistrationRequest[];
  flow: string[];
};

type VisitorRegistryView = "all" | "needs_invite" | "needs_profile" | "needs_remittance" | "assignable";

export function UsersPanel() {
  const canReviewUsers = useCan("users.review");
  const [payload, setPayload] = useState<UsersPayload | null>(null);
  const [result, setResult] = useState<UserRegistrationDecisionResult | null>(null);
  const [visitorProfiles, setVisitorProfiles] = useState<VisitorProfile[]>(defaultVisitors);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const pendingRequests = useMemo(
    () =>
      payload?.registrationRequests.filter(
        (request) => request.status !== "approved" && request.status !== "rejected",
      ) ?? [],
    [payload?.registrationRequests],
  );
  const approvedRequests = useMemo(
    () => payload?.registrationRequests.filter((request) => request.status === "approved") ?? [],
    [payload?.registrationRequests],
  );
  const rejectedRequests = useMemo(
    () => payload?.registrationRequests.filter((request) => request.status === "rejected") ?? [],
    [payload?.registrationRequests],
  );
  const approvedPhotoCount = approvedRequests.filter(
    (request) => request.visitorRegistrationProfile?.headshotProcessedUrl,
  ).length;
  const needsInviteCount = approvedRequests.filter((request) =>
    matchesVisitorRegistryView(request, "needs_invite"),
  ).length;
  const needsProfileCount = approvedRequests.filter((request) =>
    matchesVisitorRegistryView(request, "needs_profile"),
  ).length;
  const needsRemittanceCount = approvedRequests.filter((request) =>
    matchesVisitorRegistryView(request, "needs_remittance"),
  ).length;
  const assignableCount = approvedRequests.filter((request) =>
    matchesVisitorRegistryView(request, "assignable"),
  ).length;

  async function loadUsers() {
    const response = await fetch(`/api/users?ts=${Date.now()}`, { cache: "no-store" });
    const json = (await response.json()) as { data?: UsersPayload };
    setPayload(json.data ?? null);
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    async function loadVisitorProfiles() {
      const response = await fetch("/api/visitor-profiles");
      const json = (await response.json()) as { data?: VisitorProfile[] };
      setVisitorProfiles(json.data ?? defaultVisitors);
    }

    void loadVisitorProfiles();
  }, []);

  async function review(
    request: UserRegistrationRequest,
    decision: "approve" | "reject",
    roleKey: WorkspaceRoleKey = request.requestedRoleKey,
  ) {
    setReviewingRequestId(request.id);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          decision,
          roleKey,
          workspaceId: request.requestedWorkspaceId ?? payload?.workspace.id,
          note: "使用者管理頁審核",
        }),
      });
      const json = (await response.json()) as {
        data?: UserRegistrationDecisionResult;
        error?: { message?: string };
      };

      if (!response.ok || !json.data) {
        setResult({
          requestId: request.id,
          status: request.status,
          message: json.error?.message ?? "審核動作沒有完成。",
          nextStep: "請確認目前登入角色有審核權限，或重新整理頁面後再試一次。",
        });
        return;
      }

      setResult(json.data);
      setPayload((current) =>
        current
          ? {
              ...current,
              registrationRequests: current.registrationRequests.map((item) =>
                item.id === request.id
                  ? {
                      ...item,
                      status: json.data!.status,
                      reviewNote: json.data!.message,
                      visitorRegistrationProfile: item.visitorRegistrationProfile
                        ? {
                            ...item.visitorRegistrationProfile,
                            socialBureauReviewStatus:
                              json.data!.status === "approved" ? "approved" : "rejected",
                            socialBureauReviewedAt: new Date().toISOString(),
                            socialBureauReviewNote: json.data!.message,
                          }
                        : item.visitorRegistrationProfile,
                    }
                  : item,
              ),
            }
          : current,
      );
      await loadUsers();
    } finally {
      setReviewingRequestId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <UserPlus className="h-5 w-5" />
              <p className="text-sm font-semibold">使用者管理工作台</p>
            </div>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">註冊審核與訪員名冊</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              先看待審、待邀請、待補資料與可派案人數，再進入批次處理；註冊流程說明移到頁面底部索引。
            </p>
          </div>
          {payload && (
            <div className="grid gap-2 rounded-lg border bg-background p-3 text-sm">
              <StatusRow label="工作空間" value={payload.workspace.name} />
              <StatusRow label="註冊總量" value={`${payload.registrationRequests.length} 筆`} />
              <StatusRow label="可派案訪員" value={`${assignableCount} 位`} />
              <StatusRow label="已退回" value={`${rejectedRequests.length} 筆`} />
              <StatusRow label="證件照" value={`${approvedPhotoCount}/${approvedRequests.length} 份`} />
            </div>
          )}
        </div>
      </section>

      {payload && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <UserDashboardMetric
              icon={Clock3}
              label="待審核"
              value={pendingRequests.length}
              detail="新註冊或尚未通過的申請"
            />
            <UserDashboardMetric
              icon={Mail}
              label="待發邀請"
              value={needsInviteCount}
              detail="已通過但尚未發登入邀請"
            />
            <UserDashboardMetric
              icon={IdCard}
              label="待補/待確認"
              value={needsProfileCount + needsRemittanceCount}
              detail="個人資料或匯款資料尚未完成"
            />
            <UserDashboardMetric
              icon={CheckCircle2}
              label="已可派案"
              value={assignableCount}
              detail="資料與匯款確認完成"
            />
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">今日建議處理順序</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  依大量志工管理流程，先清審核，再發邀請，最後確認補件與匯款。
                </p>
              </div>
              <span className="w-fit rounded-md bg-secondary px-2.5 py-1 text-xs font-medium">今日</span>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              <UserActionCard
                title="先處理待審核"
                detail={`${pendingRequests.length} 筆申請待承辦管理者確認。`}
                href="#pending-requests"
                icon={ClipboardCheck}
              />
              <UserActionCard
                title="再發登入邀請"
                detail={`${needsInviteCount} 位已通過訪員尚未收到登入邀請。`}
                href="#approved-visitors"
                icon={Mail}
              />
              <UserActionCard
                title="追補資料與匯款"
                detail={`${needsProfileCount + needsRemittanceCount} 筆資料仍需確認或補件。`}
                href="#approved-visitors"
                icon={IdCard}
              />
              <UserActionCard
                title="確認可派案名冊"
                detail={`${assignableCount} 位訪員可納入派案與核銷流程。`}
                href="#approved-visitors"
                icon={CheckCircle2}
              />
            </div>
          </section>

          <section id="pending-requests" className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-semibold">待審核申請</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  只顯示尚未通過或退回的申請，通過後會自動進入下方名冊管理。
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                {pendingRequests.length} 筆待處理
              </span>
            </div>
            {pendingRequests.length === 0 ? (
              <div className="mt-4 rounded-md border border-dashed bg-background p-4 text-sm text-muted-foreground">
                目前沒有待審核申請。已通過的志工請到下方「已通過訪員名冊」管理與匯出。
              </div>
            ) : (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {pendingRequests.map((request) => {
              const isReviewing = reviewingRequestId === request.id;

              return (
              <article key={request.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">
                      {request.visitorRegistrationProfile?.displayName ?? request.fullName}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{request.email}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                    {registrationStatusLabels[request.status] ?? request.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>單位：{request.requestedUnitName}</p>
                  <p>工作空間：{request.requestedWorkspaceName}</p>
                  <p>
                    申請角色：
                    {workspaceRoles.find((role) => role.key === request.requestedRoleKey)?.label}
                  </p>
                  {request.visitorRegistrationProfile && (
                    <div className="grid gap-2 rounded-md bg-secondary/60 p-3 sm:grid-cols-2">
                      <p>
                        類別：
                        {workerGroupLabels[request.visitorRegistrationProfile.workerGroup]}
                      </p>
                      <p>職稱：{normalizedJobTitle(request.visitorRegistrationProfile)}</p>
                      <p>性別：{request.visitorRegistrationProfile.gender}</p>
                      <p>
                        教育訓練：
                        {request.visitorRegistrationProfile.trainingCompleted ? "已完成" : "未完成"}
                      </p>
                      <p>
                        訪員證：
                        {request.visitorRegistrationProfile.visitorCertificateNo ?? "待補"}
                      </p>
                      <p>
                        社會局覆核：
                        {reviewStatusLabels[
                          request.visitorRegistrationProfile.socialBureauReviewStatus
                        ]}
                      </p>
                    </div>
                  )}
                  {request.reviewNote && <p>{request.reviewNote}</p>}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button
                    disabled={!canReviewUsers || isReviewing}
                    onClick={() => review(request, "approve")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isReviewing ? "處理中" : "核准加入"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canReviewUsers || isReviewing}
                    onClick={() => review(request, "reject")}
                  >
                    <XCircle className="h-4 w-4" />
                    退回申請
                  </Button>
                </div>
                {!canReviewUsers && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    目前角色沒有審核註冊申請權限。
                  </p>
                )}
              </article>
            )})}
              </div>
            )}
          </section>

          <ApprovedVisitorRegistry
            requests={approvedRequests}
            onInvited={(invitation) => {
              setPayload((current) =>
                current
                  ? {
                      ...current,
                      registrationRequests: current.registrationRequests.map((request) =>
                        request.id === invitation.requestId && request.visitorRegistrationProfile
                          ? {
                              ...request,
                              visitorRegistrationProfile: {
                                ...request.visitorRegistrationProfile,
                                authInviteStatus: invitation.status,
                                authInvitedAt:
                                  invitation.status === "sent"
                                    ? new Date().toISOString()
                                    : request.visitorRegistrationProfile.authInvitedAt,
                              },
                            }
                          : request,
                      ),
                    }
                  : current,
              );
            }}
            onVerified={(requestId) => {
              setPayload((current) =>
                current
                  ? {
                      ...current,
                      registrationRequests: current.registrationRequests.map((request) =>
                        request.id === requestId && request.visitorRegistrationProfile
                          ? {
                              ...request,
                              visitorRegistrationProfile: {
                                ...request.visitorRegistrationProfile,
                                profileCompletionStatus: "verified",
                                profileReviewedAt: new Date().toISOString(),
                              },
                            }
                          : request,
                      ),
                    }
                  : current,
              );
            }}
          />

          <section className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-semibold">新增訪員註冊資料</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  少量補登或現場測試時使用；大量名冊仍建議走匯入與批次管理。
                </p>
              </div>
              <span className="w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium">補登入口</span>
            </div>
            <div className="mt-4">
              <VisitorRegistrationForm
                workspace={payload.workspace}
                onSubmitted={(request, message) => {
                  setPayload({
                    ...payload,
                    registrationRequests: [request, ...payload.registrationRequests],
                  });
                  setRegistrationMessage(message);
                }}
              />
            </div>
          </section>

          {registrationMessage && (
            <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="font-semibold text-primary">{registrationMessage}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                這筆資料會進入審核清單，通過後再轉成訪員資格檔與派案可用人員。
              </p>
            </section>
          )}

          <VisitorQualificationManager
            profiles={visitorProfiles}
            onChange={setVisitorProfiles}
            onSave={async () => {
              window.localStorage.setItem("visitor_qualification_profiles", JSON.stringify(visitorProfiles));
              const response = await fetch("/api/visitor-profiles", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ profiles: visitorProfiles }),
              });
              const json = (await response.json()) as {
                data?: VisitorProfile[];
                source?: "supabase" | "local_fallback";
                warning?: string;
              };
              setVisitorProfiles(json.data ?? visitorProfiles);
              setProfileMessage(
                json.source === "supabase"
                  ? "已寫入 Supabase visitor_profiles，派案會優先使用正式資格檔。"
                  : json.warning ?? "已暫存督導/訪員資格檔。",
              );
            }}
          />

          <section className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-semibold">註冊流程索引</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  這裡保留流程介紹，供訓練或交接時查閱；日常操作以頁面上方儀表板為主。
                </p>
              </div>
              <span className="w-fit rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                {payload.flow.length} 個步驟
              </span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-5">
              {payload.flow.map((step, index) => (
                <div key={step} className="rounded-md border bg-background p-3 text-sm">
                  <p className="text-xs font-semibold text-primary">步驟 {index + 1}</p>
                  <p className="mt-2 leading-6 text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {result && (
        <section className="rounded-lg border bg-card p-4">
          <p className="font-semibold">{result.message}</p>
          <p className="mt-1 text-sm text-muted-foreground">{result.nextStep}</p>
        </section>
      )}

      {profileMessage && (
        <section className="rounded-lg border bg-card p-4">
          <p className="font-semibold">{profileMessage}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            這些欄位會影響派案的里別、民政/社政、共訪、訪員證與匯款檢查。
          </p>
        </section>
      )}
    </div>
  );
}

const visitorDepartments = [
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

const visitorJobTitles = ["公所人員", "里長", "里幹事", "社工", "志工", "其他（鄰長）", "其他"];

const workerGroupLabels: Record<VisitorRegistrationWorkerGroup, string> = {
  civil_affairs: "民政訪查人員",
  social_affairs: "社政訪查人員",
};

const registrationStatusLabels: Record<string, string> = {
  draft: "草稿",
  email_verified: "已驗證信箱",
  pending_supervisor_review: "待承辦審核",
  pending_workspace_review: "待工作空間審核",
  pending_social_bureau_review: "待社會局覆核",
  approved: "已通過",
  rejected: "已退回",
};

const reviewStatusLabels: Record<string, string> = {
  not_sent: "未送審",
  pending: "待覆核",
  approved: "通過",
  rejected: "不通過",
};

const inviteStatusLabels: Record<string, string> = {
  not_sent: "尚未發送",
  sent: "已發送",
  activated: "已啟用",
  failed: "發送失敗",
};

const profileStatusLabels: Record<string, string> = {
  incomplete: "待補資料",
  submitted: "待管理者確認",
  verified: "已確認可派案",
  returned: "退回補件",
};

const remittanceStatusLabels: Record<string, string> = {
  pending: "待確認",
  approved: "已確認",
  rejected: "退回補件",
};

const visitorRegistryViewLabels: Record<VisitorRegistryView, string> = {
  all: "全部",
  needs_invite: "待發邀請",
  needs_profile: "待補/待確認",
  needs_remittance: "待匯款確認",
  assignable: "已可派案",
};

function ReviewMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function UserDashboardMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

function UserActionCard({
  title,
  detail,
  href,
  icon: Icon,
}: {
  title: string;
  detail: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <a href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
        前往處理
        <ArrowRight className="h-4 w-4" />
      </a>
    </article>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function ApprovedVisitorRegistry({
  requests,
  onInvited,
  onVerified,
}: {
  requests: UserRegistrationRequest[];
  onInvited: (result: VisitorInvitationResult) => void;
  onVerified: (requestId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [workerGroup, setWorkerGroup] = useState<"all" | VisitorRegistrationWorkerGroup>("all");
  const [activeView, setActiveView] = useState<VisitorRegistryView>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [invitingRequestId, setInvitingRequestId] = useState<string | null>(null);
  const [verifyingRequestId, setVerifyingRequestId] = useState<string | null>(null);
  const [batchAction, setBatchAction] = useState<"invite" | "verify" | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const baseFilteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      const profile = request.visitorRegistrationProfile;
      const matchesGroup = workerGroup === "all" || profile?.workerGroup === workerGroup;
      const searchText = [
        profile?.displayName,
        request.fullName,
        request.email,
        request.requestedUnitName,
        profile?.departmentName,
        profile?.jobTitle,
        profile?.phone,
        profile?.visitorCertificateNo,
        profile?.registrationCode,
        profile?.visitorCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesGroup && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [query, requests, workerGroup]);
  const viewCounts = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(visitorRegistryViewLabels) as VisitorRegistryView[]).map((view) => [
          view,
          baseFilteredRequests.filter((request) => matchesVisitorRegistryView(request, view)).length,
        ]),
      ) as Record<VisitorRegistryView, number>,
    [baseFilteredRequests],
  );
  const filteredRequests = useMemo(
    () => baseFilteredRequests.filter((request) => matchesVisitorRegistryView(request, activeView)),
    [activeView, baseFilteredRequests],
  );
  const selectedRequests = useMemo(
    () => filteredRequests.filter((request) => selectedIds.includes(request.id)),
    [filteredRequests, selectedIds],
  );
  const exportRequests = selectedRequests.length > 0 ? selectedRequests : filteredRequests;
  const visibleRequestIds = useMemo(() => filteredRequests.map((request) => request.id), [filteredRequests]);
  const allVisibleSelected =
    visibleRequestIds.length > 0 && visibleRequestIds.every((requestId) => selectedIds.includes(requestId));
  const photoReadyCount = filteredRequests.filter(
    (request) => request.visitorRegistrationProfile?.headshotProcessedUrl,
  ).length;
  const inviteSentCount = filteredRequests.filter(
    (request) => request.visitorRegistrationProfile?.authInviteStatus === "sent",
  ).length;
  const verifiedCount = filteredRequests.filter(
    (request) => request.visitorRegistrationProfile?.profileCompletionStatus === "verified",
  ).length;
  const remittanceReadyCount = filteredRequests.filter(
    (request) => request.visitorRegistrationProfile?.remittanceReady,
  ).length;

  useEffect(() => {
    setSelectedIds((current) => current.filter((requestId) => visibleRequestIds.includes(requestId)));
  }, [visibleRequestIds]);

  function toggleSelected(requestId: string) {
    setSelectedIds((current) =>
      current.includes(requestId)
        ? current.filter((selectedId) => selectedId !== requestId)
        : [...current, requestId],
    );
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((requestId) => !visibleRequestIds.includes(requestId));
      }

      return Array.from(new Set([...current, ...visibleRequestIds]));
    });
  }

  async function inviteVisitor(request: UserRegistrationRequest) {
    setInvitingRequestId(request.id);
    setInviteMessage(null);

    try {
      const result = await sendVisitorInvite(request);
      setInviteMessage(result);
    } finally {
      setInvitingRequestId(null);
    }
  }

  async function verifyVisitorProfile(request: UserRegistrationRequest) {
    setVerifyingRequestId(request.id);
    setInviteMessage(null);

    try {
      const result = await confirmVisitorProfile(request);
      setInviteMessage(result);
    } finally {
      setVerifyingRequestId(null);
    }
  }

  async function sendVisitorInvite(request: UserRegistrationRequest) {
    const response = await fetch("/api/users/invite-approved-visitor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ requestId: request.id }),
    });
    const json = (await response.json()) as {
      data?: VisitorInvitationResult;
      error?: { message?: string };
    };

    if (!response.ok || !json.data) {
      return json.error?.message ?? "登入邀請沒有完成，請稍後再試。";
    }

    onInvited(json.data);
    return `${json.data.message} ${json.data.nextStep}`;
  }

  async function confirmVisitorProfile(request: UserRegistrationRequest) {
    const response = await fetch("/api/users/verify-visitor-profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ requestId: request.id }),
      });
    const json = (await response.json()) as {
      data?: { message?: string; nextStep?: string };
      error?: { message?: string };
    };

    if (!response.ok || !json.data) {
      return json.error?.message ?? "確認可派案沒有完成，請稍後再試。";
    }

    onVerified(request.id);
    return `${json.data.message ?? "訪員資料已確認。"} ${json.data.nextStep ?? ""}`;
  }

  async function batchInviteVisitors() {
    const targets = (selectedRequests.length > 0 ? selectedRequests : filteredRequests).filter((request) => {
      const status = request.visitorRegistrationProfile?.authInviteStatus ?? "not_sent";
      return status !== "sent" && status !== "activated";
    });

    if (targets.length === 0) {
      setInviteMessage("目前範圍內沒有需要發送登入邀請的訪員。");
      return;
    }

    setBatchAction("invite");
    setInviteMessage(null);
    let successCount = 0;

    try {
      for (const request of targets) {
        const message = await sendVisitorInvite(request);
        if (!message.includes("失敗") && !message.includes("沒有完成")) {
          successCount += 1;
        }
      }
      setSelectedIds([]);
      setInviteMessage(`已批次送出 ${successCount}/${targets.length} 筆登入邀請。`);
    } finally {
      setBatchAction(null);
    }
  }

  async function batchVerifyVisitors() {
    const targets = (selectedRequests.length > 0 ? selectedRequests : filteredRequests).filter(
      (request) => request.visitorRegistrationProfile?.profileCompletionStatus !== "verified",
    );

    if (targets.length === 0) {
      setInviteMessage("目前範圍內沒有需要確認可派案的訪員。");
      return;
    }

    setBatchAction("verify");
    setInviteMessage(null);
    let successCount = 0;

    try {
      for (const request of targets) {
        const message = await confirmVisitorProfile(request);
        if (!message.includes("失敗") && !message.includes("沒有完成")) {
          successCount += 1;
        }
      }
      setSelectedIds([]);
      setInviteMessage(`已批次確認 ${successCount}/${targets.length} 筆訪員資料。`);
    } finally {
      setBatchAction(null);
    }
  }

  function exportRosterCsv() {
    const rows = exportRequests.map((request, index) => {
      const profile = request.visitorRegistrationProfile;
      return {
        序號: String(index + 1),
        註冊申請編號: profile?.registrationCode ?? "",
        訪員正式編碼: profile?.visitorCode ?? "",
        顯示名稱: profile?.displayName ?? request.fullName,
        姓名: request.fullName,
        信箱: request.email,
        公務信箱: profile?.officialEmail ?? "",
        手機: profile?.phone ?? "",
        單位: request.requestedUnitName,
        科室: profile?.departmentName ?? "",
        職稱: profile ? normalizedJobTitle(profile) : "",
        類別: profile ? workerGroupLabels[profile.workerGroup] : "",
        性別: profile?.gender ?? "",
        身分證字號: profile?.nationalId ?? "",
        教育訓練: profile?.trainingCompleted ? "已完成" : "未完成",
        教育訓練日期: profile?.trainingCompletedAt ?? "",
        訪員證號: profile?.visitorCertificateNo ?? "",
        照片狀態: profile?.headshotProcessedUrl ? "有照片" : "缺照片",
        登入邀請狀態: inviteStatusLabels[profile?.authInviteStatus ?? "not_sent"],
        資料補完狀態: profile?.profileCompletionStatus ?? "incomplete",
        匯款審核狀態: remittanceStatusLabels[profile?.remittanceReviewStatus ?? "pending"],
        銀行名稱: profile?.bankName ?? "",
        銀行代碼: profile?.bankCode ?? "",
        分行名稱: profile?.bankBranchName ?? "",
        戶名: profile?.bankAccountName ?? "",
        帳號末五碼: profile?.bankAccountLast5 ?? "",
        存摺附件: profile?.passbookCoverUrl ? "已上傳" : "未上傳",
        QRCode: profile?.qrCodePayload ?? "",
        審核通過時間: profile?.socialBureauReviewedAt ?? request.submittedAt,
      };
    });

    downloadTextFile(
      selectedRequests.length > 0 ? "已勾選訪員名冊.csv" : "已通過訪員名冊.csv",
      toCsv(rows),
      "text/csv;charset=utf-8",
    );
  }

  function exportPhotoManifestCsv() {
    const rows = exportRequests.map((request, index) => {
      const profile = request.visitorRegistrationProfile;
      const displayName = profile?.displayName ?? request.fullName;
      return {
        序號: String(index + 1),
        顯示名稱: displayName,
        建議照片檔名: `${sanitizeFilename(displayName)}.jpg`,
        照片資料: profile?.headshotProcessedUrl ?? "",
      };
    });

    downloadTextFile(
      selectedRequests.length > 0 ? "已勾選訪員照片索引.csv" : "已通過訪員照片索引.csv",
      toCsv(rows),
      "text/csv;charset=utf-8",
    );
  }

  function exportFullJson() {
    const rows = exportRequests.map((request, index) => ({
      index: index + 1,
      id: request.id,
      email: request.email,
      fullName: request.fullName,
      requestedUnitName: request.requestedUnitName,
      status: request.status,
      submittedAt: request.submittedAt,
      profile: request.visitorRegistrationProfile,
    }));

    downloadTextFile(
      selectedRequests.length > 0 ? "已勾選訪員完整資料含照片.json" : "已通過訪員完整資料含照片.json",
      JSON.stringify(rows, null, 2),
      "application/json;charset=utf-8",
    );
  }

  return (
    <section id="approved-visitors" className="rounded-lg border bg-card p-3 sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="font-semibold">已通過訪員名冊管理</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            審核通過後集中在這裡管理，適合 200 位以上志工用搜尋、篩選與匯出處理，不再用卡片連續排列。
          </p>
        </div>
        <div className="grid w-full gap-2 sm:grid-cols-3 xl:w-auto xl:min-w-[520px]">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={exportRosterCsv}
            disabled={exportRequests.length === 0}
          >
            <Download className="h-4 w-4" />
            {selectedRequests.length > 0 ? "匯出勾選名冊" : "匯出名冊 CSV"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={exportPhotoManifestCsv}
            disabled={exportRequests.length === 0}
          >
            <Download className="h-4 w-4" />
            匯出照片索引
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={exportFullJson}
            disabled={exportRequests.length === 0}
          >
            <Download className="h-4 w-4" />
            完整匯出含照片
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <ReviewMetric label="目前篩選筆數" value={filteredRequests.length} />
        <ReviewMetric label="已處理照片" value={photoReadyCount} />
        <ReviewMetric label="已發送邀請" value={inviteSentCount} />
        <ReviewMetric label="匯款可用" value={remittanceReadyCount} />
        <ReviewMetric label="可派案" value={verifiedCount} />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {(Object.keys(visitorRegistryViewLabels) as VisitorRegistryView[]).map((view) => (
          <button
            key={view}
            type="button"
            className={`rounded-md border px-3 py-3 text-left text-sm transition ${
              activeView === view
                ? "border-primary bg-primary/10 text-primary"
                : "bg-background text-muted-foreground hover:border-primary/40"
            }`}
            onClick={() => setActiveView(view)}
          >
            <span className="block font-semibold">{visitorRegistryViewLabels[view]}</span>
            <span className="mt-1 block text-xs">{viewCounts[view]} 筆</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border bg-background p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold">批次作業</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              已勾選 {selectedRequests.length} 筆；若未勾選，批次按鈕會套用目前分頁與搜尋結果。
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button type="button" variant="outline" onClick={toggleAllVisible} disabled={filteredRequests.length === 0}>
              {allVisibleSelected ? "取消本頁勾選" : "勾選目前清單"}
            </Button>
            <Button type="button" variant="outline" onClick={batchInviteVisitors} disabled={batchAction !== null}>
              <Mail className="h-4 w-4" />
              {batchAction === "invite" ? "發送中" : "批次發送邀請"}
            </Button>
            <Button type="button" onClick={batchVerifyVisitors} disabled={batchAction !== null}>
              <CheckCircle2 className="h-4 w-4" />
              {batchAction === "verify" ? "確認中" : "批次確認可派案"}
            </Button>
          </div>
        </div>
      </div>

      {inviteMessage && (
        <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          {inviteMessage}
        </div>
      )}

      <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋姓名、暱稱、信箱、科室、手機、訪員證號"
          />
        </label>
        <select
          className="h-11 rounded-md border bg-background px-3 text-sm"
          value={workerGroup}
          onChange={(event) => setWorkerGroup(event.target.value as "all" | VisitorRegistrationWorkerGroup)}
        >
          <option value="all">全部類別</option>
          <option value="civil_affairs">民政訪查人員</option>
          <option value="social_affairs">社政訪查人員</option>
        </select>
      </div>

      <div className="mt-4 grid gap-3 lg:hidden">
        {filteredRequests.map((request) => {
          const profile = request.visitorRegistrationProfile;
          const selected = selectedIds.includes(request.id);
          return (
            <article
              key={request.id}
              className={`rounded-lg border bg-background p-3 ${selected ? "border-primary bg-primary/5" : ""}`}
            >
              <label className="mb-3 flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selected}
                  onChange={() => toggleSelected(request.id)}
                />
                勾選批次處理
              </label>
              <div className="flex items-start gap-3">
                {profile?.headshotProcessedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.headshotProcessedUrl}
                    alt={`${request.fullName} 證件照`}
                    className="h-20 w-[3.75rem] rounded border object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-[3.75rem] items-center justify-center rounded border bg-card text-xs text-muted-foreground">
                    缺照片
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{request.fullName}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      已通過
                    </span>
                  </div>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    {profile?.displayName ?? request.fullName}
                  </p>
                  <p className="mt-2 text-sm">
                    {profile ? workerGroupLabels[profile.workerGroup] : "未分類"} ·{" "}
                    {profile?.departmentName ?? "未填科室"} ·{" "}
                    {profile ? normalizedJobTitle(profile) : "未填職稱"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    訪員編碼：{profile?.visitorCode ?? "審核後待產生"}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 rounded-md bg-secondary/50 p-3 text-sm sm:grid-cols-2">
                <p>手機：{profile?.phone ?? "未填"}</p>
                <p>訪員證：{profile?.visitorCertificateNo ?? "待補"}</p>
                <p>訓練：{profile?.trainingCompleted ? "已完成" : "未完成"}</p>
                <p>登入邀請：{inviteStatusLabels[profile?.authInviteStatus ?? "not_sent"]}</p>
                <p>資料確認：{profileStatusLabels[profile?.profileCompletionStatus ?? "incomplete"]}</p>
                <p>匯款審核：{remittanceStatusLabels[profile?.remittanceReviewStatus ?? "pending"]}</p>
                <p>存摺：{profile?.passbookCoverUrl ? "已上傳" : "未上傳"}</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={profile?.authInviteStatus === "sent" ? "outline" : "default"}
                  className="w-full"
                  disabled={invitingRequestId === request.id}
                  onClick={() => inviteVisitor(request)}
                >
                  {profile?.authInviteStatus === "sent" ? (
                    <RefreshCw className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {invitingRequestId === request.id
                    ? "發送中"
                    : profile?.authInviteStatus === "sent"
                      ? "重寄邀請"
                      : "發送邀請"}
                </Button>
                <Button
                  type="button"
                  variant={profile?.profileCompletionStatus === "verified" ? "outline" : "default"}
                  className="w-full"
                  disabled={verifyingRequestId === request.id}
                  onClick={() => verifyVisitorProfile(request)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {verifyingRequestId === request.id
                    ? "確認中"
                    : profile?.profileCompletionStatus === "verified"
                      ? "已可派案"
                      : "確認可派案"}
                </Button>
              </div>
              <p className="mt-2 break-all text-xs text-muted-foreground">
                {profile?.officialEmail ?? request.email}
              </p>
            </article>
          );
        })}
        {filteredRequests.length === 0 && (
          <div className="rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
            目前沒有符合條件的已通過訪員。
          </div>
        )}
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-lg border lg:block">
        <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr>
              <th className="w-12 px-3 py-3 font-medium">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  aria-label="勾選目前清單"
                />
              </th>
              <th className="px-3 py-3 font-medium">姓名 / 暱稱</th>
              <th className="px-3 py-3 font-medium">類別</th>
              <th className="px-3 py-3 font-medium">科室職稱</th>
              <th className="px-3 py-3 font-medium">聯絡方式</th>
              <th className="px-3 py-3 font-medium">訓練 / 證號</th>
              <th className="px-3 py-3 font-medium">匯款資料</th>
              <th className="px-3 py-3 font-medium">編碼 / 邀請</th>
              <th className="px-3 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => {
              const profile = request.visitorRegistrationProfile;
              const selected = selectedIds.includes(request.id);
              return (
                <tr key={request.id} className={`border-t align-top ${selected ? "bg-primary/5" : ""}`}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selected}
                      onChange={() => toggleSelected(request.id)}
                      aria-label={`勾選 ${request.fullName}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{request.fullName}</p>
                    <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
                      {profile?.displayName ?? request.fullName}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    {profile ? workerGroupLabels[profile.workerGroup] : "未分類"}
                  </td>
                  <td className="px-3 py-3">
                    <p>{profile?.departmentName ?? "未填"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile ? normalizedJobTitle(profile) : "未填"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p>{profile?.phone ?? "未填手機"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile?.officialEmail ?? request.email}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p>{profile?.trainingCompleted ? "已完成訓練" : "未完成訓練"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile?.visitorCertificateNo ?? "訪員證待補"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p>{remittanceStatusLabels[profile?.remittanceReviewStatus ?? "pending"]}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile?.bankName || profile?.bankCode
                        ? `${profile?.bankName ?? "未填銀行"} ${profile?.bankCode ?? ""}`.trim()
                        : "銀行待補"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profile?.bankAccountLast5 ? `末五碼 ${profile.bankAccountLast5}` : "帳號末五碼待補"} ·{" "}
                      {profile?.passbookCoverUrl ? "存摺已上傳" : "存摺待補"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p>{profile?.visitorCode ?? "待產生"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {inviteStatusLabels[profile?.authInviteStatus ?? "not_sent"]}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profileStatusLabels[profile?.profileCompletionStatus ?? "incomplete"]}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={profile?.authInviteStatus === "sent" ? "outline" : "default"}
                        disabled={invitingRequestId === request.id}
                        onClick={() => inviteVisitor(request)}
                      >
                        {profile?.authInviteStatus === "sent" ? (
                          <RefreshCw className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        {invitingRequestId === request.id
                          ? "發送中"
                          : profile?.authInviteStatus === "sent"
                            ? "重寄"
                            : "邀請"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={profile?.profileCompletionStatus === "verified" ? "outline" : "default"}
                        disabled={verifyingRequestId === request.id}
                        onClick={() => verifyVisitorProfile(request)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {verifyingRequestId === request.id
                          ? "確認中"
                          : profile?.profileCompletionStatus === "verified"
                            ? "可派案"
                            : "確認"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredRequests.length === 0 && (
          <div className="border-t bg-background p-4 text-sm text-muted-foreground">
            目前沒有符合條件的已通過訪員。
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        「完整匯出含照片」會把證件照以資料形式放入 JSON，適合備份或後續批次轉檔；CSV 名冊適合提供行政彙整。
      </p>
    </section>
  );
}

function matchesVisitorRegistryView(request: UserRegistrationRequest, view: VisitorRegistryView) {
  const profile = request.visitorRegistrationProfile;

  if (view === "all") return true;
  if (view === "needs_invite") {
    const inviteStatus = profile?.authInviteStatus ?? "not_sent";
    return inviteStatus !== "sent" && inviteStatus !== "activated";
  }
  if (view === "needs_profile") {
    return profile?.profileCompletionStatus !== "verified";
  }
  if (view === "needs_remittance") {
    return !profile?.remittanceReady || profile.remittanceReviewStatus !== "approved";
  }
  if (view === "assignable") {
    return profile?.profileCompletionStatus === "verified" && Boolean(profile.remittanceReady);
  }

  return true;
}

export function VisitorRegistrationForm({
  workspace,
  onSubmitted,
}: {
  workspace: Workspace;
  onSubmitted: (request: UserRegistrationRequest, message: string) => void;
}) {
  const initialForm: VisitorRegistrationSubmission = {
    fullName: "",
    email: "",
    requestedWorkspaceId: workspace.id,
    requestedWorkspaceName: workspace.name,
    rootUnitName: "永和區公所",
    departmentName: "民政課",
    departmentOther: null,
    jobTitle: "里幹事",
    jobTitleOther: null,
    gender: "女",
    nationalId: "",
    workerGroup: "civil_affairs",
    officialEmail: "",
    phone: "",
    trainingCompleted: false,
    trainingCompletedAt: null,
    visitorCertificateNo: null,
    headshotOriginalUrl: null,
    headshotProcessedUrl: null,
    note: null,
  };
  const [form, setForm] = useState<VisitorRegistrationSubmission>(initialForm);
  const [headshotProcessing, setHeadshotProcessing] = useState(false);
  const [headshotMessage, setHeadshotMessage] = useState<string | null>(null);
  const displayName = createVisitorDisplayName(form);
  const headshotInstruction = "請到牆壁白色的背景處拍攝，臉部看向鏡頭，保持光線明亮。";
  const canSubmit = Boolean(
    form.fullName.trim() &&
      form.email.trim() &&
      form.nationalId.trim() &&
      form.officialEmail.trim() &&
      form.phone.trim(),
  );

  function updateForm(patch: Partial<VisitorRegistrationSubmission>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;

    setHeadshotProcessing(true);
    setHeadshotMessage("正在產生白底一寸證件照...");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateForm({
        headshotOriginalUrl: dataUrl,
        headshotProcessedUrl: dataUrl,
      });

      const response = await fetch("/api/users/headshot-process", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const json = (await response.json()) as {
        data?: { processedDataUrl: string; note: string };
        error?: { message?: string };
      };

      if (response.ok && json.data?.processedDataUrl) {
        updateForm({
          headshotOriginalUrl: dataUrl,
          headshotProcessedUrl: json.data.processedDataUrl,
        });
        setHeadshotMessage("已完成伺服器端白底一寸證件照處理。");
        return;
      }

      const fallbackDataUrl = await createLocalHeadshotPreview(dataUrl);
      updateForm({
        headshotOriginalUrl: dataUrl,
        headshotProcessedUrl: fallbackDataUrl,
      });
      setHeadshotMessage(json.error?.message ?? "伺服器處理失敗，已改用本機白底裁切預覽。");
    } catch {
      setHeadshotMessage("照片處理失敗，請重新上傳較清楚的自拍照。");
    } finally {
      setHeadshotProcessing(false);
    }
  }

  function speakHeadshotInstruction() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setHeadshotMessage("此瀏覽器不支援語音播放，請依畫面文字提示拍攝。");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(headshotInstruction);
    utterance.lang = "zh-TW";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }

  async function submit() {
    const response = await fetch("/api/users/visitor-registration", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = (await response.json()) as { data?: VisitorRegistrationSubmissionResult };

    if (json.data?.request) {
      onSubmitted(
        json.data.request,
        json.data.source === "supabase"
          ? `${json.data.message}（已正式寫入 Supabase）`
          : `${json.data.message}（${json.data.warning ?? "目前為暫存資料"}）`,
      );
      setForm(initialForm);
    }
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <UserPlus className="mt-1 h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold">新訪員註冊</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            依「新北市訪查人員清冊」建立訪員資料，送出後由承辦管理者與社會局覆核。
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="姓名">
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.fullName}
              onChange={(event) => updateForm({ fullName: event.target.value })}
              placeholder="例：王小明"
            />
          </Field>
          <Field label="性別">
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.gender}
              onChange={(event) => updateForm({ gender: event.target.value as "男" | "女" | "其他" })}
            >
              <option value="女">女</option>
              <option value="男">男</option>
              <option value="其他">其他</option>
            </select>
          </Field>
          <Field label="身分證字號">
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.nationalId}
              onChange={(event) => updateForm({ nationalId: event.target.value.toUpperCase() })}
              placeholder="例：A123456789"
            />
          </Field>
          <Field label="民政 / 社政">
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.workerGroup}
              onChange={(event) =>
                updateForm({ workerGroup: event.target.value as VisitorRegistrationWorkerGroup })
              }
            >
              <option value="civil_affairs">民政</option>
              <option value="social_affairs">社政</option>
            </select>
          </Field>
          <Field label="單位">
            <input className="h-10 w-full rounded-md border bg-muted px-3 text-sm" value="永和區公所" readOnly />
          </Field>
          <Field label="科室 / 單位別">
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.departmentName}
              onChange={(event) =>
                updateForm({
                  departmentName: event.target.value,
                  departmentOther: event.target.value === "其他" ? form.departmentOther : null,
                })
              }
            >
              {visitorDepartments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </Field>
          {form.departmentName === "其他" && (
            <Field label="其他單位">
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.departmentOther ?? ""}
                onChange={(event) => updateForm({ departmentOther: event.target.value })}
                placeholder="請填寫單位"
              />
            </Field>
          )}
          <Field label="職稱">
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.jobTitle}
              onChange={(event) =>
                updateForm({
                  jobTitle: event.target.value,
                  jobTitleOther: event.target.value === "其他" ? form.jobTitleOther : null,
                })
              }
            >
              {visitorJobTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </Field>
          {form.jobTitle === "其他" && (
            <Field label="其他職稱">
              <input
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.jobTitleOther ?? ""}
                onChange={(event) => updateForm({ jobTitleOther: event.target.value })}
                placeholder="請填寫職稱"
              />
            </Field>
          )}
          <Field label="公務信箱">
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              type="email"
              value={form.officialEmail}
              onChange={(event) =>
                updateForm({
                  officialEmail: event.target.value,
                  email: event.target.value,
                })
              }
              placeholder="name@eldervisit.org"
            />
          </Field>
          <Field label="手機號碼">
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.phone}
              onChange={(event) => updateForm({ phone: event.target.value })}
              placeholder="例：0912-345-678"
            />
          </Field>
          <Field label="教育訓練">
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.trainingCompleted ? "yes" : "no"}
              onChange={(event) => updateForm({ trainingCompleted: event.target.value === "yes" })}
            >
              <option value="yes">已完成</option>
              <option value="no">未完成</option>
            </select>
          </Field>
          <Field label="教育訓練日期">
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              type="date"
              value={form.trainingCompletedAt ?? ""}
              onChange={(event) => updateForm({ trainingCompletedAt: event.target.value || null })}
            />
          </Field>
          <Field label="訪員證號">
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.visitorCertificateNo ?? ""}
              onChange={(event) => updateForm({ visitorCertificateNo: event.target.value || null })}
              placeholder="未核發可先留空"
            />
          </Field>
          <Field label="備註">
            <input
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.note ?? ""}
              onChange={(event) => updateForm({ note: event.target.value || null })}
              placeholder="例：可支援共訪、指定里別"
            />
          </Field>
        </div>

        <div className="grid gap-3">
          <div className="rounded-lg border bg-background p-3">
            <p className="text-sm font-semibold">自動暱稱</p>
            <p className="mt-2 break-all text-lg font-semibold text-primary">{displayName}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              格式固定為「單位-姓名-職稱」，後續登入、派案與審核紀錄都會使用同一個顯示名稱。
            </p>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">自拍證件照</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={speakHeadshotInstruction}>
                <Volume2 className="h-4 w-4" />
                語音提示
              </Button>
            </div>
            <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-semibold text-primary">拍攝前請先注意</p>
              <p className="mt-1 text-sm leading-6 text-foreground">{headshotInstruction}</p>
            </div>
            <div className="mt-3 rounded-md bg-white p-4">
              <div className="mx-auto aspect-[3/4] w-28 overflow-hidden rounded border bg-white">
                {form.headshotProcessedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.headshotProcessedUrl}
                    alt="訪員證件照預覽"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    尚未上傳
                  </div>
                )}
              </div>
            </div>
            <input
              className="mt-3 w-full rounded-md border bg-card px-3 py-2 text-sm"
              type="file"
              accept="image/*"
              capture="user"
              disabled={headshotProcessing}
              onChange={(event) => {
                void handlePhoto(event.target.files?.[0]);
              }}
            />
            {headshotMessage && (
              <p className="mt-2 rounded-md bg-secondary/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                {headshotMessage}
              </p>
            )}
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              已接入後端白底一寸比例裁切與壓縮。若要真正 AI 去背換底，下一步需設定外部影像 AI 服務金鑰。
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          必填：姓名、信箱、身分證字號、手機。未完成教育訓練者會停在承辦審核。
        </p>
        <Button type="button" disabled={!canSubmit} onClick={submit}>
          <Save className="h-4 w-4" />
          送出註冊
        </Button>
      </div>
    </section>
  );
}

function createVisitorDisplayName(
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Image file could not be read."));
    };
    reader.onerror = () => reject(new Error("Image file could not be read."));
    reader.readAsDataURL(file);
  });
}

function createLocalHeadshotPreview(dataUrl: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 400;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas is not available."));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const sourceRatio = image.width / image.height;
      const targetRatio = canvas.width / canvas.height;
      const sourceWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width;
      const sourceHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio;
      const sourceX = (image.width - sourceWidth) / 2;
      const sourceY = (image.height - sourceHeight) / 2;

      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = dataUrl;
  });
}

function toCsv(rows: Array<Record<string, string>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header] ?? "")).join(",")),
  ];

  return `\uFEFF${csvRows.join("\n")}`;
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_");
}

function normalizedJobTitle(request: { jobTitle: string; jobTitleOther: string | null }) {
  if (request.jobTitle === "其他") return request.jobTitleOther || "其他職稱";
  if (request.jobTitle === "其他（鄰長）") return "鄰長";
  return request.jobTitle;
}

const workerTypeLabels: Record<VisitorWorkerType, string> = {
  social_affairs: "社政訪查人員",
  civil_affairs: "民政訪查人員",
  general: "一般訪員/督導",
};

const moduleLabels: Record<WorkspaceModuleKey, string> = {
  case_import: "名冊匯入",
  assignment: "派案",
  visit_form: "訪查表",
  consent: "同意治理",
  audit: "稽核",
  payment: "核銷",
  export: "匯出",
  kpi: "KPI",
  notification: "通知",
};

function VisitorQualificationManager({
  profiles,
  onChange,
  onSave,
}: {
  profiles: VisitorProfile[];
  onChange: (profiles: VisitorProfile[]) => void;
  onSave: () => void | Promise<void>;
}) {
  function updateProfile(id: string, patch: Partial<VisitorProfile>) {
    onChange(profiles.map((profile) => (profile.id === id ? { ...profile, ...patch } : profile)));
  }

  function addProfile() {
    onChange([
      {
        id: `visitor_${Date.now()}`,
        fullName: "新訪員",
        workerType: "general",
        districtCoverage: ["北區"],
        villageCoverage: [],
        activeTaskCount: 0,
        maxDailyTasks: 6,
        trainedModules: ["visit_form"],
        visitorCertificateNo: null,
        certificateStatus: "missing",
        trainingDate: null,
        bankAccountLast5: null,
        remittanceReady: false,
        status: "available",
      },
      ...profiles,
    ]);
  }

  function removeProfile(id: string) {
    onChange(profiles.filter((profile) => profile.id !== id));
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">督導/訪員資格檔</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            維護民政/社政身分、服務里別、訪員證、受訓日期與匯款資料；這些欄位會進入派案與核銷前置檢查。
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={addProfile}>
            <Plus className="h-4 w-4" />
            新增資格檔
          </Button>
          <Button type="button" onClick={onSave}>
            <Save className="h-4 w-4" />
            暫存
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {profiles.map((profile) => (
          <article key={profile.id} className="rounded-lg border bg-background p-3">
            <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr_1fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="姓名">
                  <input
                    className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={profile.fullName}
                    onChange={(event) => updateProfile(profile.id, { fullName: event.target.value })}
                  />
                </Field>
                <Field label="身分">
                  <select
                    className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={profile.workerType}
                    onChange={(event) =>
                      updateProfile(profile.id, {
                        workerType: event.target.value as VisitorWorkerType,
                      })
                    }
                  >
                    {Object.entries(workerTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="服務行政區">
                  <input
                    className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={profile.districtCoverage.join("、")}
                    onChange={(event) =>
                      updateProfile(profile.id, {
                        districtCoverage: splitList(event.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="服務里別">
                  <input
                    className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={profile.villageCoverage.join("、")}
                    onChange={(event) =>
                      updateProfile(profile.id, {
                        villageCoverage: splitList(event.target.value),
                      })
                    }
                    placeholder="例：錦村里、賴厝里"
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="訪員證號">
                  <input
                    className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={profile.visitorCertificateNo ?? ""}
                    onChange={(event) =>
                      updateProfile(profile.id, {
                        visitorCertificateNo: event.target.value || null,
                      })
                    }
                  />
                </Field>
                <Field label="證件狀態">
                  <select
                    className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={profile.certificateStatus}
                    onChange={(event) =>
                      updateProfile(profile.id, {
                        certificateStatus: event.target.value as VisitorProfile["certificateStatus"],
                      })
                    }
                  >
                    <option value="valid">有效</option>
                    <option value="missing">待補</option>
                    <option value="expired">逾期</option>
                  </select>
                </Field>
                <Field label="受訓日期">
                  <input
                    className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                    type="date"
                    value={profile.trainingDate ?? ""}
                    onChange={(event) =>
                      updateProfile(profile.id, {
                        trainingDate: event.target.value || null,
                      })
                    }
                  />
                </Field>
                <Field label="帳戶末五碼">
                  <input
                    className="h-10 w-full rounded-md border bg-card px-3 text-sm"
                    maxLength={5}
                    value={profile.bankAccountLast5 ?? ""}
                    onChange={(event) =>
                      updateProfile(profile.id, {
                        bankAccountLast5: event.target.value || null,
                        remittanceReady: event.target.value.length === 5,
                      })
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-3">
                <Field label="訓練模組">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(["visit_form", "consent", "audit", "payment"] as WorkspaceModuleKey[]).map((module) => {
                      const selected = profile.trainedModules.includes(module);
                      return (
                        <button
                          key={`${profile.id}-${module}`}
                          type="button"
                          className={`rounded-md border px-2 py-2 text-xs font-medium ${
                            selected ? "bg-primary text-primary-foreground" : "bg-card"
                          }`}
                          onClick={() =>
                            updateProfile(profile.id, {
                              trainedModules: selected
                                ? profile.trainedModules.filter((item) => item !== module)
                                : [...profile.trainedModules, module],
                            })
                          }
                        >
                          {moduleLabels[module]}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <p className="rounded-md bg-secondary p-3 text-sm text-muted-foreground">
                    派案狀態：
                    {profile.certificateStatus === "valid" && profile.remittanceReady
                      ? "可納入自動建議"
                      : "需主管覆核"}
                  </p>
                  <Button type="button" variant="outline" onClick={() => removeProfile(profile.id)}>
                    <Trash2 className="h-4 w-4" />
                    刪除
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

function splitList(value: string) {
  return value
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
