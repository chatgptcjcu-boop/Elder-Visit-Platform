import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { inviteApprovedVisitor } from "@/lib/domain/user-management";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "users.review");
  if (forbidden) return forbidden;

  const body = (await request.json()) as { requestId?: string };
  const requestId = body.requestId?.trim();

  if (!requestId) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_REQUEST_ID",
          message: "缺少註冊申請編號。",
        },
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    data: await inviteApprovedVisitor(requestId, request.nextUrl.origin),
  });
}
