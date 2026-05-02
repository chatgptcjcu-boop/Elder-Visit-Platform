import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { getSoftDeletePreview } from "@/lib/domain/workspace-settings";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "workspace.soft_delete");
  if (forbidden) return forbidden;

  const body = (await request.json()) as {
    workspaceId: string;
    restoreDeadlineDays?: number;
  };
  const restoreDeadlineDays = body.restoreDeadlineDays ?? 30;
  const preview = getSoftDeletePreview(restoreDeadlineDays);

  return NextResponse.json({
    data: {
      workspaceId: body.workspaceId,
      status: "soft_deleted",
      deletedAt: new Date().toISOString(),
      restoreDeadlineDays,
      ...preview,
    },
  });
}
