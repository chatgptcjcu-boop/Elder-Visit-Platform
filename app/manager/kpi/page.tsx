import { AppShell } from "@/components/layout/app-shell";
import { KpiDashboard } from "@/components/manage/kpi-dashboard";

export default function KpiPage() {
  return (
    <AppShell active="kpi">
      <KpiDashboard />
    </AppShell>
  );
}
