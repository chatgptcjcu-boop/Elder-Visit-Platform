import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { reviewRegistrationsBatch } from "@/lib/domain/user-management";
import type { UserRegistrationBatchDecision } from "@/lib/domain/types";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "users.review");
  if (forbidden) return forbidden;

  try {
    const decision = (await request.json()) as UserRegistrationBatchDecision;

    if (decision.decision !== "approve") {
      return NextResponse.json(
        {
          error: {
            code: "UNSUPPORTED_BATCH_DECISION",
            message: "目前批次作業僅支援核准加入。",
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      data: await reviewRegistrationsBatch(decision),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "REGISTRATION_BATCH_REVIEW_FAILED",
          message: error instanceof Error ? error.message : "整批審核未完成。",
        },
      },
      { status: 500 },
    );
  }
}
