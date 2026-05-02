import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAnyCapability } from "@/lib/api/authorization";
import { submitAuditDecision } from "@/lib/domain/audit";
import type { AuditDecision } from "@/lib/domain/types";

export async function POST(request: NextRequest) {
  const decision = (await request.json()) as AuditDecision;
  const requiredCapability = decision.decision === "approve" ? "audit.approve" : "audit.reject";
  const forbidden = requireAnyCapability(request, [requiredCapability]);
  if (forbidden) return forbidden;

  const result = submitAuditDecision(decision);

  return NextResponse.json({
    data: result,
  });
}
