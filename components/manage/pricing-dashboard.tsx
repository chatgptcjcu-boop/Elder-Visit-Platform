import { CreditCard } from "lucide-react";
import { LimitUsageList } from "@/components/workspace/limit-usage-list";
import { pricingPlans } from "@/lib/domain/pricing";

export function PricingDashboard() {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium text-primary">Pricing Engine</p>
        <h1 className="mt-2 text-2xl font-semibold">方案與使用限制</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pricing 不只顯示價格，也必須限制 Workspace、案件、匯出、表單與通知使用量。
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {pricingPlans.map((plan) => (
          <article key={plan.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-secondary p-2">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.targetMarket}</p>
              </div>
            </div>
            <p className="mt-4 rounded-md bg-secondary px-2 py-1 text-xs font-medium">
              {plan.model}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.includedModules.map((module) => (
                <span key={module} className="rounded-md border bg-background px-2 py-1 text-xs">
                  {module}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <LimitUsageList limits={plan.limits} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
