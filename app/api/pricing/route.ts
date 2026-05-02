import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { pricingPlans } from "@/lib/domain/pricing";

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "pricing.manage");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: pricingPlans,
  });
}
