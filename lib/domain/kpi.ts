import { kpiTemplates } from "@/lib/domain/engines";
import type { KpiReport, KpiResultItem } from "@/lib/domain/types";

const lowerIsBetter = new Set(["refusal_rate", "follow_up_hours"]);

export function createKpiReport(): KpiReport {
  const template = kpiTemplates[0];
  const items = template.items.map((item, index): KpiResultItem => {
    const gap = item.currentValue - item.targetValue;
    const status = getKpiStatus(item.key, item.currentValue, item.targetValue);

    return {
      ...item,
      status,
      gap,
      trend: index % 3 === 0 ? "up" : index % 3 === 1 ? "down" : "flat",
    };
  });
  const warnings = items
    .filter((item) => item.status === "missed")
    .map((item) => `${item.label} 未達標，需列入本週追蹤。`);

  return {
    id: template.id,
    name: template.name,
    periodLabel: "115 年 4 月",
    generatedAt: new Date().toISOString(),
    items,
    warnings,
  };
}

function getKpiStatus(key: string, currentValue: number, targetValue: number) {
  if (lowerIsBetter.has(key)) {
    if (currentValue <= targetValue) {
      return "met";
    }

    return currentValue <= targetValue * 1.15 ? "watch" : "missed";
  }

  if (currentValue >= targetValue) {
    return "met";
  }

  return currentValue >= targetValue * 0.85 ? "watch" : "missed";
}
