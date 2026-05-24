import JSZip from "jszip";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { getHeadshotBytes } from "@/lib/domain/visitor-headshots";
import { createAdminClient } from "@/lib/supabase/admin";

type ExportHeadshotRow = {
  id: string;
  full_name: string;
  display_name: string | null;
  visitor_code: string | null;
  registration_code: string | null;
  headshot_processed_url: string | null;
};

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "users.manage");
  if (forbidden) return forbidden;

  const body = (await request.json()) as { requestIds?: string[] };
  const requestIds = Array.from(new Set((body.requestIds ?? []).filter(Boolean))).slice(0, 500);
  if (requestIds.length === 0) {
    return NextResponse.json(
      { error: { code: "NO_VISITORS_SELECTED", message: "目前沒有可匯出的訪員資料。" } },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("workspace_registration_requests")
      .select("id, full_name, display_name, visitor_code, registration_code, headshot_processed_url")
      .in("id", requestIds)
      .eq("status", "approved");

    if (error || !data) {
      throw new Error("load failed");
    }

    const zip = new JSZip();
    const photos = zip.folder("證件照");
    const manifestRows = ["訪員正式編碼,姓名,照片檔名,照片狀態"];
    let photoCount = 0;

    for (const row of data as ExportHeadshotRow[]) {
      const visitorCode = row.visitor_code ?? row.registration_code ?? row.id;
      const filename = `${sanitizeFilename(visitorCode)}_證件照.jpg`;
      const bytes = await getHeadshotBytes(row.headshot_processed_url);
      if (bytes) {
        photos?.file(filename, bytes);
        photoCount += 1;
      }
      manifestRows.push(
        [visitorCode, row.display_name ?? row.full_name, filename, bytes ? "已匯出" : "缺照片"]
          .map(toCsvCell)
          .join(","),
      );
    }

    zip.file("照片索引.csv", `\uFEFF${manifestRows.join("\r\n")}`);
    zip.file(
      "讀我.txt",
      `本匯出檔共有 ${data.length} 位訪員，含 ${photoCount} 張證件照。\r\n照片檔名以訪員正式編碼命名，請依個資權限妥善保存。`,
    );

    const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    const archiveBuffer = Uint8Array.from(archive).buffer;
    const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const filename = `訪員證件照匯出_${date}.zip`;

    return new NextResponse(archiveBuffer, {
      headers: {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "HEADSHOT_EXPORT_FAILED", message: "照片匯出失敗，請稍後再試。" } },
      { status: 500 },
    );
  }
}

function sanitizeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").trim() || "訪員";
}

function toCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
