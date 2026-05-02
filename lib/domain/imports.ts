export type ImportPreview = {
  columns: string[];
  rows: Array<Record<string, string>>;
  suggestedMappings: Array<{
    sourceColumn: string;
    targetField: string;
    confidence: number;
  }>;
};

const targetHints = [
  { targetField: "name", labels: ["姓名", "長者姓名", "name"] },
  { targetField: "phone", labels: ["電話", "手機", "phone"] },
  { targetField: "address", labels: ["地址", "住址", "address"] },
  { targetField: "district", labels: ["行政區", "區域", "district"] },
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
  };
}

function splitCsvLine(line: string) {
  return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
}
