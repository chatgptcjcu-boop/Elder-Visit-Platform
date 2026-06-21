import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { claimVisitorBadge } from "@/lib/domain/visitor-badges";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string; serial?: string };
    const token = body.token?.trim();
    const serial = body.serial?.trim();

    if (!token || !serial) {
      return NextResponse.json({ error: { message: "請輸入紙本訪員證上的序號。" } }, { status: 400 });
    }

    const badge = await claimVisitorBadge(token, serial);
    return NextResponse.json({ data: badge });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "電子訪員證領取失敗。" } },
      { status: 400 },
    );
  }
}
