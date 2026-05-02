import type { PlanLimitUsage } from "@/lib/domain/types";

export type PricingPlanSummary = {
  id: string;
  name: string;
  targetMarket: string;
  model: "per_unit" | "per_workspace" | "per_user" | "per_case" | "addon_modules";
  includedModules: string[];
  limits: PlanLimitUsage[];
};

export const pricingPlans: PricingPlanSummary[] = [
  {
    id: "plan_basic_governance",
    name: "公益治理基礎版",
    targetMarket: "宮廟、社區、志工隊",
    model: "per_unit",
    includedModules: ["個人帳號", "單位管理", "Workspace", "表單引擎", "任務管理", "基本報表"],
    limits: [
      { key: "max_users", label: "使用者", limit: 10, used: 3 },
      { key: "max_workspaces", label: "工作空間", limit: 1, used: 1 },
      { key: "max_forms", label: "表單", limit: 8, used: 2 },
    ],
  },
  {
    id: "plan_elder_visit",
    name: "社福訪查專案版",
    targetMarket: "公所、社福單位、協會",
    model: "per_workspace",
    includedModules: ["動態名冊匯入", "派案規則", "訪查表單", "稽核規則", "參數化核銷", "政府格式匯出"],
    limits: [
      { key: "max_users", label: "使用者", limit: 30, used: 12 },
      { key: "max_workspaces", label: "工作空間", limit: 3, used: 1 },
      { key: "max_cases", label: "案件", limit: 500, used: 248 },
      { key: "max_exports", label: "匯出", limit: 50, used: 9 },
    ],
  },
  {
    id: "plan_esg_sponsor",
    name: "ESG 贊助版",
    targetMarket: "企業、基金會、公益合作專案",
    model: "addon_modules",
    includedModules: ["贊助商管理", "LOGO 授權紀錄", "曝光方案", "KPI 成效報表", "公益成果匯出"],
    limits: [
      { key: "max_workspaces", label: "工作空間", limit: 5, used: 0 },
      { key: "max_exports", label: "匯出", limit: 100, used: 0 },
      { key: "max_notifications", label: "通知", limit: 1000, used: 0 },
    ],
  },
];
