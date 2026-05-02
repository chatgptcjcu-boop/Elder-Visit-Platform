import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { SitemapPanel } from "@/components/system/sitemap-panel";
import { getRoleByKey } from "@/lib/domain/permissions";
import type { WorkspaceRoleKey } from "@/lib/domain/types";

export default async function SitemapPage() {
  const cookieStore = await cookies();
  const roleKey = (cookieStore.get("demo_role")?.value ?? "workspace_manager") as WorkspaceRoleKey;
  const role = getRoleByKey(roleKey);

  return (
    <AppShell active="sitemap">
      <SitemapPanel role={role} />
    </AppShell>
  );
}
