"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { parseCsvPreview, type ImportPreview } from "@/lib/domain/imports";

const sampleCsv = `姓名,電話,地址,行政區,風險等級
王美玉,0912-111-001,臺中市北區進化路 12 號,北區,高
李國雄,0912-111-002,臺中市北區學士路 88 號,北區,中
陳秀琴,0912-111-003,臺中市北區崇德路 45 號,北區,低`;

export function ImportPreviewTool({ compact = false }: { compact?: boolean }) {
  const [csvText, setCsvText] = useState(sampleCsv);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<ImportPreview | null>(null);
  const preview = useMemo(() => uploadedPreview ?? parseCsvPreview(csvText), [csvText, uploadedPreview]);

  async function readImportFile(file: File | null) {
    if (!file) return;

    setFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/import/preview", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as { data?: ImportPreview };
    if (result.data) {
      setUploadedPreview(result.data);
    }

    if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
      setCsvText(await file.text());
      return;
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          {compact ? (
            <h3 className="text-base font-semibold">名冊匯入預覽</h3>
          ) : (
            <h1 className="text-2xl font-semibold">名冊匯入預覽</h1>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          可上傳 CSV/TXT 名冊檔或直接貼上內容；系統先偵測第一列欄位，管理者確認對應後才寫入名冊。
        </p>
        <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-background p-4 text-center text-sm transition-colors hover:bg-secondary">
          <Upload className="h-5 w-5 text-primary" />
          <span className="font-medium">上傳名冊檔</span>
          <span className="text-muted-foreground">
            支援 CSV/TXT 預覽；XLSX 會先標記為待後端解析
          </span>
          <input
            className="hidden"
            type="file"
            accept=".csv,.txt,.xlsx"
            onChange={(event) => void readImportFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {fileName && (
          <p className="mt-2 rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
            已選擇：{fileName}
          </p>
        )}
        <textarea
          className="mt-4 min-h-60 w-full rounded-md border bg-background p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
          value={csvText}
          onChange={(event) => {
            setUploadedPreview(null);
            setCsvText(event.target.value);
          }}
        />
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-base font-semibold">欄位對應建議</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <ImportMetric label="總筆數" value={preview.validation.totalRows} />
          <ImportMetric label="可匯入" value={preview.validation.validRows} />
          <ImportMetric label="需修正" value={preview.validation.rowsWithWarnings} />
        </div>
        {preview.validation.warnings.length > 0 && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {preview.validation.warnings.join("；")}
          </div>
        )}
        <div className="mt-4 space-y-3">
          {preview.suggestedMappings.map((mapping) => (
            <div key={mapping.sourceColumn} className="rounded-md border bg-background p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{mapping.sourceColumn}</span>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                  {mapping.confidence}%
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">→ {mapping.targetField}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">前 5 筆資料</h2>
        <div className="mt-3 overflow-x-auto rounded-md border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                {preview.columns.map((column) => (
                  <th key={column} className="px-3 py-2 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, index) => (
                <tr key={index} className="border-t">
                  {preview.columns.map((column) => (
                    <td key={column} className="px-3 py-2">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ImportMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
