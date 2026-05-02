import { AppShell } from "@/components/layout/app-shell";
import { GovernmentFormsDashboard } from "@/components/manage/government-forms-dashboard";

export default function FormsPage() {
  return (
    <AppShell active="forms">
      <GovernmentFormsDashboard />
    </AppShell>
  );
}
