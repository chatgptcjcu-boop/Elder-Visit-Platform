import { getUsagePercent } from "@/lib/domain/limits";
import type { PlanLimitUsage } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function LimitUsageList({ limits }: { limits: PlanLimitUsage[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {limits.map((limit) => {
        const percent = getUsagePercent(limit);
        return (
          <div key={limit.key} className="rounded-lg border bg-background p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{limit.label}</span>
              <span className="text-muted-foreground">
                {limit.used} / {limit.limit}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary",
                  percent >= 80 && "bg-accent",
                  percent >= 100 && "bg-destructive",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
