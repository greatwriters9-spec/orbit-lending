"use server";

import { logAuditEntry } from "@/lib/finance/audit";

export type AccountAuditAction =
  | "account.role_changed"
  | "account.permission_changed"
  | "account.activated"
  | "account.suspended";

type AccountAuditInput = {
  action: AccountAuditAction;
  targetUserId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  reason?: string;
};

export async function logAccountAuditEvent(input: AccountAuditInput) {
  await logAuditEntry({
    action: input.action,
    entityType: "user_account",
    entityId: input.targetUserId,
    oldValues: input.oldValues,
    newValues: {
      ...input.newValues,
      reason: input.reason,
    },
  });
}

export async function logRoleChange(
  targetUserId: string,
  previousRole: string,
  newRole: string,
  reason?: string,
) {
  await logAccountAuditEvent({
    action: "account.role_changed",
    targetUserId,
    oldValues: { role: previousRole },
    newValues: { role: newRole },
    reason,
  });
}

export async function logPermissionChange(
  targetUserId: string,
  permission: string,
  granted: boolean,
  reason?: string,
) {
  await logAccountAuditEvent({
    action: "account.permission_changed",
    targetUserId,
    oldValues: { permission, granted: !granted },
    newValues: { permission, granted },
    reason,
  });
}

export async function logAccountActivation(
  targetUserId: string,
  reason?: string,
) {
  await logAccountAuditEvent({
    action: "account.activated",
    targetUserId,
    newValues: { status: "active" },
    reason,
  });
}

export async function logAccountSuspension(
  targetUserId: string,
  reason?: string,
) {
  await logAccountAuditEvent({
    action: "account.suspended",
    targetUserId,
    newValues: { status: "suspended" },
    reason,
  });
}
