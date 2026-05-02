import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function PublishOnboardingPage() {
  return (
    <OnboardingShell
      step="publish"
      title="發佈工作空間"
      description="發佈後建立預設成員、設定、表單、流程、規則與權限快取。"
    />
  );
}
