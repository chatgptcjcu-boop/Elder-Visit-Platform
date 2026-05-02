import { FileCheck2, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  consentRecords,
  consentScopeLabels,
  getConsentGovernanceSummary,
} from "@/lib/domain/consent";

const sourceLabels = {
  visit_form: "訪查表",
  paper_import: "紙本匯入",
  guardian_upload: "家屬上傳",
};

export function ConsentDashboard() {
  const summary = getConsentGovernanceSummary();

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">同意治理</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          管理同意範圍、撤回狀態與匯出用途，避免個資被用在未授權情境。
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <SummaryCard label="同意書總數" value={summary.total} />
          <SummaryCard label="有效同意" value={summary.active} />
          <SummaryCard label="已撤回" value={summary.revoked} />
          <SummaryCard label="30 日內到期" value={summary.expiringSoon} />
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">同意書清冊</h2>
        </div>
        <div className="mt-4 overflow-x-auto rounded-md border">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-3 py-2 font-medium">案號</th>
                <th className="px-3 py-2 font-medium">姓名</th>
                <th className="px-3 py-2 font-medium">狀態</th>
                <th className="px-3 py-2 font-medium">授權用途</th>
                <th className="px-3 py-2 font-medium">到期日</th>
                <th className="px-3 py-2 font-medium">來源</th>
              </tr>
            </thead>
            <tbody>
              {consentRecords.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{record.caseCode}</td>
                  <td className="px-3 py-2">{record.elderName}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        record.signed && !record.revoked
                          ? "text-emerald-700"
                          : "text-destructive"
                      }
                    >
                      {record.revoked ? "已撤回" : record.signed ? "有效" : "缺簽"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {record.scopes.length > 0
                      ? record.scopes.map((scope) => consentScopeLabels[scope]).join("、")
                      : "未授權"}
                  </td>
                  <td className="px-3 py-2">{record.expiryDate ?? "未設定"}</td>
                  <td className="px-3 py-2">{sourceLabels[record.source]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-5 w-5 text-amber-600" />
          <h2 className="text-base font-semibold">匯出規則</h2>
        </div>
        <div className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p>政府成果回報與單位內部服務可保留必要識別欄位。</p>
          <p>匿名 KPI、研究分析、贊助揭露會自動遮罩姓名等可識別欄位。</p>
          <p>已撤回、缺簽或過期的資料不可進入可識別資料匯出。</p>
          <p>用途未涵蓋時會留下治理提醒，後續可串接主管覆核流程。</p>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
