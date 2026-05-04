import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { read, utils } from "xlsx";
import { requireCapability } from "@/lib/api/authorization";
import { createImportPreviewFromRows, parseCsvPreview } from "@/lib/domain/imports";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "cases.import");
  if (forbidden) return forbidden;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: { message: "未收到檔案。" } }, { status: 400 });
    }

    if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
      return NextResponse.json({
        data: parseCsvPreview(await file.text()),
      });
    }

    if (file.name.endsWith(".xlsx")) {
      const workbook = read(await file.arrayBuffer(), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = sheetName ? workbook.Sheets[sheetName] : null;
      const rows = sheet
        ? (utils.sheet_to_json(sheet, { defval: "" }) as Array<Record<string, string>>)
        : [];

      return NextResponse.json({
        data: createImportPreviewFromRows(rows),
      });
    }

    return NextResponse.json({ error: { message: "目前支援 CSV、TXT、XLSX。" } }, { status: 400 });
  }

  const body = (await request.json()) as { csvText?: string };

  return NextResponse.json({
    data: parseCsvPreview(body.csvText ?? ""),
  });
}
