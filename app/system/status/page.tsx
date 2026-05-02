import { AppShell } from "@/components/layout/app-shell";
import { SystemStatusPanel } from "@/components/system/system-status-panel";

export default function SystemStatusPage() {
  return (
    <AppShell active="system">
      <SystemStatusPanel />
    </AppShell>
  );
}
