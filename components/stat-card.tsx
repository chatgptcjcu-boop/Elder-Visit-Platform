import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-lg border bg-card p-4">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary/70" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}
