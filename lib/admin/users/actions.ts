"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAccountStatusAudit } from "@/lib/admin/audit/actions";
import {
  canChangeUserRole,
  canManageAccountStatus,
  hasAdminPermission,
} from "@/lib/admin/permissions";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth/guards";
import { logRoleChange } from "@/lib/auth/account-audit";
import { notifyAccountStatusChange } from "@/lib/notifications/service";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/types/admin";
import type { AccountStatus, UserRole } from "@/types/profile";
import { USER_ROLES } from "@/lib/auth/roles";

const statusSchema = z.object({
  userId: z.string().uuid(),
  accountStatus: z.enum([
    "active",
    "under_review",
    "restricted",
    "on_hold",
    "suspended",
    "closed",
  ]),
  reason: z.string().min(3, "A reason is required for account status changes."),
});

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["client", "finance_officer", "admin", "super_admin"]),
  reason: z.string().min(3, "A reason is required for role changes."),
});

function revalidateUserPaths(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);
}

export async function updateAccountStatusAction(
  input: z.infer<typeof statusSchema>,
): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();

  if (!canManageAccountStatus(ctx.role)) {
    return { error: "You do not have permission to manage account status." };
  }

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.userId === ctx.user.id) {
    return { error: "You cannot change your own account status." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("account_status, role")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (!existing) {
    return { error: "User not found." };
  }

  const previousStatus = (existing.account_status ?? "active") as AccountStatus;
  const newStatus = parsed.data.accountStatus;

  if (previousStatus === newStatus) {
    return { error: "Account is already in this status." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      account_status: newStatus,
      account_status_reason: parsed.data.reason,
      account_status_changed_at: new Date().toISOString(),
      account_status_changed_by: ctx.user.id,
    })
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: error.message };
  }

  await logAccountStatusAudit({
    targetUserId: parsed.data.userId,
    previousStatus,
    newStatus,
    reason: parsed.data.reason,
  });

  await notifyAccountStatusChange(
    parsed.data.userId,
    previousStatus,
    newStatus,
    parsed.data.reason,
  );

  revalidateUserPaths(parsed.data.userId);
  return { success: `Account status updated to ${newStatus.replace(/_/g, " ")}.` };
}

export async function updateUserRoleAction(
  input: z.infer<typeof roleSchema>,
): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();

  if (!canChangeUserRole(ctx.role)) {
    return { error: "You do not have permission to change roles." };
  }

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.userId === ctx.user.id) {
    return { error: "You cannot change your own role." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (!existing) {
    return { error: "User not found." };
  }

  const previousRole = existing.role as UserRole;
  const newRole = parsed.data.role as UserRole;

  if (previousRole === newRole) {
    return { error: "User already has this role." };
  }

  if (
    newRole === USER_ROLES.superAdmin &&
    !hasAdminPermission(ctx.role, "admins:manage")
  ) {
    return { error: "You do not have permission to assign this role." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: error.message };
  }

  await logRoleChange(
    parsed.data.userId,
    previousRole,
    newRole,
    parsed.data.reason,
  );

  revalidateUserPaths(parsed.data.userId);
  return { success: "User role updated successfully." };
}

export async function reactivateAccountAction(
  userId: string,
  reason: string,
): Promise<AdminActionState> {
  return updateAccountStatusAction({
    userId,
    accountStatus: "active",
    reason,
  });
}

export async function restrictAccountAction(
  userId: string,
  reason: string,
): Promise<AdminActionState> {
  return updateAccountStatusAction({
    userId,
    accountStatus: "restricted",
    reason,
  });
}

export async function suspendAccountAction(
  userId: string,
  reason: string,
): Promise<AdminActionState> {
  return updateAccountStatusAction({
    userId,
    accountStatus: "suspended",
    reason,
  });
}

export async function holdAccountAction(
  userId: string,
  reason: string,
): Promise<AdminActionState> {
  return updateAccountStatusAction({
    userId,
    accountStatus: "on_hold",
    reason,
  });
}
