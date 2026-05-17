import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function PageIntro({
  icon: Icon,
  eyebrow,
  title,
  description,
  aside,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
              <h1 className={`${eyebrow ? "mt-1 " : ""}text-2xl font-semibold sm:text-3xl`}>
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </div>
        {aside}
      </div>
    </section>
  );
}
