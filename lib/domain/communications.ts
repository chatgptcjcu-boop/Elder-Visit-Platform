import type {
  WorkgroupMessage,
  WorkgroupMessageRecipient,
  WorkgroupMessageReply,
} from "@/lib/domain/types";

export const workgroupMessageStorageKey = "elder-visit-platform:workgroup-messages";
export const workgroupRecipientStorageKey = "elder-visit-platform:workgroup-message-recipients";
export const workgroupReplyStorageKey = "elder-visit-platform:workgroup-message-replies";

export const workgroupMessageAudienceLabels = {
  public: "公開群發",
  group: "指定群組",
  individual: "個別發送",
};

export const workgroupChannelLabels = {
  marquee: "前台跑馬燈",
  in_app: "站內訊息",
  line: "LINE 轉發",
  email: "Email",
};

export const workgroupMessages: WorkgroupMessage[] = [
  {
    id: "msg_001",
    title: "本週稽核補件提醒",
    content: "請各訪員於週五前完成未通過稽核案件的補件與回覆。",
    audience: "group",
    targetLabel: "訪員 A 組",
    channels: ["marquee", "in_app"],
    priority: "important",
    status: "published",
    senderName: "督導管理員",
    publishedAt: "2026-04-27T08:30:00+08:00",
    expiresAt: "2026-05-03T23:59:59+08:00",
    relatedModule: "audit",
    lineForwarding: false,
  },
  {
    id: "msg_002",
    title: "LINE 雙向通知測試",
    content: "LINE 官方帳號串接後，可將站內訊息轉發到 LINE，使用者回覆後回寫到系統紀錄。",
    audience: "public",
    targetLabel: "全部使用者",
    channels: ["in_app", "line"],
    priority: "normal",
    status: "published",
    senderName: "系統管理員",
    publishedAt: "2026-04-26T14:00:00+08:00",
    expiresAt: "2026-05-10T23:59:59+08:00",
    relatedModule: "general",
    lineForwarding: true,
  },
];

export const workgroupMessageRecipients: WorkgroupMessageRecipient[] = [
  {
    id: "rec_001",
    messageId: "msg_001",
    recipientName: "王小明",
    roleLabel: "訪員",
    groupLabel: "訪員 A 組",
    readAt: "2026-04-27T09:10:00+08:00",
    repliedAt: "2026-04-27T09:18:00+08:00",
  },
  {
    id: "rec_002",
    messageId: "msg_001",
    recipientName: "林美華",
    roleLabel: "訪員",
    groupLabel: "訪員 A 組",
    readAt: null,
    repliedAt: null,
  },
  {
    id: "rec_003",
    messageId: "msg_002",
    recipientName: "督導管理員",
    roleLabel: "督導",
    groupLabel: "管理群組",
    readAt: "2026-04-26T14:02:00+08:00",
    repliedAt: null,
  },
];

export const workgroupMessageReplies: WorkgroupMessageReply[] = [
  {
    id: "reply_001",
    messageId: "msg_001",
    authorName: "王小明",
    roleLabel: "訪員",
    content: "已收到，今天會先補 EV-115-0003 的照片。",
    createdAt: "2026-04-27T09:18:00+08:00",
    source: "in_app",
  },
];

export function getActiveMarqueeMessages(messages = workgroupMessages) {
  const now = new Date();
  return messages.filter((message) => {
    const isVisible = message.status === "published" && message.channels.includes("marquee");
    const isActive = new Date(message.expiresAt) > now;
    return isVisible && isActive;
  });
}

export function getMessageDeliverySummary(
  messageId: string,
  recipients = workgroupMessageRecipients,
  replies = workgroupMessageReplies,
) {
  const targetRecipients = recipients.filter((recipient) => recipient.messageId === messageId);
  const readCount = targetRecipients.filter((recipient) => recipient.readAt).length;
  const replyCount = replies.filter((reply) => reply.messageId === messageId).length;

  return {
    recipientCount: targetRecipients.length,
    readCount,
    unreadCount: targetRecipients.length - readCount,
    replyCount,
  };
}
