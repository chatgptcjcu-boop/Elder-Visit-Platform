import type { PaymentBatch, PaymentBatchItem, PaymentFeeRule } from "@/lib/domain/types";

export const paymentFeeRules: PaymentFeeRule = {
  visitFee: 180,
  dataProcessingFee: 30,
  totalPerCompletedVisit: 210,
  currency: "元",
  effectiveFrom: "2026-04-25",
  description: "訪視費 180 元，加資料處理費 30 元；未遇、拒訪或資料不完整案件需督導判定，不直接核銷。",
};

export const lockedPaymentItems: PaymentBatchItem[] = [
  {
    id: "payment_item_001",
    caseCode: "EV-115-0001",
    elderName: "林阿梅",
    visitRecordId: "visit_001",
    lockedAt: "2026-04-26T08:05:00+08:00",
    visitFee: paymentFeeRules.visitFee,
    dataProcessingFee: paymentFeeRules.dataProcessingFee,
    totalFee: paymentFeeRules.totalPerCompletedVisit,
    status: "locked",
  },
  {
    id: "payment_item_002",
    caseCode: "EV-115-0003",
    elderName: "張秀蘭",
    visitRecordId: "visit_003",
    lockedAt: "2026-04-26T08:18:00+08:00",
    visitFee: paymentFeeRules.visitFee,
    dataProcessingFee: paymentFeeRules.dataProcessingFee,
    totalFee: paymentFeeRules.totalPerCompletedVisit,
    status: "locked",
  },
];

export function createPaymentBatchPreview(
  items: PaymentBatchItem[] = lockedPaymentItems,
): PaymentBatch {
  const totalAmount = items.reduce((sum, item) => sum + item.totalFee, 0);
  const warnings: string[] = [];

  if (items.length === 0) {
    warnings.push("目前沒有可匯出的鎖定核銷項目。");
  }

  if (totalAmount > 100_000) {
    warnings.push("批次總額超過 100,000 元，建議分批匯出並由主管覆核。");
  }

  return {
    id: "payment_batch_preview",
    batchNo: "PB-115-0426-001",
    status: items.length > 0 ? "ready_for_export" : "draft",
    itemCount: items.length,
    totalAmount,
    items,
    warnings,
    createdAt: new Date().toISOString(),
  };
}

export function createPaymentBatch(items: PaymentBatchItem[] = lockedPaymentItems): PaymentBatch {
  return {
    ...createPaymentBatchPreview(items),
    id: "payment_batch_001",
    createdAt: new Date().toISOString(),
  };
}
