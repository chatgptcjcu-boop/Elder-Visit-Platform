import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { createCsvExport } from "@/lib/domain/exports";
import { evaluatePlanLimit } from "@/lib/domain/limits";
import { getCurrentWorkspace } from "@/lib/domain/mock-data";
import type { ConsentScope } from "@/lib/domain/types";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "exports.create");
  if (forbidden) return forbidden;

  const body = (await request.json()) as { templateId?: string; purpose?: ConsentScope };
  const workspace = getCurrentWorkspace();
  const planLimit = evaluatePlanLimit(workspace.planLimits, "max_exports");

  if (planLimit.state === "blocked") {
    return NextResponse.json(
      {
        error: {
          code: "PLAN_LIMIT_REACHED",
          message: planLimit.message,
          limit: planLimit.limit,
        },
      },
      { status: 402 },
    );
  }

  const result = createCsvExport(
    body.templateId ?? "export_visit_result_v1",
    body.purpose ?? "government_report",
  );

  return NextResponse.json({
    data: {
      ...result,
      status: "ready",
      exportLog: {
        entityType: "export_job",
        action: "create",
      },
      planLimit,
    },
  });
}
