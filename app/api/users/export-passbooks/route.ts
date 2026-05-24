import JSZip from "jszip";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { getPassbookBytes } from "@/lib/domain/visitor-documents";
import { createAdminClient } from "@/lib/supabase/admin";

type ExportPassbookRegistrationRow = {
  id: string;
  account_id: string | null;
  full_name: string;
  display_name: string | null;
  visitor_code: string | null;
  registration_code: string | null;
};

type ExportPassbookProfileRow = {
  account_id: string;
  passbook_cover_url: string | null;
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
      .select("id, account_id, full_name, display_name, visitor_code, registration_code")
      .in("id", requestIds)
      .eq("status", "approved");

    if (error || !data) {
      throw new Error("registration lookup failed");
    }

    const registrations = data as ExportPassbookRegistrationRow[];
    const accountIds = registrations.flatMap((row) => (row.account_id ? [row.account_id] : []));
    const profileByAccount = new Map<string, ExportPassbookProfileRow>();

    if (accountIds.length > 0) {
      const profileResult = await supabase
        .from("visitor_profiles")
        .select("account_id, passbook_cover_url")
        .in("account_id", accountIds);
      if (profileResult.error) {
        throw new Error("document lookup failed");
      }
      for (const row of (profileResult.data ?? []) as ExportPassbookProfileRow[]) {
        profileByAccount.set(row.account_id, row);
      }
    }

    const zip = new JSZip();
    const documents = zip.folder("存摺附件");
    const manifestRows = ["訪員正式編碼,姓名,存摺檔名,附件狀態"];
    let documentCount = 0;

    for (const row of registrations) {
      const visitorCode = row.visitor_code ?? row.registration_code ?? row.id;
      const filename = `${sanitizeFilename(visitorCode)}_存摺封面.jpg`;
      const value = row.account_id ? profileByAccount.get(row.account_id)?.passbook_cover_url ?? null : null;
      const bytes = await getPassbookBytes(value);
      if (bytes) {
        documents?.file(filename, bytes);
        documentCount += 1;
      }
      manifestRows.push(
        [visitorCode, row.display_name ?? row.full_name, filename, bytes ? "已匯出" : "缺附件"]
          .map(toCsvCell)
          .join(","),
      );
    }

    zip.file("匯款附件索引.csv", `\uFEFF${manifestRows.join("\r\n")}`);
    zip.file(
      "讀我.txt",
      `本匯出檔共有 ${registrations.length} 位訪員，含 ${documentCount} 份存摺附件。\r\n此檔案含敏感匯款資料，僅限授權人員於核銷或匯款確認用途使用，完成後請依規定保存或刪除。`,
    );

    const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    const archiveBuffer = Uint8Array.from(archive).buffer;
    const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const filename = `訪員存摺附件匯出_${date}.zip`;

    return new NextResponse(archiveBuffer, {
      headers: {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "PASSBOOK_EXPORT_FAILED", message: "存摺附件匯出失敗，請稍後再試。" } },
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
