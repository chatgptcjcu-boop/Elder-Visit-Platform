import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireAnyCapability, requireCapability } from "@/lib/api/authorization";
import {
  workgroupMessageRecipients,
  workgroupMessageReplies,
  workgroupMessages,
} from "@/lib/domain/communications";
import {
  handleIncidentDecision,
  incidentReports,
  notificationTemplates,
} from "@/lib/domain/notifications";
import type { IncidentDecision } from "@/lib/domain/types";

export async function GET(request: NextRequest) {
  const forbidden = requireCapability(request, "notifications.manage");
  if (forbidden) return forbidden;

  return NextResponse.json({
    data: {
      incidentReports,
      notificationTemplates,
      workgroupMessages,
      workgroupMessageRecipients,
      workgroupMessageReplies,
    },
  });
}

export async function POST(request: NextRequest) {
  const forbidden = requireAnyCapability(request, ["notifications.manage", "notifications.send"]);
  if (forbidden) return forbidden;

  const decision = (await request.json()) as IncidentDecision;

  return NextResponse.json({
    data: handleIncidentDecision(decision),
  });
}
