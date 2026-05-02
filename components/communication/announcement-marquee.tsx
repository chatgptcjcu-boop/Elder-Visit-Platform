"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import {
  getActiveMarqueeMessages,
  workgroupMessageStorageKey,
  workgroupMessages,
} from "@/lib/domain/communications";
import type { WorkgroupMessage } from "@/lib/domain/types";

export function AnnouncementMarquee() {
  const [messages, setMessages] = useState<WorkgroupMessage[]>(workgroupMessages);

  useEffect(() => {
    const stored = window.localStorage.getItem(workgroupMessageStorageKey);
    if (stored) {
      setMessages(JSON.parse(stored) as WorkgroupMessage[]);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === workgroupMessageStorageKey && event.newValue) {
        setMessages(JSON.parse(event.newValue) as WorkgroupMessage[]);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const activeMessages = useMemo(() => getActiveMarqueeMessages(messages), [messages]);

  if (activeMessages.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary">
          <Megaphone className="h-4 w-4" />
          公告
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-[marquee_24s_linear_infinite] gap-8 whitespace-nowrap text-sm text-muted-foreground">
            {[...activeMessages, ...activeMessages].map((message, index) => (
              <span key={`${message.id}-${index}`}>
                <span className="font-medium text-foreground">{message.title}</span>
                <span className="mx-2">·</span>
                {message.content}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
