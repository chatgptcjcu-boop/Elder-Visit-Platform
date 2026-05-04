"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, FileText, Loader2, MapPin, PenLine, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ElderCase, VisitSchedule, VisitSubmission } from "@/lib/domain/types";
import { visitQuestions } from "@/lib/domain/mock-data";
import { createVisitDraft, getVisitDraftKey, type VisitDraft } from "@/lib/domain/offline-drafts";
import { getVisitRequiredForms } from "@/lib/domain/visit-form-flow";
import {
  calculateCareFormCompletion,
  createInitialCareFormAnswers,
  newTaipeiCareFormSections,
  newTaipeiCareFormSampleAnswers,
  type CareFormAnswers,
  type CareFormAnswerValue,
} from "@/lib/domain/new-taipei-care-form";
import type { GovernmentFormField } from "@/lib/domain/government-forms";
import {
  getMissedVisitPolicy,
  getPaymentEligibility,
  validateVisitSubmission,
} from "@/lib/domain/visits";

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
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "captured" | "unavailable">("idle");
  const [careFormAnswers, setCareFormAnswers] = useState<CareFormAnswers>(() => ({
    ...createInitialCareFormAnswers(),
    name: elderCase.name,
    phone: elderCase.phone,
    household_address: elderCase.address,
    living_address: elderCase.address,
  }));
  const draftKey = getVisitDraftKey(schedule.id);
  const careFormDraftKey = `${draftKey}:new_taipei_care_form`;
  const validation = useMemo(
    () => validateVisitSubmission({ scheduleId: schedule.id, ...submission }),
    [schedule.id, submission],
  );
  const paymentEligibility = useMemo(
    () => getPaymentEligibility({ scheduleId: schedule.id, ...submission }),
    [schedule.id, submission],
  );
  const missedVisitPolicy = useMemo(
    () => getMissedVisitPolicy(schedule, { scheduleId: schedule.id, ...submission }),
    [schedule, submission],
  );
  const requiredForms = useMemo(() => getVisitRequiredForms(schedule), [schedule]);
  const careFormCompletion = useMemo(
    () => calculateCareFormCompletion(careFormAnswers),
    [careFormAnswers],
  );

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

    const storedCareForm = window.localStorage.getItem(careFormDraftKey);
    if (storedCareForm) {
      setCareFormAnswers(JSON.parse(storedCareForm) as CareFormAnswers);
    } else if (schedule.id === "schedule_ntpc_demo") {
      setCareFormAnswers(newTaipeiCareFormSampleAnswers);
    }
  }, [careFormDraftKey, draftKey, schedule.id]);

  useEffect(() => {
    const draft = createVisitDraft(submission);
    window.localStorage.setItem(draftKey, JSON.stringify(draft));
    window.localStorage.setItem(careFormDraftKey, JSON.stringify(careFormAnswers));
    setDraftState("saved");
  }, [careFormAnswers, careFormDraftKey, draftKey, submission]);

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
    window.localStorage.removeItem(careFormDraftKey);
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

  async function exportCareForm(format: "word" | "pdf") {
    const response = await fetch("/api/exports/care-form", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        format,
        elderName: elderCase.name,
        caseCode: elderCase.caseCode,
        answers: careFormAnswers,
      }),
    });
    const data = (await response.json()) as {
      data?: { filename: string; content: string; note: string };
    };
    setExportResult(
      data.data
        ? `${data.data.filename}\n${data.data.note}\n\n${data.data.content}`
        : "匯出失敗，請稍後再試。",
    );
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <div>
        <p className="text-sm font-medium text-primary">對話式填報流程</p>
        <h1 className="mt-2 text-2xl font-semibold">{elderCase.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {elderCase.caseCode} · {elderCase.district} · {elderCase.village} · 第{" "}
          {schedule.visitAttempt} 次訪視
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
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">新北市政府獨居老人生活關懷表</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                依新北空白表分段填寫，系統會即時計算必填欄位完成度，完成後可送督導並進入 Word / PDF 匯出。
              </p>
            </div>
            <div className="rounded-md border bg-card px-3 py-2 text-sm">
              <p className="font-semibold">完成度 {careFormCompletion.percent}%</p>
              <p className="mt-1 text-muted-foreground">
                必填 {careFormCompletion.completed}/{careFormCompletion.required}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${careFormCompletion.percent}%` }}
            />
          </div>
          {careFormCompletion.missingLabels.length > 0 && (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
              尚缺必填：{careFormCompletion.missingLabels.join("、")}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={careFormCompletion.percent < 100}
              onClick={() => void exportCareForm("word")}
            >
              匯出 Word 套版
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={careFormCompletion.percent < 100}
              onClick={() => void exportCareForm("pdf")}
            >
              匯出 PDF 預覽
            </Button>
          </div>
          {exportResult && (
            <textarea
              className="mt-3 min-h-40 w-full rounded-md border bg-card p-3 font-mono text-xs"
              readOnly
              value={exportResult}
            />
          )}

          <div className="mt-4 grid gap-3">
            {newTaipeiCareFormSections.map((section) => {
              const sectionCompletion = careFormCompletion.sections.find(
                (item) => item.title === section.title,
              );
              return (
                <details key={section.title} className="rounded-lg border bg-card" open={section.title.startsWith("一、")}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    <span>{section.title}</span>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
                      {sectionCompletion?.completed ?? 0}/{sectionCompletion?.required ?? 0}
                    </span>
                  </summary>
                  <div className="grid gap-3 border-t p-3 md:grid-cols-2 xl:grid-cols-3">
                    {section.fields.map((field) => (
                      <CareFormInput
                        key={field.key}
                        field={field}
                        value={careFormAnswers[field.key]}
                        onChange={(value) =>
                          setCareFormAnswers((current) => ({ ...current, [field.key]: value }))
                        }
                      />
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </section>

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
        {missedVisitPolicy.applies && (
          <div
            className={`mt-3 rounded-md border p-3 ${
              missedVisitPolicy.canClose
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="font-medium">未遇三次流程</p>
            <p className="mt-1">{missedVisitPolicy.message}</p>
          </div>
        )}
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
        {careFormCompletion.percent < 100 && (
          <p className="text-sm text-destructive">
            新北關懷表尚缺必填：{careFormCompletion.missingLabels.join("、")}
          </p>
        )}
        {result && (
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <CheckCircle2 className="h-4 w-4" />
            {result}
          </p>
        )}
        <Button onClick={submitVisit} disabled={!validation.ok || careFormCompletion.percent < 100 || isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          送出訪查紀錄
        </Button>
      </div>
    </section>
  );
}

