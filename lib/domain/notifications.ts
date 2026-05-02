import type {
  IncidentDecision,
  IncidentDecisionResult,
  IncidentReport,
  NotificationTemplate,
} from "@/lib/domain/types";

export const incidentReports: IncidentReport[] = [
  {
    id: "incident_001",
    caseCode: "EV-115-0003",
    elderName: "張秀蘭",
    incidentType: "urgent_health",
    severity: "high",
    status: "notified",
    description: "訪員回報疑似急迫健康風險，需督導追蹤。",
  },
  {
    id: "incident_002",
    caseCode: "EV-115-0002",
    elderName: "陳水木",
    incidentType: "contact_failed",
    severity: "medium",
    status: "open",
    description: "第二次未遇，需確認是否改派或聯繫里長。",
  },
];

export const notificationTemplates: NotificationTemplate[] = [
  {
    id: "notification_incident_supervisor",
    name: "異常通報督導通知",
    channel: "in_app",
    eventKey: "incident.created",
    bodyTemplate: "{{elder_name}} 發生 {{incident_type}}，請督導處理。",
    active: true,
  },
  {
    id: "notification_audit_blocked",
    name: "稽核阻擋通知",
    channel: "email",
    eventKey: "audit.blocked",
    bodyTemplate: "{{case_code}} 稽核未通過，原因：{{reason}}。",
    active: true,
  },
  {
    id: "notification_sms_reserved",
    name: "簡訊通知預留",
    channel: "sms",
    eventKey: "visit.reminder",
    bodyTemplate: "您有一筆訪查任務待處理。",
    active: false,
  },
];

export function renderNotification(template: NotificationTemplate, variables: Record<string, string>) {
  return Object.entries(variables).reduce(
    (content, [key, value]) => content.replaceAll(`{{${key}}}`, value),
    template.bodyTemplate,
  );
}

export function handleIncidentDecision(decision: IncidentDecision): IncidentDecisionResult {
  const incident = incidentReports.find((item) => item.id === decision.incidentId);

  if (!incident) {
    return {
      incidentId: decision.incidentId,
      status: "open",
      message: "找不到異常通報，請重新整理佇列。",
      handledAt: new Date().toISOString(),
      notificationPreview: null,
    };
  }

  if (decision.action === "resolve") {
    return {
      incidentId: incident.id,
      status: "resolved",
      message: `${incident.caseCode} 已標記結案。`,
      handledAt: new Date().toISOString(),
      notificationPreview: null,
    };
  }

  const template = notificationTemplates.find(
    (item) => item.id === "notification_incident_supervisor",
  );
  const notificationPreview = template
    ? renderNotification(template, {
        elder_name: incident.elderName,
        incident_type: incident.incidentType,
      })
    : null;

  return {
    incidentId: incident.id,
    status: "notified",
    message: `${incident.caseCode} 已建立督導通知。`,
    handledAt: new Date().toISOString(),
    notificationPreview,
  };
}
