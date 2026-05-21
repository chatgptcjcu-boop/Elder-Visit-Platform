"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardCheck, FilePenLine, Send, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getVisitDraftKey } from "@/lib/domain/offline-drafts";
import { visitSchedules } from "@/lib/domain/mock-data";

type WorkflowStep = "profile" | "tasks" | "visit" | "drafts" | "submitted";

export function VisitorWorkflowBar({
  active,
  submitted = false,
}: {
  active: WorkflowStep;
  submitted?: boolean;
}) {
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    setDraftCount(
      visitSchedules.filter((schedule) =>
        window.localStorage.getItem(getVisitDraftKey(schedule.id)),
      ).length,
    );
  }, []);

  const steps = [
    {
      key: "profile" as const,
      label: "資料",
      detail: "補齊個人資料",
      href: "/visitor/profile",
      icon: UserRound,
    },
    {
      key: "tasks" as const,
      label: "接案",
      detail: "選擇今日任務",
      href: "/visitor/tasks",
      icon: ClipboardCheck,
    },
    {
      key: "visit" as const,
      label: "填報",
      detail: "完成訪查",
      href: null,
      icon: FilePenLine,
    },
    {
      key: "drafts" as const,
      label: "草稿",
      detail: draftCount > 0 ? `${draftCount} 筆待續填` : "無待續填",
      href: "/visitor/drafts",
      icon: FilePenLine,
    },
    {
      key: "submitted" as const,
      label: "送出",
      detail: submitted ? "已完成" : "待完成",
      href: null,
      icon: submitted ? CheckCircle2 : Send,
    },
  ];

  return (
    <section className="rounded-lg border bg-card p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.key === active;
          const content = (
            <div
              className={`rounded-md border p-3 ${
                isActive ? "border-primary bg-primary/5" : "bg-background"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-semibold">{step.label}</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{step.detail}</p>
            </div>
          );

          return step.href ? (
            <Link key={step.key} href={step.href}>
              {content}
            </Link>
          ) : (
            <div key={step.key}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}
