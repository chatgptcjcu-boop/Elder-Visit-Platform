import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { lockPaymentDraft } from "@/lib/domain/audit";
import type { PaymentCalculation } from "@/lib/domain/types";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "payments.lock");
  if (forbidden) return forbidden;

  const body = (await request.json()) as {
    paymentId?: string;
    calculation?: PaymentCalculation;
  };

  const fallbackCalculation: PaymentCalculation = {
    visitFee: 600,
    dataFee: 100,
    auditFee: 50,
    otherFee: 0,
    totalFee: 750,
    status: "draft",
    calculationDetail: ["示範核銷草稿。"],
  };

  return NextResponse.json({
    data: lockPaymentDraft(body.paymentId ?? "payment_demo_001", body.calculation ?? fallbackCalculation),
  });
}
