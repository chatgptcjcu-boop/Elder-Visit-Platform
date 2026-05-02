"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { AIConfidenceCard } from "@/components/onboarding/ai-confidence-card";
import { Button } from "@/components/ui/button";
import {
  defaultOnboardingDraft,
  getBlueprintById,
  getNextOnboardingStep,
  type OnboardingDraft,
  type OnboardingStepKey,
} from "@/lib/domain/onboarding";
import { blueprints } from "@/lib/domain/mock-data";

const storageKey = "elder-visit-platform:onboarding-draft";

export function OnboardingForm({ step }: { step: OnboardingStepKey }) {
  const [draft, setDraft] = useState<OnboardingDraft>(defaultOnboardingDraft);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);
  const nextStep = getNextOnboardingStep(step);
  const selectedBlueprint = useMemo(
    () => getBlueprintById(draft.workspace.blueprintId),
    [draft.workspace.blueprintId],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setDraft(JSON.parse(stored) as OnboardingDraft);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    }
  }, [draft, isLoaded]);

  async function publishWorkspace() {
    setIsPublishing(true);
    setPublishResult(null);

    const response = await fetch("/api/onboarding/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    const result = (await response.json()) as { data?: { createdResources?: string[] } };

    setPublishResult(`已建立 ${result.data?.createdResources?.length ?? 0} 個治理資源`);
    setIsPublishing(false);
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      {step === "account" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="姓名"
            value={draft.account.fullName}
            onChange={(fullName) =>
              setDraft((current) => ({ ...current, account: { ...current.account, fullName } }))
            }
          />
          <TextField
            label="Email"
            value={draft.account.email}
            onChange={(email) =>
              setDraft((current) => ({ ...current, account: { ...current.account, email } }))
            }
          />
          <SelectField
            label="使用者身分"
            value={draft.account.persona}
            options={[
              ["unit_admin", "單位管理者"],
              ["visitor", "訪員"],
              ["course_student", "課程學員"],
            ]}
            onChange={(persona) =>
              setDraft((current) => ({
                ...current,
                account: { ...current.account, persona: persona as OnboardingDraft["account"]["persona"] },
              }))
            }
          />
        </div>
      )}

      {step === "unit" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="單位名稱"
            value={draft.unit.unitName}
            onChange={(unitName) =>
              setDraft((current) => ({ ...current, unit: { ...current.unit, unitName } }))
            }
          />
          <SelectField
            label="單位類型"
            value={draft.unit.unitType}
            options={[
              ["government", "政府 / 公所"],
              ["ngo", "協會"],
              ["temple", "宮廟"],
              ["foundation", "基金會"],
              ["company", "企業"],
            ]}
            onChange={(unitType) =>
              setDraft((current) => ({
                ...current,
                unit: { ...current.unit, unitType: unitType as OnboardingDraft["unit"]["unitType"] },
              }))
            }
          />
          <TextField
            label="縣市"
            value={draft.unit.city}
            onChange={(city) =>
              setDraft((current) => ({ ...current, unit: { ...current.unit, city } }))
            }
          />
          <TextField
            label="行政區"
            value={draft.unit.district}
            onChange={(district) =>
              setDraft((current) => ({ ...current, unit: { ...current.unit, district } }))
            }
          />
        </div>
      )}

      {step === "workspace" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="工作空間名稱"
            value={draft.workspace.workspaceName}
            onChange={(workspaceName) =>
              setDraft((current) => ({
                ...current,
                workspace: { ...current.workspace, workspaceName },
              }))
            }
          />
          <SelectField
            label="藍圖"
            value={draft.workspace.blueprintId}
            options={blueprints.map((blueprint) => [blueprint.id, blueprint.name])}
            onChange={(blueprintId) =>
              setDraft((current) => ({
                ...current,
                workspace: {
                  ...current.workspace,
                  blueprintId,
                  workspaceType: getBlueprintById(blueprintId).type,
                },
              }))
            }
          />
          <TextField
            label="責任人"
            value={draft.workspace.responsiblePerson}
            onChange={(responsiblePerson) =>
              setDraft((current) => ({
                ...current,
                workspace: { ...current.workspace, responsiblePerson },
              }))
            }
          />
          <TextField
            label="責任單位 / 法定代表"
            value={draft.workspace.legalOwnerName}
            onChange={(legalOwnerName) =>
              setDraft((current) => ({
                ...current,
                workspace: { ...current.workspace, legalOwnerName },
              }))
            }
          />
        </div>
      )}

      {(step === "preview" || step === "publish") && (
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border bg-background p-3">
            <p className="text-sm font-semibold">發佈預覽</p>
            <div className="mt-3 space-y-2 text-sm">
              <SummaryRow label="帳號" value={`${draft.account.fullName} · ${draft.account.email}`} />
              <SummaryRow label="單位" value={`${draft.unit.unitName} · ${draft.unit.city}${draft.unit.district}`} />
              <SummaryRow label="工作空間" value={draft.workspace.workspaceName} />
              <SummaryRow label="藍圖" value={`${selectedBlueprint.name} v${selectedBlueprint.version}`} />
              <SummaryRow label="責任人" value={draft.workspace.responsiblePerson} />
            </div>
          </div>
          <AIConfidenceCard />
        </div>
      )}

      {step === "workspace" && (
        <div className="mt-4 rounded-lg border bg-background p-3">
          <p className="text-sm font-semibold">藍圖版本綁定</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            發佈後會鎖定 {selectedBlueprint.name} v{selectedBlueprint.version}，後續藍圖更新不會直接覆寫此工作空間。
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {publishResult && (
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {publishResult}
          </p>
        )}
        {step === "publish" ? (
          <Button onClick={publishWorkspace} disabled={isPublishing}>
            {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
            發佈工作空間
          </Button>
        ) : (
          <Button asChild>
            <Link href={nextStep?.href ?? "/dashboard"}>
              下一步
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b pb-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
