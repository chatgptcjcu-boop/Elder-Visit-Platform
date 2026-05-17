import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { AuditQueueCard } from "@/components/audit/audit-queue-card";
import { ManagementWorkflowBar } from "@/components/manage/management-workflow-bar";
import { auditQueue } from "@/lib/domain/audit-data";
import { getRoleByKey } from "@/lib/domain/permissions";
import type { WorkspaceRoleKey } from "@/lib/domain/types";

export default async function AuditPage() {
  const cookieStore = await cookies();
  const roleKey = (cookieStore.get("demo_role")?.value ?? "workspace_manager") as WorkspaceRoleKey;
  const role = getRoleByKey(roleKey);

  return (
    <AppShell active="audit">
      <section className="rounded-lg border bg-card p-4">
        <h1 className="text-2xl font-semibold">稽核佇列</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          阻擋項目未通過不得核准；提醒項目可由主管覆核後放行。
        </p>
      </section>
      <ManagementWorkflowBar active="audit" />

      <section className="grid gap-3 lg:grid-cols-2">
        {auditQueue.map((item) => (
          <AuditQueueCard key={item.id} item={item} capabilities={role.capabilities} />
        ))}
      </section>
    </AppShell>
  );
}
