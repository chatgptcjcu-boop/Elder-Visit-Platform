import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import {
  confirmAssignment,
  getAssignmentRecommendations,
  visitors,
} from "@/lib/domain/assignments";

export function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "assignment.manage");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: {
      visitors,
      recommendations: getAssignmentRecommendations(),
    },
  });
}

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "assignment.confirm");
  if (forbidden) return forbidden;

  const body = (await request.json()) as { recommendationId?: string };

  return NextResponse.json({
    data: confirmAssignment(body.recommendationId ?? ""),
  });
}
