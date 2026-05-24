import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "users.review");
  if (forbidden) return forbidden;

  const body = (await request.json()) as { requestId?: string };
  const requestId = body.requestId?.trim();

  if (!requestId) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_REQUEST_ID",
          message: "缺少註冊申請編號。",
        },
      },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const { data: registration, error } = await (supabase as unknown as RegistrationLookupClient)
      .from("workspace_registration_requests")
      .select("id, account_id, requested_workspace_id, email, full_name")
      .eq("id", requestId)
      .single();

    if (error || !registration?.account_id || !registration.requested_workspace_id) {
      return NextResponse.json(
        {
          error: {
            code: "REGISTRATION_NOT_FOUND",
            message: "找不到可確認的訪員註冊資料。",
          },
        },
        { status: 404 },
      );
    }

    const now = new Date().toISOString();
    const profileResult = await (supabase as unknown as VisitorProfileVerifyClient)
      .from("visitor_profiles")
      .update({
        profile_completion_status: "verified",
        profile_reviewed_at: now,
        is_assignable: true,
        remittance_review_status: "approved",
        remittance_reviewed_at: now,
        remittance_ready: true,
        status: "available",
        updated_at: now,
      })
      .eq("account_id", registration.account_id)
      .eq("workspace_id", registration.requested_workspace_id);

    if (profileResult.error) {
      return NextResponse.json(
        {
          error: {
            code: "PROFILE_UPDATE_FAILED",
            message: "訪員資料確認失敗，請稍後再試。",
          },
        },
        { status: 500 },
      );
    }

    await (supabase as unknown as RegistrationVerifyClient)
      .from("workspace_registration_requests")
      .update({
        profile_completion_status: "verified",
        profile_reviewed_at: now,
      })
      .eq("id", requestId);

    return NextResponse.json({
      data: {
        requestId,
        status: "verified",
        message: `${registration.full_name} 的訪員資料已確認，可納入派案。`,
        nextStep: "派案時可依訪員編碼、民政/社政類型、里別與工作量選用。",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "VERIFY_FAILED",
          message: "確認訪員資料失敗，請稍後再試；若持續失敗，請聯絡系統管理者。",
        },
      },
      { status: 500 },
    );
  }
}

type RegistrationLookupClient = {
  from(table: "workspace_registration_requests"): {
    select(query: string): {
      eq(column: string, value: string): {
        single(): Promise<{
          data: {
            id: string;
            account_id: string | null;
            requested_workspace_id: string | null;
            email: string;
            full_name: string;
          } | null;
          error: unknown;
        }>;
      };
    };
  };
};

type VisitorProfileVerifyClient = {
  from(table: "visitor_profiles"): {
    update(row: Record<string, unknown>): {
      eq(column: string, value: string): {
        eq(column: string, value: string): Promise<{
          data: unknown;
          error: unknown;
        }>;
      };
    };
  };
};

type RegistrationVerifyClient = {
  from(table: "workspace_registration_requests"): {
    update(row: Record<string, unknown>): {
      eq(column: string, value: string): Promise<{
        data: unknown;
        error: unknown;
      }>;
    };
  };
};
