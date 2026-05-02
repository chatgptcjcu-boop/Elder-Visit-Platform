"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, UserPlus, XCircle } from "lucide-react";
import { useCan } from "@/components/auth/permission-provider";
import { Button } from "@/components/ui/button";
import { workspaceRoles } from "@/lib/domain/permissions";
import type {
  UserRegistrationDecisionResult,
  UserRegistrationRequest,
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

  useEffect(() => {
    async function loadUsers() {
      const response = await fetch("/api/users");
      const json = (await response.json()) as { data?: UsersPayload };
      setPayload(json.data ?? null);
    }

    void loadUsers();
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
        </>
      )}

      {result && (
        <section className="rounded-lg border bg-card p-4">
          <p className="font-semibold">{result.message}</p>
          <p className="mt-1 text-sm text-muted-foreground">{result.nextStep}</p>
        </section>
      )}
    </div>
  );
}
