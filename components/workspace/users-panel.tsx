"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, IdCard, Plus, Save, Trash2, UserPlus, XCircle } from "lucide-react";
import { useCan } from "@/components/auth/permission-provider";
import { Button } from "@/components/ui/button";
import { workspaceRoles } from "@/lib/domain/permissions";
import { visitors as defaultVisitors } from "@/lib/domain/assignments";
import type {
  UserRegistrationDecisionResult,
  UserRegistrationRequest,
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

  useEffect(() => {
    async function loadUsers() {
      const response = await fetch("/api/users");
      const json = (await response.json()) as { data?: UsersPayload };
      setPayload(json.data ?? null);
    }

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
    const json = (await response.json()) as { data?: UserRegistrationDecisionResult };
    setResult(json.data ?? null);
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

          <section className="grid gap-3 lg:grid-cols-2">
            {payload.registrationRequests.map((request) => (
              <article key={request.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{request.fullName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{request.email}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    {request.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>單位：{request.requestedUnitName}</p>
                  <p>工作空間：{request.requestedWorkspaceName}</p>
                  <p>
                    申請角色：
                    {workspaceRoles.find((role) => role.key === request.requestedRoleKey)?.label}
                  </p>
                  {request.reviewNote && <p>{request.reviewNote}</p>}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button disabled={!canReviewUsers} onClick={() => review(request, "approve")}>
                    <CheckCircle2 className="h-4 w-4" />
                    核准加入
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canReviewUsers}
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
            ))}
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
