import { AppShell } from "@/components/layout/app-shell";
import { PermissionsPanel } from "@/components/workspace/permissions-panel";

export default function WorkspacePermissionsPage() {
  return (
    <AppShell active="permissions">
      <PermissionsPanel />
    </AppShell>
  );
}
