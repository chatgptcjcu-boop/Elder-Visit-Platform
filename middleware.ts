import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/offline"];
const supabaseCookiePrefixes = ["sb-", "supabase-auth-token"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthApi = pathname.startsWith("/api/auth/");
  const isAsset = pathname.startsWith("/_next/") || pathname.startsWith("/favicon");

  if (isPublicRoute || isAuthApi || isAsset) {
    return NextResponse.next();
  }

  const hasDemoSession = Boolean(request.cookies.get("demo_role")?.value);
  const hasSupabaseSession = request.cookies
    .getAll()
    .some((cookie) => supabaseCookiePrefixes.some((prefix) => cookie.name.startsWith(prefix)));

  if (!hasDemoSession && !hasSupabaseSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
