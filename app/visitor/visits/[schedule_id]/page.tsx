import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { VisitDialogueForm } from "@/components/visitor/visit-dialogue-form";
import { VisitorWorkflowBar } from "@/components/visitor/visitor-workflow-bar";
import { getCase, getVisitSchedule } from "@/lib/domain/mock-data";

export default async function VisitDetailPage({
  params,
}: {
  params: Promise<{ schedule_id: string }>;
}) {
  const { schedule_id: scheduleId } = await params;
  const schedule = getVisitSchedule(scheduleId);

  if (!schedule) {
    notFound();
  }

  const elderCase = getCase(schedule.caseId);

  if (!elderCase) {
    notFound();
  }

  return (
    <AppShell active="tasks">
      <VisitorWorkflowBar active="visit" />
      <VisitDialogueForm elderCase={elderCase} schedule={schedule} />
    </AppShell>
  );
}
