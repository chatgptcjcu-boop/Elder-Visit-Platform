import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAnyCapability, requireCapability } from "@/lib/api/authorization";
import { defaultWorkspaceSettings } from "@/lib/domain/workspace-settings";
import type { WorkspaceSettings } from "@/lib/domain/types";

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "workspace.manage");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: defaultWorkspaceSettings,
  });
}

export async function POST(request: NextRequest) {
  const forbidden = requireAnyCapability(request, ["workspace.update", "sponsors.manage"]);
  if (forbidden) return forbidden;

  const settings = (await request.json()) as WorkspaceSettings;

  return NextResponse.json({
    data: {
      ...settings,
      saved: true,
      savedAt: new Date().toISOString(),
      affectedTables: [
        "workspace_settings",
        "workspace_responsibility",
        "log_retention_policies",
        "workspace_activity_logs",
      ],
    },
  });
}
