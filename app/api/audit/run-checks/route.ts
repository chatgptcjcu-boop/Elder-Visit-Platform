import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import type { VisitSubmission } from "@/lib/domain/types";
import { getAuditState, runVisitAuditChecks } from "@/lib/domain/audit";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "audit.run");
  if (forbidden) return forbidden;

  const submission = (await request.json()) as VisitSubmission;
  const checks = runVisitAuditChecks(submission);

  return NextResponse.json({
    data: {
      auditState: getAuditState(checks),
      checks,
    },
  });
}
