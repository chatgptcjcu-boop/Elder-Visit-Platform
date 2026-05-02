import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function PreviewOnboardingPage() {
  return (
    <OnboardingShell
      step="preview"
      title="預覽 Blueprint 設定"
      description="Blueprint 版本會被鎖定，未來更新不會直接覆寫既有 Workspace。"
    />
  );
}
