import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { submitVisitorRegistration } from "@/lib/domain/user-management";
import type { VisitorRegistrationSubmission } from "@/lib/domain/types";

export async function POST(request: NextRequest) {
  const submission = (await request.json()) as VisitorRegistrationSubmission;

  return NextResponse.json({
    data: await submitVisitorRegistration(submission),
  });
}
