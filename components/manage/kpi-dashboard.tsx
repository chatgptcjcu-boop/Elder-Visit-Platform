"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import type { KpiReport, KpiResultItem } from "@/lib/domain/types";

export function KpiDashboard() {
  const [report, setReport] = useState<KpiReport | null>(null);

  useEffect(() => {
    void loadReport();
  }, []);

  const summary = useMemo(() => {
    const items = report?.items ?? [];
    return {
      met: items.filter((item) => item.status === "met").length,
      watch: items.filter((item) => item.status === "watch").length,
      missed: items.filter((item) => item.status === "missed").length,
    };
  }, [report]);

  async function loadReport() {
    const response = await fetch("/api/kpi");
    const result = (await response.json()) as { data?: KpiReport };
    setReport(result.data ?? null);
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">KPI 成果監控</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          依 KPI 模板追蹤訪查完成率、拒訪率、核銷準確率與高風險追蹤時效。
        </p>
        {report && (
          <p className="mt-3 text-sm text-muted-foreground">
            {report.periodLabel} · 產生時間 {new Date(report.generatedAt).toLocaleString("zh-TW")}
          </p>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="已達標" value={summary.met} />
        <SummaryCard label="觀察中" value={summary.watch} />
        <SummaryCard label="未達標" value={summary.missed} />
      </section>

      {report?.warnings.length ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">追蹤提醒</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {report.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-3 lg:grid-cols-2">
        {report?.items.map((item) => (
          <KpiCard key={item.key} item={item} />
        ))}
      </section>
    </div>
  );
}

function KpiCard({ item }: { item: KpiResultItem }) {
  const lowerIsBetter = item.key === "refusal_rate" || item.key === "follow_up_hours";
  const percent = lowerIsBetter
    ? Math.min(Math.round((item.targetValue / Math.max(item.currentValue, 1)) * 100), 100)
    : Math.min(Math.round((item.currentValue / Math.max(item.targetValue, 1)) * 100), 100);

  return (
    <article className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{item.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            目標 {item.targetValue}
            {item.unit}
          </p>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            item.status === "met"
              ? "bg-primary text-primary-foreground"
              : item.status === "watch"
                ? "bg-accent text-accent-foreground"
                : "bg-destructive text-destructive-foreground"
          }`}
        >
          {item.status === "met" ? "達標" : item.status === "watch" ? "觀察" : "未達標"}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold">
          {item.currentValue}
          <span className="text-base text-muted-foreground">{item.unit}</span>
        </p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          {item.trend === "down" ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          差距 {Math.abs(item.gap)}
          {item.unit}
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </article>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
