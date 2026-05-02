import { cn } from "@/lib/utils";

type TaskThreadItem = {
  author: string;
  content: string;
  tone: "default" | "system" | "warning";
};

export function TaskThread({ items }: { items: TaskThreadItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={`${item.author}-${item.content}`} className="flex gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold">
            {item.author.slice(0, 1)}
          </div>
          <div
            className={cn(
              "max-w-[40rem] rounded-lg border bg-background p-3 text-sm",
              item.tone === "system" && "border-primary/30 bg-primary/5",
              item.tone === "warning" && "border-accent/40 bg-accent/10",
            )}
          >
            <p className="font-medium">{item.author}</p>
            <p className="mt-1 leading-6 text-muted-foreground">{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
