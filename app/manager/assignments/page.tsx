import { AppShell } from "@/components/layout/app-shell";
import { AssignmentDashboard } from "@/components/manage/assignment-dashboard";

export default function AssignmentsPage() {
  return (
    <AppShell active="assignments">
      <AssignmentDashboard />
    </AppShell>
  );
}
