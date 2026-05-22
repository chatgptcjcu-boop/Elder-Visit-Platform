import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { submitVisitorRegistration } from "@/lib/domain/user-management";
import type { VisitorRegistrationSubmission } from "@/lib/domain/types";

export async function POST(request: NextRequest) {
  try {
    const submission = (await request.json()) as VisitorRegistrationSubmission;

    return NextResponse.json({
      data: await submitVisitorRegistration(submission),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "VISITOR_REGISTRATION_FAILED",
          message: error instanceof Error ? error.message : "訪員註冊資料寫入失敗。",
        },
      },
      { status: 500 },
    );
  }
}
