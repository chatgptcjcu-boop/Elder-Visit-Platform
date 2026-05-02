import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import {
  consentRecords,
  consentScopeLabels,
  getConsentGovernanceSummary,
} from "@/lib/domain/consent";

export function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "consent.manage");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: {
      summary: getConsentGovernanceSummary(),
      scopeLabels: consentScopeLabels,
      records: consentRecords,
    },
  });
}
