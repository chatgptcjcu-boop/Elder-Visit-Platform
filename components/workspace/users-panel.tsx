"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Camera, CheckCircle2, IdCard, Plus, Save, Trash2, UserPlus, XCircle } from "lucide-react";
import { useCan } from "@/components/auth/permission-provider";
import { Button } from "@/components/ui/button";
import { workspaceRoles } from "@/lib/domain/permissions";
import { visitors as defaultVisitors } from "@/lib/domain/assignments";
import type {
  UserRegistrationDecisionResult,
  UserRegistrationRequest,
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

export function UsersPanel() {
  const canReviewUsers = useCan("users.review");
  const [payload, setPayload] = useState<UsersPayload | null>(null);
  const [result, setResult] = useState<UserRegistrationDecisionResult | null>(null);
  const [visitorProfiles, setVisitorProfiles] = useState<VisitorProfile[]>(defaultVisitors);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);

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
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">使用者管理與註冊審核</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          使用者註冊後必須關聯 Unit 與 Workspace，審核通過才會取得角色與權限。
        </p>
      </section>

      {payload && (
        <>
          <section className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">啟動流程</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-5">
              {payload.flow.map((step, index) => (
                <div key={step} className="rounded-md border bg-background p-3 text-sm">
                  <p className="text-xs font-semibold text-primary">步驟 {index + 1}</p>
                  <p className="mt-2 text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </section>

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

          {registrationMessage && (
            <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="font-semibold text-primary">{registrationMessage}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                這筆資料會進入下方審核清單，通過後再轉成訪員資格檔與派案可用人員。
              </p>
            </section>
          )}

          <section className="rounded-lg border bg-card p-4">
            <h2 className="font-semibold">訪員註冊審核</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              依公所清冊欄位檢查民政/社政身分、職稱、公務信箱、教育訓練與社會局覆核狀態。
            </p>
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            {payload.registrationRequests.map((request) => {
              const isReviewed = request.status === "approved" || request.status === "rejected";
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
                {isReviewed ? (
                  <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm font-medium text-primary">
                    {request.status === "approved" ? "已通過，訪員資格已建立。" : "已退回，未建立訪員資格。"}
                  </div>
                ) : (
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
                )}
                {!canReviewUsers && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    目前角色沒有審核註冊申請權限。
                  </p>
                )}
              </article>
            )})}
          </section>

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
  const displayName = createVisitorDisplayName(form);
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

  function handlePhoto(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) return;

      updateForm({
        headshotOriginalUrl: dataUrl,
        headshotProcessedUrl: dataUrl,
      });

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 400;
        const context = canvas.getContext("2d");
        if (!context) return;

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

        updateForm({
          headshotOriginalUrl: dataUrl,
          headshotProcessedUrl: canvas.toDataURL("image/jpeg", 0.9),
        });
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
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
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">自拍證件照</p>
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
              onChange={(event) => handlePhoto(event.target.files?.[0])}
            />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              目前已完成手機拍照、上傳與白底一寸比例裁切預覽；真正 AI 去背換底尚未接入影像服務。
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
