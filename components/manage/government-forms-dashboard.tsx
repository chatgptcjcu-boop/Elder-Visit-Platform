"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  ClipboardCheck,
  FilePlus2,
  FileText,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/ui/page-intro";
import {
  governmentFormTemplates,
  governmentFormWorkflow,
  type GovernmentFormField,
  type GovernmentFormKind,
  type GovernmentFormSection,
  type GovernmentFormTemplate,
} from "@/lib/domain/government-forms";

const kindLabels: Record<GovernmentFormTemplate["kind"], string> = {
  care_visit: "生活關懷表",
  personal_data_consent: "個資同意書",
  social_worker_confidentiality: "社政保密同意書",
  civil_affairs_confidentiality: "民政保密同意書",
  custom: "自訂表單",
};

const fieldTypeOptions: Array<{ value: GovernmentFormField["type"]; label: string }> = [
  { value: "text", label: "文字" },
  { value: "date", label: "日期" },
  { value: "single_choice", label: "單選" },
  { value: "multi_choice", label: "複選" },
  { value: "number", label: "數字" },
  { value: "signature", label: "簽名" },
  { value: "address", label: "地址" },
];

const emptyTemplate: GovernmentFormTemplate = {
  id: "draft_form",
  name: "新增表單",
  kind: "custom",
  ownerAgency: "自訂主管機關",
  version: "草稿版",
  sourceFile: "手動建立",
  useTiming: "請設定此表單在派案、訪視、督導或稽核流程中的使用時機。",
  retentionNote: "請設定保存治理與個資處理原則。",
  sections: [
    {
      title: "基本資料",
      purpose: "新增表單後可依需要調整區段與欄位。",
      fields: [],
    },
  ],
};

const emptyField: GovernmentFormField = {
  key: "",
  label: "",
  type: "text",
  required: false,
  sensitive: false,
  options: [],
};

