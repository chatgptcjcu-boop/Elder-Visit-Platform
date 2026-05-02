export function WorkspaceHeader({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <header className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">{title}</h1>
        </div>
        <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {status}
        </span>
      </div>
    </header>
  );
}
