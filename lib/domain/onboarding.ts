import { blueprints } from "@/lib/domain/mock-data";

export const onboardingSteps = [
  { key: "account", label: "個人", href: "/onboarding/account" },
  { key: "unit", label: "單位", href: "/onboarding/unit" },
  { key: "workspace", label: "空間", href: "/onboarding/workspace" },
  { key: "preview", label: "預覽", href: "/onboarding/preview" },
  { key: "publish", label: "發佈", href: "/onboarding/publish" },
] as const;

export type OnboardingStepKey = (typeof onboardingSteps)[number]["key"];

export type OnboardingDraft = {
  account: {
    fullName: string;
    email: string;
    persona: "unit_admin" | "visitor" | "course_student";
  };
  unit: {
    unitName: string;
    unitType: "government" | "ngo" | "temple" | "foundation" | "company";
    city: string;
    district: string;
  };
  workspace: {
    workspaceName: string;
    workspaceType: "elder_visit" | "temple_governance" | "volunteer_governance" | "esg_sponsorship";
    blueprintId: string;
    responsiblePerson: string;
    legalOwnerName: string;
  };
};

export const defaultOnboardingDraft: OnboardingDraft = {
  account: {
    fullName: "示範承辦人",
    email: "manager@eldervisit.org",
    persona: "unit_admin",
  },
  unit: {
    unitName: "示範公所",
    unitType: "government",
    city: "臺中市",
    district: "北區",
  },
  workspace: {
    workspaceName: "115 年獨居長者訪查",
    workspaceType: "elder_visit",
    blueprintId: blueprints[0].id,
    responsiblePerson: "社會課承辦人",
    legalOwnerName: "示範公所",
  },
};

export function getNextOnboardingStep(step: OnboardingStepKey) {
  const currentIndex = onboardingSteps.findIndex((item) => item.key === step);
  return onboardingSteps[currentIndex + 1];
}

export function getBlueprintById(blueprintId: string) {
  return blueprints.find((blueprint) => blueprint.id === blueprintId) ?? blueprints[0];
}
