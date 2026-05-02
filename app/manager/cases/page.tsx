import { AppShell } from "@/components/layout/app-shell";
import { CaseRegistryDashboard } from "@/components/manage/case-registry-dashboard";

export default function CasesPage() {
  return (
    <AppShell active="cases">
      <CaseRegistryDashboard />
    </AppShell>
  );
}