export function GovernmentFormsDashboard() {
  const [templates, setTemplates] = useState<GovernmentFormTemplate[]>(governmentFormTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(governmentFormTemplates[0].id);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [selectedTemplateId, templates],
  );
  const [templateDraft, setTemplateDraft] = useState<GovernmentFormTemplate>(selectedTemplate);
  const [sectionTitle, setSectionTitle] = useState(selectedTemplate.sections[0]?.title ?? "");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [fieldDraft, setFieldDraft] = useState<GovernmentFormField>(emptyField);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [aiSourceFile, setAiSourceFile] = useState("");
  const [aiPrompt, setAiPrompt] = useState(
    "請貼上 PDF 表單欄位文字，例如：姓名、電話、地址、簽名、簽署日期、是否同意。",
  );

  const totalFields = selectedTemplate.sections.reduce(
    (sum, section) => sum + section.fields.length,
    0,
  );
  const sensitiveFields = selectedTemplate.sections.reduce(
    (sum, section) => sum + section.fields.filter((field) => field.sensitive).length,
    0,
  );
  const requiredFields = selectedTemplate.sections.reduce(
    (sum, section) => sum + section.fields.filter((field) => field.required).length,
    0,
  );

  function selectTemplate(template: GovernmentFormTemplate) {
    setSelectedTemplateId(template.id);
    setTemplateDraft(template);
    setSectionTitle(template.sections[0]?.title ?? "");
    setFieldDraft(emptyField);
    setEditingFieldKey(null);
  }

  function saveTemplateDraft() {
    setTemplates((current) =>
      current.map((template) => (template.id === selectedTemplate.id ? templateDraft : template)),
    );
    setSelectedTemplateId(templateDraft.id);
  }

  function createTemplate() {
    const nextTemplate = {
      ...emptyTemplate,
      id: `custom_form_${Date.now()}`,
      name: `自訂表單 ${templates.length + 1}`,
    };
    setTemplates((current) => [...current, nextTemplate]);
    selectTemplate(nextTemplate);
  }

  function createAiDraft() {
    const lines = aiPrompt
      .split(/[\n,，、]/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 30);
    const fields = lines.map((line, index) => createFieldFromAiText(line, index));
    const nextTemplate: GovernmentFormTemplate = {
      ...emptyTemplate,
      id: `ai_form_${Date.now()}`,
      name: aiSourceFile ? `${aiSourceFile.replace(/\.pdf$/i, "")} 匯入草稿` : "AI 匯入表單草稿",
      sourceFile: aiSourceFile || "AI 匯入 PDF",
      useTiming: "AI 先產生欄位草稿，管理者確認後可納入派案、訪視、督導或稽核流程模板。",
      sections: [
        {
          title: "AI 擷取欄位",
          purpose: "由 PDF 欄位文字產生，需由管理者確認欄位型態、必填與敏感資料標記。",
          fields: fields.length > 0 ? fields : [createFieldFromAiText("姓名", 0)],
        },
      ],
    };
    setTemplates((current) => [...current, nextTemplate]);
    selectTemplate(nextTemplate);
  }

  function addSection() {
    if (!newSectionTitle.trim()) {
      return;
    }
    const nextSection: GovernmentFormSection = {
      title: newSectionTitle.trim(),
      purpose: "請補充此區段用途。",
      fields: [],
    };
    const nextTemplate = {
      ...templateDraft,
      sections: [...templateDraft.sections, nextSection],
    };
    setTemplateDraft(nextTemplate);
    setNewSectionTitle("");
    setSectionTitle(nextSection.title);
  }

  function saveField() {
    const normalizedField: GovernmentFormField = {
      ...fieldDraft,
      key: fieldDraft.key || createFieldKey(fieldDraft.label),
      label: fieldDraft.label || "未命名欄位",
      options: normalizeOptions(fieldDraft.options),
    };
    const nextTemplate = {
      ...templateDraft,
      sections: templateDraft.sections.map((section) => {
        if (section.title !== sectionTitle) {
          return section;
        }
        const fields = editingFieldKey
          ? section.fields.map((field) => (field.key === editingFieldKey ? normalizedField : field))
          : [...section.fields, normalizedField];
        return { ...section, fields };
      }),
    };
    setTemplateDraft(nextTemplate);
    setFieldDraft(emptyField);
    setEditingFieldKey(null);
  }

  function editField(field: GovernmentFormField) {
    setFieldDraft(field);
    setEditingFieldKey(field.key);
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        icon={TableProperties}
        title="表單建檔管理"
        description="管理政府表單、自訂表單、欄位與流程模板。PDF 匯入會先成為草稿，確認後再放入派案、訪視、督導與稽核流程。"
        aside={
          <Button onClick={createTemplate}>
            <FilePlus2 className="h-4 w-4" />
            新增表單
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.15fr)]">
        <article className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">AI 匯入表單 PDF</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            先產生可編修草稿，人工確認欄位、必填、敏感資料與流程使用點後，才納入正式流程模板。
          </p>
          <div className="mt-4 grid gap-3">
            <label className="text-sm font-medium">
              PDF 檔案
              <input
                className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
                type="file"
                accept="application/pdf"
                onChange={(event) => setAiSourceFile(event.target.files?.[0]?.name ?? "")}
              />
            </label>
            <label className="text-sm font-medium">
              AI 欄位分析文字
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
              />
            </label>
            <Button onClick={createAiDraft}>
              <Bot className="h-4 w-4" />
              產生可編修表單草稿
            </Button>
          </div>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">加入流程模板建議</h2>
          </div>
          <div className="mt-4 grid gap-2">
            {governmentFormWorkflow.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-md border bg-background p-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="leading-6 text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className={`rounded-lg border p-3 text-left transition-colors ${
              selectedTemplate.id === template.id ? "border-primary bg-primary/5" : "bg-card"
            }`}
            onClick={() => selectTemplate(template)}
          >
            <p className="text-xs font-medium text-primary">{kindLabels[template.kind]}</p>
            <p className="mt-2 text-sm font-semibold">{template.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{template.version}</p>
          </button>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
        <article className="rounded-lg border bg-card p-4">
          <h2 className="text-base font-semibold">{selectedTemplate.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {selectedTemplate.useTiming}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="欄位數" value={`${totalFields}`} />
            <Stat label="必填欄位" value={`${requiredFields}`} />
            <Stat label="敏感欄位" value={`${sensitiveFields}`} />
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            <InfoRow label="主管機關" value={selectedTemplate.ownerAgency} />
            <InfoRow label="來源檔案" value={selectedTemplate.sourceFile} />
            <InfoRow label="保存治理" value={selectedTemplate.retentionNote} />
          </div>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold">表單基本資料</h2>
            <Button className="w-full sm:w-auto" onClick={saveTemplateDraft}>
              <Save className="h-4 w-4" />
              儲存修改
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <TextInput label="表單名稱" value={templateDraft.name} onChange={(name) => setTemplateDraft((current) => ({ ...current, name }))} />
            <label className="text-sm font-medium">
              表單類型
              <select
                className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={templateDraft.kind}
                onChange={(event) =>
                  setTemplateDraft((current) => ({
                    ...current,
                    kind: event.target.value as GovernmentFormKind,
                  }))
                }
              >
                {Object.entries(kindLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <TextInput label="版本" value={templateDraft.version} onChange={(version) => setTemplateDraft((current) => ({ ...current, version }))} />
            <TextInput label="來源檔案" value={templateDraft.sourceFile} onChange={(sourceFile) => setTemplateDraft((current) => ({ ...current, sourceFile }))} />
            <TextInput label="主管機關" value={templateDraft.ownerAgency} onChange={(ownerAgency) => setTemplateDraft((current) => ({ ...current, ownerAgency }))} />
            <TextInput label="使用時機" value={templateDraft.useTiming} onChange={(useTiming) => setTemplateDraft((current) => ({ ...current, useTiming }))} />
          </div>
        </article>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="text-sm font-medium lg:w-72">
            編輯區段
            <select
              className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={sectionTitle}
              onChange={(event) => setSectionTitle(event.target.value)}
            >
              {templateDraft.sections.map((section) => (
                <option key={section.title} value={section.title}>
                  {section.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium lg:flex-1">
            新增區段
            <input
              className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={newSectionTitle}
              onChange={(event) => setNewSectionTitle(event.target.value)}
              placeholder="例如：受訪者基本資料"
            />
          </label>
          <Button className="w-full lg:w-auto" onClick={addSection}>
            <Plus className="h-4 w-4" />
            新增區段
          </Button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border bg-background p-3">
            <h3 className="text-sm font-semibold">欄位編輯</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <TextInput label="欄位名稱" value={fieldDraft.label} onChange={(label) => setFieldDraft((current) => ({ ...current, label }))} />
              <TextInput label="欄位 key" value={fieldDraft.key} onChange={(key) => setFieldDraft((current) => ({ ...current, key }))} />
              <label className="text-sm font-medium">
                欄位型態
                <select
                  className="mt-2 h-10 w-full rounded-md border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={fieldDraft.type}
                  onChange={(event) =>
                    setFieldDraft((current) => ({
                      ...current,
                      type: event.target.value as GovernmentFormField["type"],
                    }))
                  }
                >
                  {fieldTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <TextInput
                label="選項，以逗號分隔"
                value={(fieldDraft.options ?? []).join("、")}
                onChange={(value) =>
                  setFieldDraft((current) => ({
                    ...current,
                    options: value.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
                  }))
                }
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={fieldDraft.required}
                  onChange={(event) =>
                    setFieldDraft((current) => ({ ...current, required: event.target.checked }))
                  }
                />
                必填
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={fieldDraft.sensitive}
                  onChange={(event) =>
                    setFieldDraft((current) => ({ ...current, sensitive: event.target.checked }))
                  }
                />
                敏感資料
              </label>
            </div>
            <Button className="mt-4 w-full sm:w-auto" onClick={saveField}>
              {editingFieldKey ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingFieldKey ? "儲存欄位修改" : "新增欄位"}
            </Button>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <h3 className="text-sm font-semibold">流程納入方式</h3>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <p>1. 表單先建立為草稿，確認欄位與敏感資料標記。</p>
              <p>2. 指定使用時機：派案前、訪視開始、訪視填報、督導覆核或稽核完成。</p>
              <p>3. 儲存後加入流程模板，派案與訪視頁即可帶入需要的表單。</p>
              <p>4. 正式版會把版本鎖定到工作空間，避免舊案被新表單覆寫。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {templateDraft.sections.map((section) => (
          <article key={section.title} className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">{section.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.purpose}</p>
              </div>
              <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                {section.fields.length} 欄
              </span>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {section.fields.map((field) => (
                <div key={field.key} className="rounded-md border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{field.label}</p>
                    <span className="rounded-md bg-secondary px-2 py-1 text-[11px]">
                      {getFieldTypeLabel(field.type)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {field.required && <Badge label="必填" />}
                    {field.sensitive && <Badge label="敏感資料" icon="shield" />}
                    {field.options && field.options.length > 0 && <Badge label={`${field.options.length} 個選項`} />}
                  </div>
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSectionTitle(section.title);
                      editField(field);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    修改欄位
                  </Button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium leading-6">{value}</p>
    </div>
  );
}

function Badge({ label, icon }: { label: string; icon?: "shield" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[11px]">
      {icon === "shield" ? <ShieldCheck className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
      {label}
    </span>
  );
}

function getFieldTypeLabel(type: GovernmentFormField["type"]) {
  const labels = {
    text: "文字",
    date: "日期",
    single_choice: "單選",
    multi_choice: "複選",
    number: "數字",
    signature: "簽名",
    address: "地址",
  };
  return labels[type];
}

function createFieldKey(label: string) {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/[^\da-z\u4e00-\u9fa5]+/g, "_")
      .replace(/^_+|_+$/g, "") || `field_${Date.now()}`
  );
}

function normalizeOptions(options?: string[]) {
  const normalized = (options ?? []).map((option) => option.trim()).filter(Boolean);
  return normalized.length > 0 ? normalized : undefined;
}

function createFieldFromAiText(text: string, index: number): GovernmentFormField {
  const type: GovernmentFormField["type"] =
    text.includes("日期") || text.includes("年月日")
      ? "date"
      : text.includes("簽名") || text.includes("手印")
        ? "signature"
        : text.includes("是否") || text.includes("同意")
          ? "single_choice"
          : text.includes("地址")
            ? "address"
            : "text";
  return {
    key: `${createFieldKey(text)}_${index + 1}`,
    label: text,
    type,
    required: index < 3 || text.includes("簽名") || text.includes("同意"),
    sensitive: /姓名|電話|地址|身分|健康|簽名|同意/.test(text),
    options: type === "single_choice" ? ["是", "否"] : undefined,
  };
}
