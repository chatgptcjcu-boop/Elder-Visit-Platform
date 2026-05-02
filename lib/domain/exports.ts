import { exportTemplates } from "@/lib/domain/engines";
import {
  evaluateExportConsent,
  redactExportCell,
} from "@/lib/domain/consent";
import type { ConsentScope } from "@/lib/domain/types";

const mockRows: Record<string, string>[] = [
  {
    case_code: "EV-115-0001",
    name: "林阿梅",
    visit_result: "訪視成功",
    audit_result: "通過",
    visit_fee: "600",
    total_fee: "750",
  },
  {
    case_code: "EV-115-0002",
    name: "陳水木",
    visit_result: "未遇",
    audit_result: "需補件",
    visit_fee: "200",
    total_fee: "0",
  },
];

export function getExportTemplate(templateId: string) {
  return exportTemplates.find((template) => template.id === templateId) ?? exportTemplates[0];
}

export function createExportPreview(
  templateId: string,
  purpose: ConsentScope = "government_report",
) {
  const template = getExportTemplate(templateId);
  const governance = evaluateExportConsent(template, purpose);
  const headers = template.columns.map((column) => column.label);
  const keys = template.columns.map((column) => column.key);
  const rows = mockRows.map((row) =>
    keys.map((key) => redactExportCell(key, row[key] ?? "", governance)),
  );

  return {
    template,
    governance,
    headers,
    rows,
  };
}

export function createCsvExport(
  templateId: string,
  purpose: ConsentScope = "government_report",
) {
  const preview = createExportPreview(templateId, purpose);
  const lines = [
    preview.headers.join(","),
    ...preview.rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];

  return {
    filename: `${preview.template.id}.csv`,
    content: lines.join("\n"),
    governance: preview.governance,
  };
}

function escapeCsvCell(cell: string) {
  if (cell.includes(",") || cell.includes("\"") || cell.includes("\n")) {
    return `"${cell.replaceAll("\"", "\"\"")}"`;
  }

  return cell;
}
