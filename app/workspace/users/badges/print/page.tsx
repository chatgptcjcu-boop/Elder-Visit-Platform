import { VisitorBadgeCard } from "@/components/badges/visitor-badge-card";
import { PrintButton } from "@/components/badges/print-button";
import { getBadgesByIds } from "@/lib/domain/visitor-badges";

export default async function VisitorBadgePrintPage({
  searchParams,
}: {
  searchParams: Promise<{ badgeIds?: string }>;
}) {
  const params = await searchParams;
  const badgeIds = (params.badgeIds ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  const badges = await getBadgesByIds(badgeIds);

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950 print:bg-white print:p-0">
      <style>{`
        @media print {
          .print-toolbar { display: none; }
          .badge-sheet { box-shadow: none; margin: 0; padding: 0; }
          .visitor-badge-card { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      <div className="print-toolbar mx-auto mb-4 flex max-w-5xl items-center justify-between rounded-lg border bg-white p-3">
        <div>
          <h1 className="font-semibold">訪員證列印</h1>
          <p className="text-sm text-slate-500">確認版面後使用瀏覽器列印，可輸出紙本或另存 PDF。</p>
        </div>
        <PrintButton />
      </div>

      <section className="badge-sheet mx-auto grid max-w-5xl gap-4 rounded-xl bg-white p-4 shadow-sm print:grid-cols-2 print:gap-3 print:p-0">
        {badges.map((badge) => (
          <VisitorBadgeCard key={badge.id} badge={badge} compact />
        ))}
        {badges.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-slate-500">
            找不到可列印的訪員證，請回到使用者管理重新產生。
          </div>
        )}
      </section>
    </main>
  );
}
