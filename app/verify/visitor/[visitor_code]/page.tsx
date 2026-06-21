import Link from "next/link";
import { VisitorBadgeCard } from "@/components/badges/visitor-badge-card";
import { getPublicVisitorBadge } from "@/lib/domain/visitor-badges";

export default async function VisitorVerifyPage({
  params,
}: {
  params: Promise<{ visitor_code: string }>;
}) {
  const { visitor_code: visitorCode } = await params;
  const badge = await getPublicVisitorBadge(decodeURIComponent(visitorCode));

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-6">
      <section className="mx-auto max-w-xl">
        <div className="mb-4 rounded-xl border bg-white p-4">
          <p className="text-sm font-medium text-emerald-700">訪員證查驗</p>
          <h1 className="mt-1 text-2xl font-bold">查驗結果</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            此頁僅用於確認訪員證是否有效，不提供完整個資查詢。
          </p>
        </div>

        {badge ? (
          <>
            <div className="mb-4 rounded-xl border border-emerald-200 bg-white p-4 text-emerald-800">
              <p className="font-semibold">此訪員證目前有效</p>
              <p className="mt-1 text-sm">訪員編碼：{badge.visitorCode}</p>
            </div>
            <VisitorBadgeCard badge={badge} compact />
          </>
        ) : (
          <div className="rounded-xl border border-rose-200 bg-white p-6 text-rose-800">
            <p className="text-lg font-semibold">查無有效訪員證</p>
            <p className="mt-2 text-sm leading-6">
              可能原因包含證件尚未發出、已停用、已過期，或 QR Code 資料不正確。
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-4 inline-flex rounded-md border bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          返回系統入口
        </Link>
      </section>
    </main>
  );
}
