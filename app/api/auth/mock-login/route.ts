import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getMockSessionState } from "@/lib/domain/auth";
import { authenticateDemoAccount } from "@/lib/domain/permissions";

function getSafeNextPath(nextPath: string | null, fallback: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  return nextPath;
}

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");
  const session = getMockSessionState((role ?? "workspace_manager") as never);
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"), session.nextPath);
  const response = NextResponse.redirect(new URL(nextPath, request.url));

  response.cookies.set("demo_role", session.roleKey, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; password?: string; next?: string };
  const account = authenticateDemoAccount(body.email ?? "", body.password ?? "");

  if (!account) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_DEMO_LOGIN",
          message: "帳號或密碼錯誤，請使用示範帳號登入。",
        },
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    data: {
      ok: true,
      roleKey: account.roleKey,
      fullName: account.fullName,
      nextPath: getSafeNextPath(body.next ?? null, account.landingPath),
    },
  });

  response.cookies.set("demo_role", account.roleKey, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
