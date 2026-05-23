import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import {
  getLogTieringSummary,
  getLogTieringWarnings,
  logRetentionPolicies,
} from "@/lib/domain/log-tiering";
import { getSystemStatus } from "@/lib/system/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasRuntimeEnvValue } from "@/lib/runtime/env";

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "system.read");
  if (forbidden) return forbidden;

  const supabaseAdmin = await getSupabaseAdminDiagnostics();

  return NextResponse.json({
    data: {
      ...getSystemStatus(),
      supabaseAdmin,
      logTiering: {
        summary: getLogTieringSummary(),
        warnings: getLogTieringWarnings(),
        policies: logRetentionPolicies,
      },
    },
  });
}

async function getSupabaseAdminDiagnostics() {
  const serviceRoleConfigured = hasRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY");

  if (!serviceRoleConfigured) {
    return {
      serviceRoleConfigured,
      registrationTableReachable: false,
      status: "missing_service_role",
      message: "Cloudflare Worker 尚未讀到 SUPABASE_SERVICE_ROLE_KEY。",
    };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("workspace_registration_requests")
      .select("id", { count: "exact", head: true });

    if (error) {
      return {
        serviceRoleConfigured,
        registrationTableReachable: false,
        status: "table_unreachable",
        message: "Service Role 已設定，但無法讀取註冊審核資料表，請確認 migration 是否已執行。",
      };
    }

    return {
      serviceRoleConfigured,
      registrationTableReachable: true,
      status: "ready",
      message: "Service Role 可用，並可讀取註冊審核資料表。",
    };
  } catch {
    return {
      serviceRoleConfigured,
      registrationTableReachable: false,
      status: "admin_client_failed",
      message: "Service Role 已設定，但 Supabase 管理端連線失敗，請確認 URL 與 key 是否屬於同一個專案。",
    };
  }
}
