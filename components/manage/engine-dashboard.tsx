import { BarChart3, FileOutput, FormInput, GitBranch } from "lucide-react";
import { exportTemplates, formTemplates, kpiTemplates, workflowTemplates } from "@/lib/domain/engines";

export function EngineDashboard() {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium text-primary">Parameter Engines</p>
        <h1 className="mt-2 text-2xl font-semibold">參數化引擎管理</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          表單、流程、匯出與 KPI 不寫死在程式碼，後續會由 Workspace 模板與版本控制。
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <EngineSection
          icon={FormInput}
          title="表單模板"
          subtitle="支援版本與欄位型別"
          items={formTemplates.map((template) => ({
            title: `${template.name} v${template.version}`,
            detail: `${template.fields.length} 個欄位 · ${template.entityType}`,
            rows: template.fields.map((field) => `${field.label} · ${field.type}${field.required ? " · 必填" : ""}`),
          }))}
        />
        <EngineSection
          icon={GitBranch}
          title="流程模板"
          subtitle="狀態與角色轉換規則"
          items={workflowTemplates.map((workflow) => ({
            title: workflow.name,
            detail: `${workflow.steps.length} 個狀態 · ${workflow.entityType}`,
            rows: workflow.transitions.map((transition) => `${transition.from} → ${transition.to}`),
          }))}
        />
        <EngineSection
          icon={FileOutput}
          title="匯出模板"
          subtitle="CSV / XLSX / PDF 欄位設定"
          items={exportTemplates.map((template) => ({
            title: template.name,
            detail: `${template.exportType.toUpperCase()} · ${template.entityType}`,
            rows: template.columns.map((column) => `${column.label} ← ${column.sourcePath}`),
          }))}
        />
        <EngineSection
          icon={BarChart3}
          title="KPI 模板"
          subtitle="可設定指標與目標值"
          items={kpiTemplates.map((template) => ({
            title: template.name,
            detail: `${template.items.length} 個指標`,
            rows: template.items.map(
              (item) => `${item.label}: ${item.currentValue}${item.unit} / ${item.targetValue}${item.unit}`,
            ),
          }))}
        />
      </section>
    </div>
  );
}

function EngineSection({
  icon: Icon,
  title,
  subtitle,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  items: Array<{ title: string; detail: string; rows: string[] }>;
}) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-secondary p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-md border bg-background p-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.rows.map((row) => (
                <span key={row} className="rounded-md bg-secondary px-2 py-1 text-xs">
                  {row}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
