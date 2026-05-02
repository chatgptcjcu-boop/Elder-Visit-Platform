import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

export default function AccountOnboardingPage() {
  return (
    <OnboardingShell
      step="account"
      title="建立個人帳號"
      description="個人帳號只代表登入者本人，正式資料責任會由 Unit 承接。"
    />
  );
}
