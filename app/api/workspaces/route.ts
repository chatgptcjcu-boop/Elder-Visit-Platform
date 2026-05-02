import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { getUnit, workspaces } from "@/lib/domain/mock-data";

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "dashboard.read");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: workspaces.map((workspace) => ({
      ...workspace,
      unit: getUnit(workspace.unitId),
    })),
  });
}
