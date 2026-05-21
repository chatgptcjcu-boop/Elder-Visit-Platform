import { AppShell } from "@/components/layout/app-shell";
import { VisitorWorkflowBar } from "@/components/visitor/visitor-workflow-bar";
import { VisitorProfilePanel } from "@/components/visitor/visitor-profile-panel";

export default function VisitorProfilePage() {
  return (
    <AppShell active="profile">
      <VisitorWorkflowBar active="profile" />
      <VisitorProfilePanel />
    </AppShell>
  );
}
