import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { createBlueprintMigrationPreview } from "@/lib/domain/blueprint-governance";
import { getCurrentWorkspace } from "@/lib/domain/mock-data";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "workspace.update");
  if (forbidden) return forbidden;

  const body = (await request.json()) as { workspaceId?: string };
  const workspace = getCurrentWorkspace();

  return NextResponse.json({
    data: {
      requestedWorkspaceId: body.workspaceId ?? workspace.id,
      preview: createBlueprintMigrationPreview(workspace),
    },
  });
}
