import { Building2, FileBadge2, Handshake, ShieldCheck } from "lucide-react";
import { SponsorLogoMark } from "@/components/sponsor/sponsor-logo";
import {
  getPrimarySponsor,
  getSponsorPlacementPlan,
  sponsorPartners,
} from "@/lib/domain/sponsors";

const statusLabel = {
  active: "已模擬",
  recommended: "建議加入",
  planned: "後續規劃",
};

const exposureLabel = {
  subtle: "低調露出",
  standard: "標準聯名",
  featured: "重點露出",
};

export function SponsorPlacementOverview() {
  const primarySponsor = getPrimarySponsor();
  const placements = getSponsorPlacementPlan();

  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start gap-3">
          <SponsorLogoMark sponsor={primarySponsor} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">贊助企業聯名模擬</p>
            <h2 className="mt-1 text-lg font-semibold">{primarySponsor.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {primarySponsor.contributionLabel}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm">
          <InfoRow icon={Building2} label="合作類型" value={primarySponsor.industry} />
          <InfoRow icon={Handshake} label="露出層級" value={exposureLabel[primarySponsor.visibilityLevel]} />
          <InfoRow
            icon={FileBadge2}
            label="合約期間"
            value={`${primarySponsor.activeFrom} 至 ${primarySponsor.activeTo}`}
          />
        </div>

        <div className="mt-4 rounded-md border border-primary/15 bg-primary/5 p-3 text-sm text-muted-foreground">
          建議企業聯名先放在總覽、成果報告、登入頁或完成頁，不放在個資表單與同意書填寫區。
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">露出位置規劃</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              以不干擾工作、可治理、可稽核為原則。
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {sponsorPartners.length} 家
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {placements.map((placement) => (
            <article key={placement.key} className="rounded-lg border bg-background p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.03]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{placement.label}</p>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {statusLabel[placement.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{placement.location}</p>
                </div>
                <span className="shrink-0 rounded-md border px-2 py-1 text-xs text-muted-foreground">
                  {exposureLabel[placement.exposureLevel]}
                </span>
              </div>
              <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {placement.governanceNote}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background p-3">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}
