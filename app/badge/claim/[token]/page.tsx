import { BadgeClaimPanel } from "@/components/badges/badge-claim-panel";

export default async function BadgeClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-6">
      <section className="mx-auto max-w-md">
        <BadgeClaimPanel token={token} />
      </section>
    </main>
  );
}
