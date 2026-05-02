import { AppShell } from "@/components/layout/app-shell";
import { SettingsPanel } from "@/components/workspace/settings-panel";

export default function WorkspaceSettingsPage() {
  return (
    <AppShell active="workspace">
      <SettingsPanel />
    </AppShell>
  );
}
