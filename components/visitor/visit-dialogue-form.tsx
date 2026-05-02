"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, Loader2, MapPin, PenLine, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ElderCase, VisitSchedule, VisitSubmission } from "@/lib/domain/types";
import { visitQuestions } from "@/lib/domain/mock-data";
import { createVisitDraft, getVisitDraftKey, type VisitDraft } from "@/lib/domain/offline-drafts";
import { getVisitRequiredForms } from "@/lib/domain/visit-form-flow";
import { getPaymentEligibility, validateVisitSubmission } from "@/lib/domain/visits";

const initialSubmission: Omit<VisitSubmission, "scheduleId"> = {
  visitResult: "訪視成功",
  healthStatus: "穩定",
  livingStatus: "可自理",
  consentSigned: true,
  consentScope: ["internal_use", "government_report", "anonymous_kpi"],
  signatureDataUrl: "",
  gpsLat: null,
  gpsLng: null,
  photoNames: [],
  notes: "",
};

export function VisitDialogueForm({
  elderCase,
  schedule,
}: {
  elderCase: ElderCase;
  schedule: VisitSchedule;
}) {
  const [submission, setSubmission] = useState(initialSubmission);
  const [draftState, setDraftState] = useState<"idle" | "restored" | "saved">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "captured" | "unavailable">("idle");
  const draftKey = getVisitDraftKey(schedule.id);
  const validation = useMemo(
    () => validateVisitSubmission({ scheduleId: schedule.id, ...submission }),
    [schedule.id, submission],
  );
  const paymentEligibility = useMemo(
    () => getPaymentEligibility({ scheduleId: schedule.id, ...submission }),
    [schedule.id, submission],
  );
  const requiredForms = useMemo(() => getVisitRequiredForms(schedule), [schedule]);

  useEffect(() => {
    const stored = window.localStorage.getItem(draftKey);

    if (stored) {
      const draft = JSON.parse(stored) as VisitDraft;
      setSubmission({
        visitResult: draft.visitResult,
        healthStatus: draft.healthStatus,
        livingStatus: draft.livingStatus,
        consentSigned: draft.consentSigned,
        consentScope: draft.consentScope,
        signatureDataUrl: draft.signatureDataUrl,
        gpsLat: draft.gpsLat,
        gpsLng: draft.gpsLng,
        photoNames: draft.photoNames,
        notes: draft.notes,
      });
      setDraftState("restored");
    }
  }, [draftKey]);

  useEffect(() => {
    const draft = createVisitDraft(submission);
    window.localStorage.setItem(draftKey, JSON.stringify(draft));
    setDraftState("saved");
  }, [draftKey, submission]);

  async function submitVisit() {
    setIsSubmitting(true);
    setResult(null);

    const response = await fetch("/api/visits/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scheduleId: schedule.id, ...submission }),
    });
    const data = (await response.json()) as { data?: { nextStep?: string } };

    setResult(data.data?.nextStep ?? "已送出");
    window.localStorage.removeItem(draftKey);
    setIsSubmitting(false);
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }

    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSubmission((current) => ({
          ...current,
          gpsLat: position.coords.latitude,
          gpsLng: position.coords.longitude,
        }));
        setGeoStatus("captured");
      },
      () => setGeoStatus("unavailable"),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }

  function addVisitPhotos(category: string, files: FileList | null) {
    const photoFiles = Array.from(files ?? []);
    if (photoFiles.length === 0) {
      return;
    }

    captureLocation();
    const photoNames = photoFiles.map((file) => `${category}：${file.name}`);
    setSubmission((current) => ({
      ...current,
      photoNames: [...current.photoNames, ...photoNames],
    }));
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <div>
        <p className="text-sm font-medium text-primary">對話式填報流程</p>
        <h1 className="mt-2 text-2xl font-semibold">{elderCase.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {elderCase.caseCode} · 第 {schedule.visitAttempt} 次訪視
        </p>
        {draftState !== "idle" && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-secondary px-2 py-1 text-xs font-medium">
            <Save className="h-3.5 w-3.5" />
            {draftState === "restored" ? "已恢復離線草稿" : "草稿已自動保存"}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-4">
        <section className="rounded-lg border bg-background p-3">
          <h2 className="text-sm font-semibold">本次訪視內建表單</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            系統會依派案帶入四份表單，訪員完成後送督導與稽核覆核。
          </p>
          <div className="mt-3 grid gap-2 lg:grid-cols-4">
            {requiredForms.map((form) => (
              <div key={form.templateId} className="rounded-md border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{form.name}</p>
                  <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-xs">
                    {form.statusLabel}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{form.usage}</p>
                <p className="mt-2 text-xs font-medium text-primary">
                  {form.stageLabel} · {form.owner}
                </p>
              </div>
            ))}
          </div>
        </section>

        {visitQuestions.map((question) => (
          <div key={question.key} className="flex gap-3">
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold">
              問
            </div>
            <div className="flex-1 rounded-lg border bg-background p-3">
              <label className="text-sm font-medium">
                {question.label}
                {question.required && <span className="text-destructive"> *</span>}
              </label>
              <QuestionInput
                questionKey={question.key}
                type={question.type}
                options={question.options}
                value={getQuestionValue(submission, question.key)}
                onChange={(value) =>
                  setSubmission((current) => ({
                    ...current,
                    [question.key]: value,
                  }))
                }
              />
            </div>
          </div>
        ))}
      </div>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border bg-background p-3">
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">縣市政府版本個人資料蒐集聲明暨同意書</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            訪視開始時先取得長者本人、蓋章或手印同意；此項未完成會進入督導覆核，且不可直接核銷。
          </p>
          <SignaturePad
            value={submission.signatureDataUrl}
            onChange={(signatureDataUrl) =>
              setSubmission((current) => ({ ...current, signatureDataUrl }))
            }
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {["internal_use", "government_report", "anonymous_kpi", "research_use"].map((scope) => {
              const selected = submission.consentScope.includes(scope);
              return (
                <button
                  key={scope}
                  type="button"
                  className={`rounded-md border px-2 py-1 text-xs ${
                    selected ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                  onClick={() =>
                    setSubmission((current) => ({
                      ...current,
                      consentScope: selected
                        ? current.consentScope.filter((item) => item !== scope)
                        : [...current.consentScope, scope],
                    }))
                  }
                >
                  {scope}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-background p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">拍照上傳與自動定位</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            請依情境拍照或上傳照片。選擇照片時系統會自動取得目前定位，不需要另外按定位按鈕。
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {photoCategories.map((category) => (
              <label
                key={category}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <Camera className="h-4 w-4" />
                拍照 / 上傳{category}
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={(event) => addVisitPhotos(category, event.target.files)}
                />
              </label>
            ))}
          </div>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>
              定位：
              {submission.gpsLat && submission.gpsLng
                ? `${submission.gpsLat.toFixed(5)}, ${submission.gpsLng.toFixed(5)}`
                : geoStatus === "locating"
                  ? "取得中..."
                  : geoStatus === "unavailable"
                    ? "尚未取得，請確認瀏覽器定位權限"
                    : "拍照或上傳後自動取得"}
            </p>
            <p>照片：{submission.photoNames.length > 0 ? submission.photoNames.join("、") : "尚未加入"}</p>
          </div>
        </div>
      </section>

      <div className="mt-5 rounded-lg border bg-background p-3 text-sm">
        <p className="font-semibold">督導與稽核前置判斷</p>
        <p className="mt-1 text-muted-foreground">{paymentEligibility.reason}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p className="rounded-md bg-card p-2 text-muted-foreground">
            生活關懷表：送出後由督導確認特殊風險題項。
          </p>
          <p className="rounded-md bg-card p-2 text-muted-foreground">
            保密同意書：由承辦或督導於派案前確認。
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {!validation.ok && (
          <p className="text-sm text-destructive">尚缺：{validation.missing.join("、")}</p>
        )}
        {result && (
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {result}
          </p>
        )}
        <Button onClick={submitVisit} disabled={!validation.ok || isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          送出訪查紀錄
        </Button>
      </div>
    </section>
  );
}

const photoCategories = ["門口", "本人", "環境", "其他"];

function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [signature, setSignature] = useState(value);

  useEffect(() => {
    setSignature(value);
  }, [value]);

  return (
    <div className="mt-3">
      <input
        className="h-24 w-full rounded-md border bg-card px-3 text-center text-lg outline-none focus:ring-2 focus:ring-ring"
        value={signature}
        onChange={(event) => {
          setSignature(event.target.value);
          onChange(event.target.value);
        }}
        placeholder="請輸入簽名或簽名代碼"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        目前以文字簽名代替手寫 canvas；正式版可替換成簽名板。
      </p>
    </div>
  );
}

function getQuestionValue(
  submission: Omit<VisitSubmission, "scheduleId">,
  questionKey: string,
): string | boolean {
  if (questionKey === "consentSigned") {
    return submission.consentSigned;
  }
  if (questionKey === "healthStatus") {
    return submission.healthStatus;
  }
  if (questionKey === "livingStatus") {
    return submission.livingStatus;
  }
  if (questionKey === "notes") {
    return submission.notes;
  }

  return submission.visitResult;
}

function QuestionInput({
  questionKey,
  type,
  options,
  value,
  onChange,
}: {
  questionKey: string;
  type: "select" | "textarea" | "boolean";
  options?: string[];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  if (type === "textarea") {
    return (
      <textarea
        className="mt-2 min-h-24 w-full rounded-md border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        placeholder="輸入補充紀錄"
      />
    );
  }

  if (type === "boolean") {
    return (
      <div className="mt-3 flex gap-2">
        {[true, false].map((option) => (
          <button
            key={`${questionKey}-${String(option)}`}
            type="button"
            className={`h-10 rounded-md border px-4 text-sm font-medium ${
              value === option ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
            onClick={() => onChange(option)}
          >
            {option ? "是" : "否"}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      className="mt-2 h-10 w-full rounded-md border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      value={String(value)}
      onChange={(event) => onChange(event.target.value)}
    >
      {options?.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
