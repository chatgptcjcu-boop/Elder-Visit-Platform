import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { exportTemplates, formTemplates, kpiTemplates, workflowTemplates } from "@/lib/domain/engines";

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "engines.manage");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: {
      formTemplates,
      workflowTemplates,
      exportTemplates,
      kpiTemplates,
    },
  });
}
