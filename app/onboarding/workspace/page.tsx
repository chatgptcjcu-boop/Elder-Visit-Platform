import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function WorkspaceOnboardingPage() {
  return (
    <OnboardingShell
      step="workspace"
      title="建立工作空間"
      description="Workspace 承接具體專案，所有業務資料都會綁定 unit_id 與 workspace_id。"
    />
  );
}
