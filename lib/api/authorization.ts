import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRoleByKey } from "@/lib/domain/permissions";
import type { Capability, WorkspaceRoleKey } from "@/lib/domain/types";

export function requireCapability(request: NextRequest, capability: Capability) {
  const roleKey = (request.cookies.get("demo_role")?.value ?? "workspace_manager") as WorkspaceRoleKey;
  const role = getRoleByKey(roleKey);

  if (role.capabilities.includes(capability)) {
    return null;
  }

  return NextResponse.json(
    {
      error: {
        code: "FORBIDDEN",
        message: `目前角色沒有「${capability}」權限。`,
        requiredCapability: capability,
        roleKey,
      },
    },
    { status: 403 },
  );
}

export function requireAnyCapability(request: NextRequest, capabilities: Capability[]) {
  const roleKey = (request.cookies.get("demo_role")?.value ?? "workspace_manager") as WorkspaceRoleKey;
  const role = getRoleByKey(roleKey);

  if (capabilities.some((capability) => role.capabilities.includes(capability))) {
    return null;
  }

  return NextResponse.json(
    {
      error: {
        code: "FORBIDDEN",
        message: `目前角色沒有執行此操作所需權限。`,
        requiredCapabilities: capabilities,
        roleKey,
      },
    },
    { status: 403 },
  );
}
