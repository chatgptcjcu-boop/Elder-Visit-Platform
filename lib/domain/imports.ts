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
  { targetField: "case_code", labels: ["編碼", "案號", "case_code"] },
  { targetField: "service_unit", labels: ["服務單位", "service_unit"] },
  { targetField: "name", labels: ["姓名", "長者姓名", "name"] },
  { targetField: "gender", labels: ["性別", "gender"] },
  { targetField: "national_id", labels: ["身分證", "身分證字號", "id"] },
  { targetField: "birth_date", labels: ["出生", "生日", "出生年月日", "birth"] },
  { targetField: "age", labels: ["年齡", "age"] },
  { targetField: "phone", labels: ["電話", "手機", "phone"] },
  { targetField: "line_id_status", labels: ["Line ID", "line"] },
  { targetField: "line_id_note", labels: ["Line ID 內容", "line_note"] },
  { targetField: "emergency_contact_name", labels: ["緊急聯絡人姓名"] },
  { targetField: "emergency_contact_relationship", labels: ["緊急聯絡人關係"] },
  { targetField: "emergency_contact_phone", labels: ["緊急聯絡人電話"] },
  { targetField: "household_city", labels: ["戶籍縣市"] },
  { targetField: "household_district", labels: ["戶籍區"] },
  { targetField: "household_village", labels: ["戶籍里"] },
  { targetField: "household_address", labels: ["戶籍地址"] },
  { targetField: "address", labels: ["地址", "住址", "address"] },
  { targetField: "residence_address_note", labels: ["居住說明"] },
  { targetField: "residence_city", labels: ["居住城市"] },
  { targetField: "residence_district", labels: ["居住區"] },
  { targetField: "residence_village", labels: ["居住里"] },
  { targetField: "residence_address", labels: ["居住詳細地址", "居住地址"] },
  { targetField: "district", labels: ["行政區", "區域", "district"] },
  { targetField: "village", labels: ["里", "村里", "里別", "village"] },
  { targetField: "risk_level", labels: ["風險", "風險等級", "risk"] },
  { targetField: "solitary_status", labels: ["獨居資格"] },
  { targetField: "import_visit_result", labels: ["訪視結果"] },
  { targetField: "import_visitor_name", labels: ["訪員姓名"] },
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
