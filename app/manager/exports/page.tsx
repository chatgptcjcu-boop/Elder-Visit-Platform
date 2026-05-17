import { AppShell } from "@/components/layout/app-shell";
import { ExportTool } from "@/components/export/export-tool";
import { PaymentBatchPanel } from "@/components/export/payment-batch-panel";
import { ManagementWorkflowBar } from "@/components/manage/management-workflow-bar";

export default function ExportsPage() {
  return (
    <AppShell active="exports">
      <ManagementWorkflowBar active="exports" />
      <PaymentBatchPanel />
      <ExportTool />
    </AppShell>
  );
}
