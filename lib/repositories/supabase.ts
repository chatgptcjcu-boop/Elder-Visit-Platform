import { mockRepository } from "@/lib/repositories/mock";
import { createClient } from "@/lib/supabase/server";
import type { ElderCase, PlatformBlueprint, Workspace } from "@/lib/domain/types";
import type { AppRepository, CaseRegistryItem, WorkspaceWithUnit } from "@/lib/repositories/types";

export const supabaseRepository: AppRepository = {
  async getCurrentWorkspace() {
    const workspaces = await getSupabaseWorkspaces();
    return workspaces[0] ?? mockRepository.getCurrentWorkspace();
  },
  async getWorkspaces() {
    const workspaces = await getSupabaseWorkspaces();

    if (workspaces.length === 0) {
      return mockRepository.getWorkspaces();
    }

    return workspaces;
  },
  async getDashboardMetrics() {
    return mockRepository.getDashboardMetrics();
  },
  async getActivityItems() {
    return mockRepository.getActivityItems();
  },
  async getVisitorTasks() {
    return mockRepository.getVisitorTasks();
  },
  async getCaseRegistry() {
    const cases = await getSupabaseCaseRegistry();
    return cases.length > 0 ? cases : mockRepository.getCaseRegistry();
  },
  async getCaseRegistrySummary() {
    const cases = await this.getCaseRegistry();
    return {
      total: cases.length,
      highRisk: cases.filter((elderCase) => elderCase.riskLevel === "high").length,
      pending: cases.filter((elderCase) => elderCase.status === "pending").length,
      assigned: cases.filter((elderCase) => elderCase.status === "assigned").length,
      closed: cases.filter((elderCase) => elderCase.status === "closed").length,
    };
  },
};

async function getSupabaseWorkspaces(): Promise<WorkspaceWithUnit[]> {
  try {
    const supabase = await createClient();
    const fallbackWorkspace = await mockRepository.getCurrentWorkspace();
    const fallbackWorkspaces = await mockRepository.getWorkspaces();
    const fallbackUnit = fallbackWorkspaces.find((workspace) => workspace.id === fallbackWorkspace.id)?.unit;
    const { data, error } = await supabase
      .from("workspaces")
      .select(
        `
          id,
          unit_id,
          workspace_name,
          workspace_type,
          status,
          units (
            id,
            unit_name,
            unit_type,
            city,
            district
          ),
          platform_blueprints (
            id,
            blueprint_name,
            blueprint_type,
            description,
            config
          )
        `,
      )
      .eq("status", "active")
      .limit(10);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((row) => mapWorkspaceRow(row, fallbackWorkspace, fallbackUnit));
  } catch {
    return [];
  }
}

type SupabaseWorkspaceRow = {
  id: string;
  unit_id: string;
  workspace_name: string;
  workspace_type: string | null;
  status: string;
  units:
    | {
        id: string;
        unit_name: string;
        unit_type: string | null;
        city: string | null;
        district: string | null;
      }
    | null
    | Array<{
        id: string;
        unit_name: string;
        unit_type: string | null;
        city: string | null;
        district: string | null;
      }>;
  platform_blueprints:
    | {
        id: string;
        blueprint_name: string;
        blueprint_type: string;
        description: string | null;
        config: unknown;
      }
    | null
    | Array<{
        id: string;
        blueprint_name: string;
        blueprint_type: string;
        description: string | null;
        config: unknown;
      }>;
};

function mapWorkspaceRow(
  row: SupabaseWorkspaceRow,
  fallback: Workspace,
  fallbackUnit: WorkspaceWithUnit["unit"],
): WorkspaceWithUnit {
  const unit = Array.isArray(row.units) ? row.units[0] : row.units;
  const blueprintRow = Array.isArray(row.platform_blueprints)
    ? row.platform_blueprints[0]
    : row.platform_blueprints;
  const blueprint: PlatformBlueprint = blueprintRow
    ? {
        id: blueprintRow.id,
        name: blueprintRow.blueprint_name,
        type: fallback.type,
        version: "1.0.0",
        firstMarketFit: getBlueprintFirstMarketFit(blueprintRow.config),
        description: blueprintRow.description ?? fallback.blueprint.description,
      }
    : fallback.blueprint;

  return {
    ...fallback,
    id: row.id,
    unitId: row.unit_id,
    name: row.workspace_name,
    type: fallback.type,
    status: row.status === "active" ? "active" : fallback.status,
    blueprint,
    unit: unit
      ? {
          id: unit.id,
          unitName: unit.unit_name,
          unitType: fallbackUnit?.unitType ?? "government",
          city: unit.city ?? "",
          district: unit.district ?? "",
        }
      : fallbackUnit,
  };
}

function getBlueprintFirstMarketFit(config: unknown) {
  if (!config || typeof config !== "object" || !("first_market_fit" in config)) {
    return true;
  }

  return Boolean(config.first_market_fit);
}

async function getSupabaseCaseRegistry(): Promise<CaseRegistryItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as unknown as SupabaseCaseClient)
      .from("elder_cases")
      .select(
        `
          id,
          case_code,
          name,
          birth_date,
          phone,
          address,
          district,
          risk_level,
          status,
          visit_schedule (
            visit_date,
            assignment_reason
          )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((row): CaseRegistryItem => {
      const schedules = Array.isArray(row.visit_schedule) ? row.visit_schedule : [];
      const latestSchedule = schedules.at(-1);

      return {
        id: row.id,
        caseCode: row.case_code,
        name: row.name,
        age: getAgeFromBirthDate(row.birth_date),
        phone: row.phone ?? "未填寫",
        address: row.address ?? "未填寫",
        district: row.district ?? "未填寫",
        riskLevel: normalizeRiskLevel(row.risk_level),
        status: normalizeCaseStatus(row.status),
        visitCount: schedules.length,
        latestVisitDate: latestSchedule?.visit_date ?? null,
        latestAssignmentReason: latestSchedule?.assignment_reason ?? "尚未派案",
      };
    });
  } catch {
    return [];
  }
}

function getAgeFromBirthDate(birthDate: string | null) {
  if (!birthDate) {
    return 0;
  }

  const birthYear = new Date(birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  return Number.isFinite(birthYear) ? currentYear - birthYear : 0;
}

type SupabaseCaseClient = {
  from(table: "elder_cases"): {
    select(query: string): {
      order(column: string, options: { ascending: boolean }): {
        limit(count: number): Promise<{
          data: SupabaseCaseRow[] | null;
          error: unknown;
        }>;
      };
    };
  };
};

type SupabaseCaseRow = {
  id: string;
  case_code: string;
  name: string;
  birth_date: string | null;
  phone: string | null;
  address: string | null;
  district: string | null;
  risk_level: string | null;
  status: string;
  visit_schedule:
    | Array<{
        visit_date: string | null;
        assignment_reason: string | null;
      }>
    | null;
};

function normalizeRiskLevel(riskLevel: string | null): ElderCase["riskLevel"] {
  if (riskLevel === "low" || riskLevel === "medium" || riskLevel === "high") {
    return riskLevel;
  }

  return "medium";
}

function normalizeCaseStatus(status: string): ElderCase["status"] {
  if (
    status === "pending" ||
    status === "assigned" ||
    status === "visited" ||
    status === "auditing" ||
    status === "closed"
  ) {
    return status;
  }

  return "pending";
}
