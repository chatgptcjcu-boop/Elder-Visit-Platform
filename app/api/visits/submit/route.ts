import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireCapability } from "@/lib/api/authorization";
import type { VisitSubmission } from "@/lib/domain/types";
import { getVisitFormFlowItems } from "@/lib/domain/visit-form-flow";
import { getPaymentEligibility, validateVisitSubmission } from "@/lib/domain/visits";

export async function POST(request: NextRequest) {
  const forbidden = requireCapability(request, "visits.submit");
  if (forbidden) return forbidden;

  const submission = (await request.json()) as VisitSubmission;
  const validation = validateVisitSubmission(submission);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "VALIDATION_FAILED",
        missing: validation.missing,
      },
      { status: 400 },
    );
  }

  const paymentEligibility = getPaymentEligibility(submission);

  return NextResponse.json({
    data: {
      status: "submitted",
      scheduleId: submission.scheduleId,
      auditState: paymentEligibility.eligible ? "ready_for_audit" : "needs_review",
      paymentEligibility,
      forms: getVisitFormFlowItems({
        gov_social_worker_confidentiality_115: "completed",
        gov_civil_affairs_confidentiality_115: "completed",
        gov_personal_data_consent_115: submission.consentSigned ? "completed" : "blocked",
        gov_care_visit_115: validation.ok ? "completed" : "needs_review",
      }),
      nextStep: paymentEligibility.eligible ? "已送出，待督導稽核" : "已送出，需主管覆核",
      logs: ["visit_records", "workflow_instance_logs", "workspace_activity_logs"],
    },
  });
}
