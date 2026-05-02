"use client";

import { useState } from "react";
import { Archive, CheckCircle2, Database, TriangleAlert } from "lucide-react";
import { PricingDashboard } from "@/components/manage/pricing-dashboard";
import { ApiGovernancePanel } from "@/components/system/api-governance-panel";
import {
  getLogTieringSummary,
  getLogTieringWarnings,
  logRetentionPolicies,
  logTierLabels,
} from "@/lib/domain/log-tiering";
import { getSystemStatus } from "@/lib/system/env";

type ParameterTab = "runtime" | "logs" | "api" | "pricing";

const parameterTabs: Array<{ key: ParameterTab; label: string }> = [
  { key: "runtime", label: "連線參數" },
  { key: "logs", label: "日誌分層" },
  { key: "api", label: "API 維運" },
  { key: "pricing", label: "方案限制" },
];

export function SystemStatusPanel() {
  const [activeTab, setActiveTab] = useState<ParameterTab>("runtime");
  const status = getSystemStatus();
  const ready = status.dataMode === "supabase_ready";
  const logSummary = getLogTieringSummary();
  const logWarnings = getLogTieringWarnings();

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium text-primary">系統設定</p>
        <h1 className="mt-2 text-2xl font-semibold">參數</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          集中管理資料來源、日誌保存與 API 維運參數，避免系統設定下出現重複入口。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {parameterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "runtime" && (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatusCard
              label="資料模式"
              value={ready ? "Supabase 已就緒" : "示範資料"}
              ok={ready}
            />
            <StatusCard
              label="Supabase URL"
              value={status.supabaseUrlConfigured ? "已設定" : "未設定"}
              ok={status.supabaseUrlConfigured}
            />
            <StatusCard
              label="Anon Key"
              value={status.supabaseAnonKeyConfigured ? "已設定" : "未設定"}
              ok={status.supabaseAnonKeyConfigured}
            />
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">下一步連線條件</h2>
            </div>
            {status.missing.length > 0 ? (
              <div className="mt-4 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
                `.env.local` 仍缺少：{status.missing.join("、")}。設定後即可把 onboarding、workspace、訪查資料改接 Supabase。
              </div>
            ) : (
              <div className="mt-4 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
                Supabase 環境變數已齊，可以開始把示範資料來源換成正式資料庫來源。
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === "logs" && <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">日誌分層保存</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <MiniStat label="政策數" value={String(logSummary.totalPolicies)} />
          <MiniStat label="估計筆數" value={logSummary.totalRows.toLocaleString("zh-TW")} />
          <MiniStat label="含個資筆數" value={logSummary.personalDataRows.toLocaleString("zh-TW")} />
          <MiniStat label="封存候選" value={String(logSummary.archiveCandidates)} />
        </div>

        {logWarnings.length > 0 && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {logWarnings.join(" ")}
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-md border">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-3 py-2 font-medium">紀錄類型</th>
                <th className="px-3 py-2 font-medium">層級</th>
                <th className="px-3 py-2 font-medium">保留月數</th>
                <th className="px-3 py-2 font-medium">封存月數</th>
                <th className="px-3 py-2 font-medium">個資</th>
              </tr>
            </thead>
            <tbody>
              {logRetentionPolicies.map((policy) => (
                <tr key={policy.entityType} className="border-t">
                  <td className="px-3 py-2 font-medium">{policy.label}</td>
                  <td className="px-3 py-2">{logTierLabels[policy.tier]}</td>
                  <td className="px-3 py-2">{policy.retentionMonths}</td>
                  <td className="px-3 py-2">{policy.archiveAfterMonths}</td>
                  <td className="px-3 py-2">{policy.containsPersonalData ? "是" : "否"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>}

      {activeTab === "api" && (
        <ApiGovernancePanel />
      )}

      {activeTab === "pricing" && (
        <PricingDashboard />
      )}
    </div>
  );
}

function StatusCard({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {ok ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <TriangleAlert className="h-5 w-5 text-accent" />
        )}
      </div>
      <p className="mt-3 text-lg font-semibold">{value}</p>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
