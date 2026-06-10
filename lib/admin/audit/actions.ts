"use server";

import { logAuditEntry } from "@/lib/finance/audit";

type ProductAuditInput = {
  action: string;
  productId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  reason?: string;
};

export async function logProductAudit(input: ProductAuditInput) {
  await logAuditEntry({
    action: input.action,
    entityType: "loan_product",
    entityId: input.productId,
    oldValues: input.oldValues,
    newValues: {
      ...input.newValues,
      reason: input.reason,
    },
  });
}

export async function logAccountStatusAudit(input: {
  targetUserId: string;
  previousStatus: string;
  newStatus: string;
  reason?: string;
}) {
  await logAuditEntry({
    action: "account.status_changed",
    entityType: "user_account",
    entityId: input.targetUserId,
    oldValues: { account_status: input.previousStatus },
    newValues: {
      account_status: input.newStatus,
      reason: input.reason,
    },
  });
}
