import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticateDemoAccount, demoLoginAccounts } from "@/lib/domain/permissions";
import type { WorkspaceRoleKey } from "@/lib/domain/types";

function getSafeNextPath(nextPath: string | null, fallback: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  return nextPath;
}

function inferRoleKey(email: string): WorkspaceRoleKey {
  const demoAccount = demoLoginAccounts.find(
    (account) => account.email.toLowerCase() === email.toLowerCase(),
  );
  if (demoAccount) {
    return demoAccount.roleKey;
  }

  if (email.includes("visitor")) return "visitor";
  if (email.includes("supervisor")) return "supervisor";
  if (email.includes("auditor")) return "auditor";
  if (email.includes("viewer")) return "viewer";
  if (email.includes("owner")) return "workspace_owner";
  return "workspace_manager";
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { email?: string; password?: string; next?: string };
  const email = body.email ?? "";
  const password = body.password ?? "";
  const demoAccount = authenticateDemoAccount(email, password);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data.user) {
      const roleKey = await getSupabaseRoleKey(data.user.id, demoAccount?.roleKey ?? inferRoleKey(email));
      const response = NextResponse.json({
        data: {
          ok: true,
          mode: "supabase",
          roleKey,
          nextPath: getSafeNextPath(body.next ?? null, demoAccount?.landingPath ?? "/dashboard"),
        },
      });

      response.cookies.set("demo_role", roleKey, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
      });

      return response;
    }
  } catch {
    // Supabase Auth can be unavailable during local setup; demo login remains available.
  }

  if (!demoAccount) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_LOGIN",
          message: "帳號或密碼錯誤，請確認 Supabase 使用者或示範帳號。",
        },
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    data: {
      ok: true,
      mode: "demo",
      roleKey: demoAccount.roleKey,
      fullName: demoAccount.fullName,
      nextPath: getSafeNextPath(body.next ?? null, demoAccount.landingPath),
    },
  });

  response.cookies.set("demo_role", demoAccount.roleKey, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

type SupabaseRoleClient = {
  from(table: "accounts"): {
    select(query: string): {
      eq(column: string, value: string): {
        maybeSingle(): Promise<{
          data: {
            workspace_memberships:
              | Array<{
                  role_name: string | null;
                  status: string | null;
                }>
              | null;
          } | null;
          error: unknown;
        }>;
      };
    };
  };
};

async function getSupabaseRoleKey(authUserId: string, fallback: WorkspaceRoleKey) {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as unknown as SupabaseRoleClient)
      .from("accounts")
      .select("workspace_memberships(role_name,status)")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error || !data?.workspace_memberships?.length) {
      return fallback;
    }

    const activeMembership =
      data.workspace_memberships.find((membership) => membership.status === "active") ??
      data.workspace_memberships[0];

    return normalizeRoleKey(activeMembership.role_name, fallback);
  } catch {
    return fallback;
  }
}

function normalizeRoleKey(roleName: string | null, fallback: WorkspaceRoleKey): WorkspaceRoleKey {
  if (
    roleName === "workspace_owner" ||
    roleName === "workspace_manager" ||
    roleName === "supervisor" ||
    roleName === "visitor" ||
    roleName === "auditor" ||
    roleName === "viewer"
  ) {
    return roleName;
  }

  return fallback;
}
