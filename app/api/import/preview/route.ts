import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { parseCsvPreview } from "@/lib/domain/imports";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "cases.import");
  if (forbidden) return forbidden;

  const body = (await request.json()) as { csvText?: string };

  return NextResponse.json({
    data: parseCsvPreview(body.csvText ?? ""),
  });
}
