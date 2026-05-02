import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { getPermissionOverview } from "@/lib/domain/permissions";

export function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "permissions.manage");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: getPermissionOverview(),
  });
}
