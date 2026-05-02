import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { createPaymentBatch, createPaymentBatchPreview } from "@/lib/domain/payments";

export function GET() {
  return NextResponse.json({
    data: createPaymentBatchPreview(),
  });
}

export function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "payments.calculate");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: createPaymentBatch(),
  });
}
