import Link from "next/link";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AIConfidenceCard } from "@/components/onboarding/ai-confidence-card";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { blueprints } from "@/lib/domain/mock-data";
import { onboardingSteps, type OnboardingStepKey } from "@/lib/domain/onboarding";
import { cn } from "@/lib/utils";

export function OnboardingShell({
  step,
  title,
  description,
}: {
  step: OnboardingStepKey;
  title: string;
  description: string;
}) {
  const currentIndex = onboardingSteps.findIndex((item) => item.key === step);

  return (
    <AppShell active="workspace">
      <section className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium text-primary">Onboarding Wizard</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        <div className="mt-5 grid grid-cols-5 gap-2">
          {onboardingSteps.map((item, index) => {
            const isDone = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex h-12 min-w-0 items-center justify-center rounded-md border text-xs font-medium",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isDone && "bg-secondary text-secondary-foreground",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SetupField label="角色" value="單位管理者" />
          <SetupField label="第一市場" value="獨居長者訪查" />
          <SetupField label="Blueprint" value="版本鎖定，需 migration preview 才能升級" />
          <SetupField label="AI 建議" value="僅提供建議，不直接建立配置" />
        </div>

        {(step === "workspace" || step === "preview" || step === "publish") && (
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-sm font-semibold">可用 Blueprint</p>
              <div className="mt-3 space-y-3">
                {blueprints.map((blueprint) => (
                  <div key={blueprint.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{blueprint.name}</p>
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                        v{blueprint.version}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {blueprint.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <AIConfidenceCard />
          </div>
        )}

      </section>

      <OnboardingForm step={step} />
    </AppShell>
  );
}

function SetupField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium leading-6">{value}</p>
    </div>
  );
}
