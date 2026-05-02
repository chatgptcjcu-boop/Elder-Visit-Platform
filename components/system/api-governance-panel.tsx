import { Braces, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  apiEndpointGovernance,
  getApiGovernanceSummary,
  type ApiGovernanceStatus,
  type ApiRiskLevel,
} from "@/lib/domain/api-governance";
import { capabilityLabels } from "@/lib/domain/permissions";

const riskLabel: Record<ApiRiskLevel, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const statusLabel: Record<ApiGovernanceStatus, string> = {
  covered: "已接權限",
  needs_rls: "待 RLS",
  planned: "規劃中",
};

export function ApiGovernancePanel() {
  const summary = getApiGovernanceSummary();

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Braces className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">API 維運中心</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          API 需要獨立維護：權限、資料邊界、RLS、稽核紀錄與外部串接都要能被追蹤。
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        <SummaryCard label="API 數" value={summary.total} />
        <SummaryCard label="高風險" value={summary.highRisk} />
        <SummaryCard label="已接權限" value={summary.covered} />
        <SummaryCard label="待 RLS" value={summary.needsRls} />
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">維護原則</h2>
        </div>
        <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>前端按鈕只改善體驗，API 權限才是第一道後端防線。</p>
          <p>正式接 Supabase 後，每筆查詢都必須套 workspace_id 與 RLS。</p>
          <p>高風險 API 需要寫入 activity log，包含操作者、前後狀態與原因。</p>
          <p>對外 API 或 webhook 需額外管理 token、速率限制、IP / domain allowlist。</p>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">API 清單與權限</h2>
        </div>
        <div className="mt-4 overflow-x-auto rounded-md border">
          <table className="w-full min-w-[68rem] text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-3 py-2 font-medium">API</th>
                <th className="px-3 py-2 font-medium">功能</th>
                <th className="px-3 py-2 font-medium">權限</th>
                <th className="px-3 py-2 font-medium">風險</th>
                <th className="px-3 py-2 font-medium">狀態</th>
                <th className="px-3 py-2 font-medium">維護提醒</th>
              </tr>
            </thead>
            <tbody>
              {apiEndpointGovernance.map((api) => (
                <tr key={api.key} className="border-t align-top">
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">
                      {api.method}
                    </span>
                    <p className="mt-2 font-mono text-xs">{api.path}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{api.purpose}</p>
                  </td>
                  <td className="px-3 py-2 font-medium">{api.feature}</td>
                  <td className="px-3 py-2">
                    {api.requiredCapabilities.map((capability) => (
                      <p key={capability} className="text-xs leading-5">
                        {capabilityLabels[capability]}
                      </p>
                    ))}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        api.riskLevel === "high"
                          ? "bg-destructive text-destructive-foreground"
                          : api.riskLevel === "medium"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary"
                      }`}
                    >
                      {riskLabel[api.riskLevel]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                      {statusLabel[api.status]}
                    </span>
                    <p className="mt-2 text-xs text-muted-foreground">{api.dataBoundary}</p>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{api.maintenanceNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}
