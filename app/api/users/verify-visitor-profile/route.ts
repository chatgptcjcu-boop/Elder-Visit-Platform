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
      .select("id, account_id, requested_workspace_id, email, full_name, status, auth_invite_status, training_completed")
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

    if (registration.status !== "approved") {
      return NextResponse.json(
        {
          error: {
            code: "REGISTRATION_NOT_APPROVED",
            message: "此申請尚未核准，不能確認為可派案。",
          },
        },
        { status: 409 },
      );
    }

    const { data: currentProfile, error: profileLookupError } = await (supabase as unknown as VisitorProfileLookupClient)
      .from("visitor_profiles")
      .select("phone, headshot_processed_url, profile_completion_status, bank_account_last5, bank_name, bank_code, bank_account_name, passbook_cover_url")
      .eq("account_id", registration.account_id)
      .eq("workspace_id", registration.requested_workspace_id)
      .maybeSingle();

    if (profileLookupError || !currentProfile) {
      return NextResponse.json(
        {
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "找不到可確認的訪員補充資料。",
          },
        },
        { status: 404 },
      );
    }

    const missingRequirements = getMissingAssignmentRequirements(registration, currentProfile);
    if (missingRequirements.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "PROFILE_NOT_READY",
            message: `尚未符合可派案條件：${missingRequirements.join("、")}。`,
          },
        },
        { status: 409 },
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
            status: string;
            auth_invite_status: string;
            training_completed: boolean;
          } | null;
          error: unknown;
        }>;
      };
    };
  };
};

type VisitorProfileEligibilityRow = {
  phone: string | null;
  headshot_processed_url: string | null;
  profile_completion_status: string;
  bank_account_last5: string | null;
  bank_name: string | null;
  bank_code: string | null;
  bank_account_name: string | null;
  passbook_cover_url: string | null;
};

type VisitorProfileLookupClient = {
  from(table: "visitor_profiles"): {
    select(query: string): {
      eq(column: string, value: string): {
        eq(column: string, value: string): {
          maybeSingle(): Promise<{
            data: VisitorProfileEligibilityRow | null;
            error: unknown;
          }>;
        };
      };
    };
  };
};

function getMissingAssignmentRequirements(
  registration: {
    auth_invite_status: string;
    training_completed: boolean;
  },
  profile: VisitorProfileEligibilityRow,
) {
  const missing: string[] = [];
  if (registration.auth_invite_status !== "activated") missing.push("帳號尚未啟用");
  if (!registration.training_completed) missing.push("教育訓練未完成");
  if (!profile.phone) missing.push("手機資料");
  if (!profile.headshot_processed_url) missing.push("證件照");
  if (profile.profile_completion_status !== "submitted" && profile.profile_completion_status !== "verified") {
    missing.push("補充資料尚未送出");
  }
  if (!profile.bank_name || !profile.bank_code || !profile.bank_account_name || !profile.bank_account_last5) {
    missing.push("匯款銀行資料");
  }
  if (!profile.passbook_cover_url) missing.push("存摺附件");
  return missing;
}

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
