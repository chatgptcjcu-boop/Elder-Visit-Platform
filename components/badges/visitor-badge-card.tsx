import type { VisitorBadge } from "@/lib/domain/visitor-badges";

export function VisitorBadgeCard({ badge, compact = false }: { badge: VisitorBadge; compact?: boolean }) {
  const snapshot = badge.snapshot;

  return (
    <article className="visitor-badge-card overflow-hidden rounded-xl border bg-white text-slate-950 shadow-sm">
      <div className="bg-[linear-gradient(135deg,#0f766e,#4fb285)] px-4 py-3 text-white">
        <p className="text-xs font-medium tracking-[0.18em]">ELDER VISIT BADGE</p>
        <h2 className="mt-1 text-lg font-bold">獨居長者訪查人員證</h2>
      </div>
      <div className={`grid gap-4 p-4 ${compact ? "" : "sm:grid-cols-[112px_1fr_132px]"}`}>
        <div className="flex justify-center">
          {snapshot.headshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={snapshot.headshotUrl}
              alt={`${snapshot.fullName} 證件照`}
              className="h-32 w-24 rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-32 w-24 items-center justify-center rounded-md border bg-slate-100 text-xs text-slate-500">
              證件照
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">姓名</p>
          <p className="text-2xl font-bold">{snapshot.fullName}</p>
          <p className="mt-1 break-words text-sm text-slate-600">{snapshot.displayName}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <BadgeField label="單位" value={snapshot.rootUnitName ?? "未填"} />
            <BadgeField label="科室" value={snapshot.departmentName ?? "未填"} />
            <BadgeField label="職稱" value={snapshot.jobTitle ?? "未填"} />
            <BadgeField label="年度" value={snapshot.validYearLabel} />
          </div>

          <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2">
            <p className="text-xs text-emerald-800">訪員編碼</p>
            <p className="break-all font-semibold text-emerald-950">{badge.visitorCode}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3">
          <div
            className="rounded-md border bg-white p-2"
            dangerouslySetInnerHTML={{ __html: badge.qrSvg }}
            aria-label="訪員證驗證 QR Code"
          />
          <div className="w-full rounded-md border bg-slate-50 px-3 py-2 text-center">
            <p className="text-xs text-slate-500">領取序號</p>
            <p className="font-mono text-base font-bold">{badge.badgeSerial}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-2 border-t bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:grid-cols-3">
        <p>證號：{badge.badgeNumber}</p>
        <p>有效：{badge.validFrom} 至 {badge.validUntil ?? "未設定"}</p>
        <p>狀態：{badge.status === "active" ? "有效" : "已停用"}</p>
      </div>
    </article>
  );
}

function BadgeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}
