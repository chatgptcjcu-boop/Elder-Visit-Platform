import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { VisitDialogueForm } from "@/components/visitor/visit-dialogue-form";
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
      <VisitDialogueForm elderCase={elderCase} schedule={schedule} />
    </AppShell>
  );
}
