import type { VisitSubmission } from "@/lib/domain/types";

export type VisitDraft = Omit<VisitSubmission, "scheduleId"> & {
  updatedAt: string;
};

export function getVisitDraftKey(scheduleId: string) {
  return `elder-visit-platform:visit-draft:${scheduleId}`;
}

export function createVisitDraft(submission: Omit<VisitSubmission, "scheduleId">): VisitDraft {
  return {
    ...submission,
    updatedAt: new Date().toISOString(),
  };
}
