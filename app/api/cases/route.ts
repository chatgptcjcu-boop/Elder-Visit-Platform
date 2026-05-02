import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { updateCaseStatus } from "@/lib/domain/cases";
import type { CaseStatusDecision } from "@/lib/domain/types";
import { getRepository } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "cases.read");
  if (forbidden) return forbidden;

  const repository = getRepository();

  return NextResponse.json({
    data: {
      summary: await repository.getCaseRegistrySummary(),
      cases: await repository.getCaseRegistry(),
    },
  });
}

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "cases.update");
  if (forbidden) return forbidden;

  const decision = (await request.json()) as CaseStatusDecision;

  return NextResponse.json({
    data: updateCaseStatus(decision),
  });
}
