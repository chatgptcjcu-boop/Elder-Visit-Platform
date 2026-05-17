"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCheck,
  Clock3,
  MessageSquareReply,
  Radio,
  Send,
  Smartphone,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMessageDeliverySummary,
  workgroupChannelLabels,
  workgroupMessageAudienceLabels,
  workgroupMessageRecipients,
  workgroupMessageReplies,
  workgroupMessageStorageKey,
  workgroupMessages,
  workgroupRecipientStorageKey,
  workgroupReplyStorageKey,
} from "@/lib/domain/communications";
import type {
  WorkgroupMessage,
  WorkgroupMessageAudience,
  WorkgroupMessageChannel,
  WorkgroupMessageRecipient,
  WorkgroupMessageReply,
} from "@/lib/domain/types";

const channels: WorkgroupMessageChannel[] = ["marquee", "in_app", "line", "email"];

export function WorkgroupCommunicationCenter() {
  const [messages, setMessages] = useState<WorkgroupMessage[]>(workgroupMessages);
  const [recipients, setRecipients] =
    useState<WorkgroupMessageRecipient[]>(workgroupMessageRecipients);
  const [replies, setReplies] = useState<WorkgroupMessageReply[]>(workgroupMessageReplies);
  const [draft, setDraft] = useState(createEmptyMessageDraft());
  const [replyDraft, setReplyDraft] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(workgroupMessages[0]?.id ?? "");

  useEffect(() => {
    const storedMessages = window.localStorage.getItem(workgroupMessageStorageKey);
    const storedRecipients = window.localStorage.getItem(workgroupRecipientStorageKey);
    const storedReplies = window.localStorage.getItem(workgroupReplyStorageKey);

    if (storedMessages) setMessages(JSON.parse(storedMessages) as WorkgroupMessage[]);
    if (storedRecipients) setRecipients(JSON.parse(storedRecipients) as WorkgroupMessageRecipient[]);
    if (storedReplies) setReplies(JSON.parse(storedReplies) as WorkgroupMessageReply[]);
  }, []);

  const selectedMessage = messages.find((message) => message.id === selectedMessageId) ?? messages[0];
  const selectedRecipients = recipients.filter(
    (recipient) => recipient.messageId === selectedMessage?.id,
  );
  const selectedReplies = replies.filter((reply) => reply.messageId === selectedMessage?.id);
  const deliveryRows = useMemo(
    () =>
      messages.map((message) => ({
        message,
        summary: getMessageDeliverySummary(message.id, recipients, replies),
      })),
    [messages, recipients, replies],
  );

  function persistMessages(nextMessages: WorkgroupMessage[]) {
    setMessages(nextMessages);
    window.localStorage.setItem(workgroupMessageStorageKey, JSON.stringify(nextMessages));
  }

  function persistRecipients(nextRecipients: WorkgroupMessageRecipient[]) {
    setRecipients(nextRecipients);
    window.localStorage.setItem(workgroupRecipientStorageKey, JSON.stringify(nextRecipients));
  }

  function persistReplies(nextReplies: WorkgroupMessageReply[]) {
    setReplies(nextReplies);
    window.localStorage.setItem(workgroupReplyStorageKey, JSON.stringify(nextReplies));
  }

  function publishMessage() {
    const messageId = `msg_${Date.now()}`;
    const targetLabel = draft.audience === "public" ? "全部使用者" : draft.targetLabel;
    const nextMessage: WorkgroupMessage = {
      ...draft,
      id: messageId,
      targetLabel,
      status: "published",
      senderName: "目前登入管理者",
      publishedAt: new Date().toISOString(),
      expiresAt: draft.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lineForwarding: draft.channels.includes("line"),
    };
    const nextRecipients = createMockRecipients(messageId, targetLabel, draft.audience);

    persistMessages([nextMessage, ...messages]);
    persistRecipients([...nextRecipients, ...recipients]);
    setSelectedMessageId(messageId);
    setDraft(createEmptyMessageDraft());
  }

  function markAllRead(messageId: string) {
    persistRecipients(
      recipients.map((recipient) =>
        recipient.messageId === messageId && !recipient.readAt
          ? { ...recipient, readAt: new Date().toISOString() }
          : recipient,
      ),
    );
  }

  function sendReply() {
    if (!selectedMessage || !replyDraft.trim()) {
      return;
    }

    const nextReply: WorkgroupMessageReply = {
      id: `reply_${Date.now()}`,
      messageId: selectedMessage.id,
      authorName: "目前登入管理者",
      roleLabel: "管理者",
      content: replyDraft.trim(),
      createdAt: new Date().toISOString(),
      source: "in_app",
    };
    persistReplies([nextReply, ...replies]);
    setReplyDraft("");
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">工作群組溝通與公告發布</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          可發佈前台跑馬燈、站內訊息、群組通知或個別訊息，並追蹤已讀、未讀與回覆紀錄。
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.25fr]">
        <article className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">新增發布訊息</h3>
          <div className="mt-4 grid gap-3">
            <TextInput
              label="訊息標題"
              value={draft.title}
              onChange={(title) => setDraft((current) => ({ ...current, title }))}
            />
            <TextArea
              label="訊息內容"
              value={draft.content}
              onChange={(content) => setDraft((current) => ({ ...current, content }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectInput
                label="發布對象"
                value={draft.audience}
                options={[
                  ["public", "公開群發"],
                  ["group", "指定群組"],
                  ["individual", "個別發送"],
                ]}
                onChange={(audience) =>
                  setDraft((current) => ({
                    ...current,
                    audience: audience as WorkgroupMessageAudience,
                    targetLabel: audience === "public" ? "全部使用者" : current.targetLabel,
                  }))
                }
              />
              <TextInput
                label="群組 / 個人"
                value={draft.targetLabel}
                disabled={draft.audience === "public"}
                onChange={(targetLabel) => setDraft((current) => ({ ...current, targetLabel }))}
              />
            </div>
            <div>
              <p className="text-sm font-medium">發送通道</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {channels.map((channel) => (
                  <label key={channel} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.channels.includes(channel)}
                      onChange={() =>
                        setDraft((current) => ({
                          ...current,
                          channels: current.channels.includes(channel)
                            ? current.channels.filter((item) => item !== channel)
                            : [...current.channels, channel],
                        }))
                      }
                    />
                    {workgroupChannelLabels[channel]}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectInput
                label="關聯功能"
                value={draft.relatedModule}
                options={[
                  ["general", "一般公告"],
                  ["audit", "稽核管理"],
                  ["assignments", "派案作業"],
                  ["visits", "訪查任務"],
                ]}
                onChange={(relatedModule) =>
                  setDraft((current) => ({
                    ...current,
                    relatedModule: relatedModule as WorkgroupMessage["relatedModule"],
                  }))
                }
              />
              <TextInput
                label="有效期限"
                value={draft.expiresAt}
                onChange={(expiresAt) => setDraft((current) => ({ ...current, expiresAt }))}
              />
            </div>
            <Button
              type="button"
              disabled={!draft.title.trim() || !draft.content.trim() || draft.channels.length === 0}
              onClick={publishMessage}
            >
              <Send className="h-4 w-4" />
              發布訊息
            </Button>
          </div>
        </article>

        <article className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold">發布紀錄與讀取狀態</h3>
            {selectedMessage && (
              <Button
                className="w-full sm:w-auto"
                type="button"
                variant="outline"
                size="sm"
                onClick={() => markAllRead(selectedMessage.id)}
              >
                <CheckCheck className="h-4 w-4" />
                模擬全部已讀
              </Button>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            {deliveryRows.map(({ message, summary }) => (
              <button
                key={message.id}
                type="button"
                className={`rounded-lg border p-3 text-left ${
                  selectedMessage?.id === message.id ? "border-primary bg-primary/5" : "bg-background"
                }`}
                onClick={() => setSelectedMessageId(message.id)}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{message.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {workgroupMessageAudienceLabels[message.audience]} · {message.targetLabel}
                    </p>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                    已讀 {summary.readCount} / 未讀 {summary.unreadCount} / 回覆 {summary.replyCount}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </article>
      </div>

      {selectedMessage && (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-lg border bg-card p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <UsersRound className="h-4 w-4 text-primary" />
              收件與已讀紀錄
            </h3>
            <div className="mt-3 grid gap-2">
              {selectedRecipients.map((recipient) => (
                <div key={recipient.id} className="flex flex-col gap-2 rounded-md border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{recipient.recipientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {recipient.roleLabel} · {recipient.groupLabel}
                    </p>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                    {recipient.readAt ? "已讀" : "未讀"}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border bg-card p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareReply className="h-4 w-4 text-primary" />
              回覆紀錄
            </h3>
            <div className="mt-3 grid gap-2">
              {selectedReplies.map((reply) => (
                <div key={reply.id} className="rounded-md border bg-background p-3 text-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium">{reply.authorName}</p>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs">
                      {reply.source === "line" ? "LINE" : "站內"}
                    </span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{reply.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:flex">
              <input
                className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="輸入回覆或處理備註"
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
              />
              <Button className="w-full sm:w-auto" type="button" onClick={sendReply}>
                回覆
              </Button>
            </div>
          </article>
        </div>
      )}

      <article className="rounded-lg border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Smartphone className="h-4 w-4 text-primary" />
          LINE 雙向轉發規劃
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <LineStep icon={Send} title="站內發布" detail="管理者選擇 LINE 通道後，系統以官方帳號推播給綁定使用者。" />
          <LineStep icon={MessageSquareReply} title="使用者回覆" detail="LINE Webhook 收到回覆後，依 LINE userId 對回系統使用者與工作空間。" />
          <LineStep icon={Clock3} title="紀錄回寫" detail="所有推播、已讀、回覆與轉發錯誤寫入訊息紀錄，供稽核查詢。" />
        </div>
      </article>
    </section>
  );
}

function createEmptyMessageDraft(): WorkgroupMessage {
  return {
    id: "",
    title: "",
    content: "",
    audience: "public",
    targetLabel: "全部使用者",
    channels: ["marquee", "in_app"],
    priority: "normal",
    status: "draft",
    senderName: "",
    publishedAt: "",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    relatedModule: "general",
    lineForwarding: false,
  };
}

function createMockRecipients(
  messageId: string,
  targetLabel: string,
  audience: WorkgroupMessageAudience,
): WorkgroupMessageRecipient[] {
  const baseRecipients = audience === "individual"
    ? [{ name: targetLabel || "指定使用者", role: "使用者", group: "個別訊息" }]
    : [
        { name: "王小明", role: "訪員", group: targetLabel },
        { name: "林美華", role: "訪員", group: targetLabel },
        { name: "督導管理員", role: "督導", group: "管理群組" },
      ];

  return baseRecipients.map((recipient, index) => ({
    id: `rec_${messageId}_${index}`,
    messageId,
    recipientName: recipient.name,
    roleLabel: recipient.role,
    groupLabel: recipient.group,
    readAt: null,
    repliedAt: null,
  }));
}

function LineStep({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Send;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <textarea
        className="mt-2 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <select
        className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
