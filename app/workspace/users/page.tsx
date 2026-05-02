import { AppShell } from "@/components/layout/app-shell";
import { UsersPanel } from "@/components/workspace/users-panel";

export default function WorkspaceUsersPage() {
  return (
    <AppShell active="users">
      <UsersPanel />
    </AppShell>
  );
}
