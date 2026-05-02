export default function Loading() {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-4">
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-64 max-w-full animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-16 animate-pulse rounded bg-muted" />
              <div className="h-16 animate-pulse rounded bg-muted" />
              <div className="h-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
