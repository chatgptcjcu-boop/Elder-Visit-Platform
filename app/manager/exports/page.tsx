import { AppShell } from "@/components/layout/app-shell";
import { ExportTool } from "@/components/export/export-tool";
import { PaymentBatchPanel } from "@/components/export/payment-batch-panel";

export default function ExportsPage() {
  return (
    <AppShell active="exports">
      <PaymentBatchPanel />
      <ExportTool />
    </AppShell>
  );
}
