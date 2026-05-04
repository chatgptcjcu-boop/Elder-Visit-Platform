export type ImportPreview = {
  columns: string[];
  rows: Array<Record<string, string>>;
  suggestedMappings: Array<{
    sourceColumn: string;
    targetField: string;
    confidence: number;
  }>;
  validation: {
    totalRows: number;
    validRows: number;
    rowsWithWarnings: number;
    warnings: string[];
  };
};

const targetHints = [
  { targetField: "name", labels: ["姓名", "長者姓名", "name"] },
  { targetField: "national_id", labels: ["身分證", "身分證字號", "id"] },
  { targetField: "birth_date", labels: ["出生", "生日", "出生年月日", "birth"] },
  { targetField: "phone", labels: ["電話", "手機", "phone"] },
  { targetField: "address", labels: ["地址", "住址", "address"] },
  { targetField: "district", labels: ["行政區", "區域", "district"] },
  { targetField: "village", labels: ["里", "村里", "里別", "village"] },
  { targetField: "risk_level", labels: ["風險", "風險等級", "risk"] },
];

export function parseCsvPreview(csvText: string): ImportPreview {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const columns = splitCsvLine(lines[0] ?? "");
  const rows = lines.slice(1, 6).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(columns.map((column, index) => [column, values[index] ?? ""]));
  });

  return {
    columns,
    rows,
    suggestedMappings: columns.map((column) => {
      const normalized = column.toLowerCase();
      const match = targetHints.find((hint) =>
        hint.labels.some((label) => normalized.includes(label.toLowerCase())),
      );

      return {
        sourceColumn: column,
        targetField: match?.targetField ?? "custom_field",
        confidence: match ? 90 : 45,
      };
    }),
    validation: validateImportRows(columns, rows),
  };
}

export function createImportPreviewFromRows(rows: Array<Record<string, string>>): ImportPreview {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const previewRows = rows.slice(0, 10);

  return {
    columns,
    rows: previewRows,
    suggestedMappings: columns.map((column) => {
      const normalized = column.toLowerCase();
      const match = targetHints.find((hint) =>
        hint.labels.some((label) => normalized.includes(label.toLowerCase())),
      );

      return {
        sourceColumn: column,
        targetField: match?.targetField ?? "custom_field",
        confidence: match ? 90 : 45,
      };
    }),
    validation: validateImportRows(columns, rows),
  };
}

function validateImportRows(columns: string[], rows: Array<Record<string, string>>) {
  const mappings = columns.map((column) => {
    const normalized = column.toLowerCase();
    const match = targetHints.find((hint) =>
      hint.labels.some((label) => normalized.includes(label.toLowerCase())),
    );
    return { column, targetField: match?.targetField ?? "custom_field" };
  });
  const nameColumn = mappings.find((mapping) => mapping.targetField === "name")?.column;
  const addressColumn = mappings.find((mapping) => mapping.targetField === "address")?.column;
  const districtColumn = mappings.find((mapping) => mapping.targetField === "district")?.column;
  const warnings: string[] = [];
  let rowsWithWarnings = 0;

  rows.forEach((row, index) => {
    const rowWarnings: string[] = [];
    if (!nameColumn || !row[nameColumn]) rowWarnings.push("姓名");
    if (!addressColumn || !row[addressColumn]) rowWarnings.push("地址");
    if (!districtColumn || !row[districtColumn]) rowWarnings.push("行政區");
    if (rowWarnings.length > 0) {
      rowsWithWarnings += 1;
      if (warnings.length < 5) {
        warnings.push(`第 ${index + 1} 筆缺少：${rowWarnings.join("、")}`);
      }
    }
  });

  return {
    totalRows: rows.length,
    validRows: rows.length - rowsWithWarnings,
    rowsWithWarnings,
    warnings,
  };
}

function splitCsvLine(line: string) {
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}