const photoCategories = ["門口", "本人", "環境", "其他"];

function CareFormInput({
  field,
  value,
  onChange,
}: {
  field: GovernmentFormField;
  value: CareFormAnswerValue | undefined;
  onChange: (value: CareFormAnswerValue) => void;
}) {
  const requiredMark = field.required ? <span className="text-destructive"> *</span> : null;

  if (field.type === "multi_choice") {
    const selectedValues = Array.isArray(value) ? value : [];
    return (
      <div className="rounded-md border bg-background p-3">
        <p className="text-sm font-medium">
          {field.label}
          {requiredMark}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const selected = selectedValues.includes(option);
            return (
              <button
                key={`${field.key}-${option}`}
                type="button"
                className={`rounded-md border px-2 py-1 text-xs ${
                  selected ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
                onClick={() =>
                  onChange(
                    selected
                      ? selectedValues.filter((item) => item !== option)
                      : [...selectedValues, option],
                  )
                }
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "single_choice") {
    return (
      <label className="grid gap-1 text-sm font-medium">
        {field.label}
        {requiredMark}
        <select
          className="h-10 rounded-md border bg-card px-3 text-sm"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">請選擇</option>
          {field.options?.map((option) => (
            <option key={`${field.key}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="grid gap-1 text-sm font-medium">
      {field.label}
      {requiredMark}
      <input
        className="h-10 rounded-md border bg-card px-3 text-sm"
        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

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
