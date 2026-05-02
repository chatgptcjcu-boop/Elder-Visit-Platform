import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import type { VisitSubmission } from "@/lib/domain/types";
import { calculateVisitPayment } from "@/lib/domain/audit";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "payments.calculate");
  if (forbidden) return forbidden;

  const submission = (await request.json()) as VisitSubmission;

  return NextResponse.json({
    data: calculateVisitPayment(submission),
  });
}
