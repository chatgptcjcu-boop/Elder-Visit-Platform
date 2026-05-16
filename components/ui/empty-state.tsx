import type { LucideIcon } from "lucide-react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Leaf,
  title,
  description,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border bg-card p-5 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-3 text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 leading-6">{description}</p>
    </section>
  );
}
