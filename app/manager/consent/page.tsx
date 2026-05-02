import { AppShell } from "@/components/layout/app-shell";
import { ConsentDashboard } from "@/components/manage/consent-dashboard";

export default function ConsentPage() {
  return (
    <AppShell active="consent">
      <ConsentDashboard />
    </AppShell>
  );
}
