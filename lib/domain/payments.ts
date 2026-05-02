import type { PaymentBatch, PaymentBatchItem } from "@/lib/domain/types";

export const lockedPaymentItems: PaymentBatchItem[] = [
  {
    id: "payment_item_001",
    caseCode: "EV-115-0001",
    elderName: "林阿梅",
    visitRecordId: "visit_001",
    lockedAt: "2026-04-26T08:05:00+08:00",
    totalFee: 750,
    status: "locked",
  },
  {
    id: "payment_item_002",
    caseCode: "EV-115-0003",
    elderName: "張秀蘭",
    visitRecordId: "visit_003",
    lockedAt: "2026-04-26T08:18:00+08:00",
    totalFee: 750,
    status: "locked",
  },
];

export function createPaymentBatchPreview(): PaymentBatch {
  const totalAmount = lockedPaymentItems.reduce((sum, item) => sum + item.totalFee, 0);
  const warnings: string[] = [];

  if (lockedPaymentItems.length === 0) {
    warnings.push("目前沒有可匯出的鎖定核銷項目。");
  }

  if (totalAmount > 100_000) {
    warnings.push("批次總額超過 100,000 元，建議分批匯出並由主管覆核。");
  }

  return {
    id: "payment_batch_preview",
    batchNo: "PB-115-0426-001",
    status: lockedPaymentItems.length > 0 ? "ready_for_export" : "draft",
    itemCount: lockedPaymentItems.length,
    totalAmount,
    items: lockedPaymentItems,
    warnings,
    createdAt: new Date().toISOString(),
  };
}

export function createPaymentBatch(): PaymentBatch {
  return {
    ...createPaymentBatchPreview(),
    id: "payment_batch_001",
    createdAt: new Date().toISOString(),
  };
}
