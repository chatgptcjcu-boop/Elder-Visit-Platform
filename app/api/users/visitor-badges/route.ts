import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { issueVisitorBadges } from "@/lib/domain/visitor-badges";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "users.review");
  if (forbidden) return forbidden;

  try {
    const body = (await request.json()) as { requestIds?: string[] };
    const result = await issueVisitorBadges(body.requestIds ?? []);

    return NextResponse.json({
      data: {
        message: `已完成 ${result.issued} 張訪員證發證。`,
        issued: result.issued,
        skipped: result.skipped,
        badgeIds: result.badges.map((badge) => badge.id),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : "訪員證發證失敗，請稍後再試。",
        },
      },
      { status: 500 },
    );
  }
}
