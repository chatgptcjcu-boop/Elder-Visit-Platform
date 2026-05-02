import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { createKpiReport } from "@/lib/domain/kpi";

export function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "kpi.read");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: createKpiReport(),
  });
}
