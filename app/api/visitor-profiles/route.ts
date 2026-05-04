import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAnyCapability, requireCapability } from "@/lib/api/authorization";
import { visitors as fallbackVisitors } from "@/lib/domain/assignments";
import type { VisitorProfile, WorkspaceModuleKey } from "@/lib/domain/types";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const forbidden = requireAnyCapability(request, ["users.manage", "assignment.manage"]);
  if (forbidden) return forbidden;

  const profiles = await getSupabaseVisitorProfiles();

  return NextResponse.json({
    data: profiles.length > 0 ? profiles : fallbackVisitors,
    source: profiles.length > 0 ? "supabase" : "fallback",
  });
}

export async function PUT(request: NextRequest) {
  const forbidden = requireCapability(request, "users.update");
  if (forbidden) return forbidden;

  const body = (await request.json()) as { profiles?: VisitorProfile[] };
  const profiles = body.profiles ?? [];
  const result = await replaceSupabaseVisitorProfiles(profiles);

  if (!result.ok) {
    return NextResponse.json({
      data: profiles,
      source: "local_fallback",
      warning: result.message,
    });
  }

  return NextResponse.json({
    data: await getSupabaseVisitorProfiles(),
    source: "supabase",
  });
}

async function getSupabaseVisitorProfiles(): Promise<VisitorProfile[]> {
  try {
    const supabase = await createClient();
    const workspaceId = await getActiveWorkspaceId();
    if (!workspaceId) {
      return [];
    }

    const { data, error } = await (supabase as unknown as VisitorProfileClient)
      .from("visitor_profiles")
      .select(
        `
          id,
          full_name,
          worker_type,
          district_coverage,
          village_coverage,
          active_task_count,
          max_daily_tasks,
          trained_modules,
          visitor_certificate_no,
          certificate_status,
          training_date,
          bank_account_last5,
          remittance_ready,
          status
        `,
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapVisitorProfileRow);
  } catch {
    return [];
  }
}

async function replaceSupabaseVisitorProfiles(profiles: VisitorProfile[]) {
  try {
    const supabase = await createClient();
    const workspaceId = await getActiveWorkspaceId();
    if (!workspaceId) {
      return { ok: false, message: "找不到可寫入的工作空間。" };
    }

    const deleteResult = await (supabase as unknown as VisitorProfileDeleteClient)
      .from("visitor_profiles")
      .delete()
      .eq("workspace_id", workspaceId);

    if (deleteResult.error) {
      return { ok: false, message: "Supabase 尚未允許刪除既有資格檔，已改用本機暫存。" };
    }

    const rows = profiles.map((profile) => ({
      workspace_id: workspaceId,
      full_name: profile.fullName,
      worker_type: profile.workerType,
      district_coverage: profile.districtCoverage,
      village_coverage: profile.villageCoverage,
      active_task_count: profile.activeTaskCount,
      max_daily_tasks: profile.maxDailyTasks,
      trained_modules: profile.trainedModules,
      visitor_certificate_no: profile.visitorCertificateNo,
      certificate_status: profile.certificateStatus,
      training_date: profile.trainingDate,
      bank_account_last5: profile.bankAccountLast5,
      remittance_ready: profile.remittanceReady,
      status: profile.status,
    }));

    if (rows.length === 0) {
      return { ok: true, message: "已清空資格檔。" };
    }

    const insertResult = await (supabase as unknown as VisitorProfileInsertClient)
      .from("visitor_profiles")
      .insert(rows);

    if (insertResult.error) {
      return { ok: false, message: "Supabase 尚未允許新增資格檔，已改用本機暫存。" };
    }

    return { ok: true, message: "已寫入 Supabase visitor_profiles。" };
  } catch {
    return { ok: false, message: "Supabase 寫入失敗，已改用本機暫存。" };
  }
}

async function getActiveWorkspaceId() {
  const supabase = await createClient();
  const { data, error } = await (supabase as unknown as WorkspaceClient)
    .from("workspaces")
    .select("id")
    .eq("status", "active")
    .limit(1);

  if (error || !data?.[0]) {
    return null;
  }

  return data[0].id;
}

function mapVisitorProfileRow(row: VisitorProfileRow): VisitorProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    workerType: normalizeWorkerType(row.worker_type),
    districtCoverage: normalizeStringArray(row.district_coverage, ["北區"]),
    villageCoverage: normalizeStringArray(row.village_coverage, []),
    activeTaskCount: row.active_task_count ?? 0,
    maxDailyTasks: row.max_daily_tasks ?? 6,
    trainedModules: normalizeWorkspaceModules(row.trained_modules),
    visitorCertificateNo: row.visitor_certificate_no,
    certificateStatus: normalizeCertificateStatus(row.certificate_status),
    trainingDate: row.training_date,
    bankAccountLast5: row.bank_account_last5,
    remittanceReady: Boolean(row.remittance_ready),
    status: normalizeVisitorStatus(row.status),
  };
}

function normalizeWorkerType(value: string | null): VisitorProfile["workerType"] {
  if (value === "social_affairs" || value === "civil_affairs" || value === "general") {
    return value;
  }

  return "general";
}

function normalizeCertificateStatus(value: string | null): VisitorProfile["certificateStatus"] {
  if (value === "valid" || value === "missing" || value === "expired") {
    return value;
  }

  return "missing";
}

function normalizeVisitorStatus(value: string): VisitorProfile["status"] {
  if (value === "available" || value === "busy" || value === "inactive") {
    return value;
  }

  return "available";
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const values = value.filter((item): item is string => typeof item === "string");
  return values.length > 0 ? values : fallback;
}

function normalizeWorkspaceModules(value: unknown): WorkspaceModuleKey[] {
  const modules = normalizeStringArray(value, []);
  return modules.filter((item): item is WorkspaceModuleKey =>
    ["visit_form", "consent", "audit", "payment", "assignment"].includes(item),
  );
}

type WorkspaceClient = {
  from(table: "workspaces"): {
    select(query: string): {
      eq(column: string, value: string): {
        limit(count: number): Promise<{
          data: Array<{ id: string }> | null;
          error: unknown;
        }>;
      };
    };
  };
};

type VisitorProfileClient = {
  from(table: "visitor_profiles"): {
    select(query: string): {
      eq(column: string, value: string): {
        order(column: string, options: { ascending: boolean }): Promise<{
          data: VisitorProfileRow[] | null;
          error: unknown;
        }>;
      };
    };
  };
};

type VisitorProfileDeleteClient = {
  from(table: "visitor_profiles"): {
    delete(): {
      eq(column: string, value: string): Promise<{ error: unknown }>;
    };
  };
};

type VisitorProfileInsertClient = {
  from(table: "visitor_profiles"): {
    insert(rows: Array<Record<string, unknown>>): Promise<{ error: unknown }>;
  };
};

type VisitorProfileRow = {
  id: string;
  full_name: string;
  worker_type: string | null;
  district_coverage: unknown;
  village_coverage: unknown;
  active_task_count: number | null;
  max_daily_tasks: number | null;
  trained_modules: unknown;
  visitor_certificate_no: string | null;
  certificate_status: string | null;
  training_date: string | null;
  bank_account_last5: string | null;
  remittance_ready: boolean | null;
  status: string;
};
