import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <section className="rounded-lg border bg-card p-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
          <WifiOff className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">目前離線</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          已快取的頁面仍可瀏覽。訪查草稿會保存在此裝置，恢復連線後再送出。
        </p>
        <Button asChild className="mt-5 w-full">
          <Link href="/visitor/tasks">回到任務</Link>
        </Button>
      </section>
    </main>
  );
}
