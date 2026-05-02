import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { getLimitSummary } from "@/lib/domain/limits";
import { getRepository } from "@/lib/repositories";

export default async function WorkspaceSelectPage() {
  const workspaces = await getRepository().getWorkspaces();

  return (
    <AppShell active="workspace">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-primary">工作空間選擇</p>
        <h1 className="mt-2 text-2xl font-semibold">選擇工作空間</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          登入後依單位、工作空間、角色與操作權限決定可使用的功能。
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {workspaces.map((workspace) => (
          <article key={workspace.name} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{workspace.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {workspace.unit?.unitName ?? "未指定單位"}
                </p>
              </div>
              <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                {workspace.status}
              </span>
            </div>
            <p className="mt-4 text-sm">{workspace.blueprint.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {getLimitSummary(workspace.planLimits).message}
            </p>
            <Button className="mt-4 w-full">進入</Button>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
