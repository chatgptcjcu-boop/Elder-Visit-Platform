"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Send, TriangleAlert } from "lucide-react";
import { useCanAny } from "@/components/auth/permission-provider";
import { WorkgroupCommunicationCenter } from "@/components/manage/workgroup-communication-center";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/ui/page-intro";
import type { IncidentDecisionResult, IncidentReport, NotificationTemplate } from "@/lib/domain/types";

export function NotificationDashboard() {
  const canHandleIncident = useCanAny(["notifications.manage", "notifications.send"]);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
  const [decision, setDecision] = useState<IncidentDecisionResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      const response = await fetch("/api/notifications");
      const result = (await response.json()) as {
        data?: {
          incidentReports: IncidentReport[];
          notificationTemplates: NotificationTemplate[];
        };
        error?: { message?: string };
      };

      if (!response.ok) {
        setMessage(result.error?.message ?? "目前角色無法讀取通報資料。");
        return;
      }

      setIncidentReports(result.data?.incidentReports ?? []);
      setNotificationTemplates(result.data?.notificationTemplates ?? []);
    }

    void loadNotifications();
  }, []);

  async function handleIncident(incidentId: string, action: "notify_supervisor" | "resolve") {
    setMessage(null);
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ incidentId, action, note: "通知頁快速處理" }),
    });
    const result = (await response.json()) as {
      data?: IncidentDecisionResult;
      error?: { message?: string };
    };
    if (!response.ok) {
      setMessage(result.error?.message ?? "目前角色沒有處理通報權限。");
      return;
    }
    setDecision(result.data ?? null);
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        icon={Bell}
        eyebrow="異常與通知"
        title="異常通報與通知模板"
        description="異常可觸發督導通知、KPI 與後續稽核；外部通道先保留，不綁定品牌識別。"
        aside={
          <div className="grid min-w-[14rem] grid-cols-2 gap-2 text-sm">
            <SummaryStat label="待處理" value={`${incidentReports.length}`} />
            <SummaryStat label="通知模板" value={`${notificationTemplates.length}`} />
          </div>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,1fr)]">
        <article className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">異常通報</h2>
          </div>
          <div className="mt-4 space-y-3">
            {incidentReports.map((incident) => (
              <div key={incident.id} className="rounded-md border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{incident.elderName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{incident.caseCode}</p>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                    {incident.severity} · {incident.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {incident.description}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    disabled={!canHandleIncident}
                    onClick={() => handleIncident(incident.id, "notify_supervisor")}
                  >
                    <Send className="h-4 w-4" />
                    通知督導
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canHandleIncident}
                    onClick={() => handleIncident(incident.id, "resolve")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    標記結案
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">通知模板</h2>
          </div>
          <div className="mt-4 space-y-3">
            {notificationTemplates.map((template) => (
              <div key={template.id} className="rounded-md border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{template.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.eventKey} · {template.channel}
                    </p>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                    {template.active ? "啟用" : "預留"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {template.bodyTemplate}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {decision && (
        <section className="rounded-lg border bg-card p-4">
          <p className="font-semibold">{decision.message}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            處理時間：{new Date(decision.handledAt).toLocaleString("zh-TW")}
          </p>
          {decision.notificationPreview && (
            <p className="mt-3 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
              {decision.notificationPreview}
            </p>
          )}
        </section>
      )}

      {message && (
        <section className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">{message}</p>
        </section>
      )}

      <WorkgroupCommunicationCenter />
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
