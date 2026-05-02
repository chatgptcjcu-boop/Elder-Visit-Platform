import { AppShell } from "@/components/layout/app-shell";
import { EngineDashboard } from "@/components/manage/engine-dashboard";

export default function EnginesPage() {
  return (
    <AppShell active="engines">
      <EngineDashboard />
    </AppShell>
  );
}
