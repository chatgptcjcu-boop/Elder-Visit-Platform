import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import {
  getLogTieringSummary,
  getLogTieringWarnings,
  logRetentionPolicies,
} from "@/lib/domain/log-tiering";
import { getSystemStatus } from "@/lib/system/env";

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "system.read");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: {
      ...getSystemStatus(),
      logTiering: {
        summary: getLogTieringSummary(),
        warnings: getLogTieringWarnings(),
        policies: logRetentionPolicies,
      },
    },
  });
}
