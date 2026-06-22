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
import { notifyAdmin } from "@/lib/notifications/notify";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWallet } from "@/lib/wallet/ledger";
import { canLinkPathwardAccount, parseDownPaymentMeta } from "@/lib/dashboard/mortgage-journey";
import { isClosingDownPaymentComplete, normalizeDownPaymentMeta } from "@/lib/dashboard/funding-requirements";
import { parseEscrowTransferMeta } from "@/lib/dashboard/closing-funds-meta";
import { extractPreQualification } from "@/lib/onboarding/parse-application";
import { isMortgageApprovedForWithdrawal } from "@/lib/wallet/pathward-account";
import { createNotification } from "@/lib/wallet/notifications";
import { generateReferenceNumber } from "@/lib/wallet/utils";
import { mirrorWalletTransaction } from "@/lib/transactions/wallet-bridge";
import type { ApplicationStatus } from "@/types/application-details";
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

const linkedPathwardAccountSchema = z.object({
  userId: z.string().uuid(),
  accountHolderName: z.string().min(2, "Account holder name is required."),
  routingNumber: z
    .string()
    .regex(/^\d{9}$/, "Routing number must be 9 digits."),
  accountNumber: z
    .string()
    .regex(/^\d{6,17}$/, "Account number must be 6 to 17 digits."),
});

const pathwardBalanceSchema = z.object({
  userId: z.string().uuid(),
  accountBalance: z.coerce.number().min(0, "Balance cannot be negative."),
});

function revalidateUserPaths(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
}

async function getClientApplicationFundingState(userId: string) {
  const supabase = await createClient();
  const { data: application } = await supabase
    .from("loan_applications")
    .select("status, personal_info")
    .eq("user_id", userId)
    .neq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const personalInfo = (application?.personal_info ?? {}) as Record<string, unknown>;
  const escrowTransfer = parseEscrowTransferMeta(personalInfo);
  const preQual = extractPreQualification(personalInfo);
  const downPaymentMeta = normalizeDownPaymentMeta(
    parseDownPaymentMeta(personalInfo),
    preQual?.estimatedDownPayment ?? 0,
    escrowTransfer,
  );

  return {
    applicationStatus: application?.status as string | undefined,
    downPaymentVerified: isClosingDownPaymentComplete(downPaymentMeta),
  };
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
    .select("role, email, first_name, last_name")
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

  void notifyAdmin({
    event: "ROLE_CHANGED",
    severity: "critical",
    payload: {
      email: existing.email,
      role: newRole,
      name:
        `${existing.first_name ?? ""} ${existing.last_name ?? ""}`.trim() ||
        existing.email,
    },
    entityType: "user",
    entityId: parsed.data.userId,
    dashboardUrl: "/super-admin/users",
  });

  revalidateUserPaths(parsed.data.userId);
  return { success: "User role updated successfully." };
}

export async function updateLinkedPathwardAccountAction(
  input: z.infer<typeof linkedPathwardAccountSchema>,
): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();
  const parsed = linkedPathwardAccountSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const fundingState = await getClientApplicationFundingState(parsed.data.userId);
  if (!canLinkPathwardAccount(fundingState.applicationStatus as ApplicationStatus)) {
    return {
      error:
        "Pathward accounts can only be linked after the client's mortgage application is approved.",
    };
  }

  const supabase = await createClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("pathward_routing_number, pathward_account_number")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  const isFirstLink =
    !existingProfile?.pathward_routing_number ||
    !existingProfile?.pathward_account_number;

  const profileUpdate: Record<string, string | number> = {
    pathward_account_holder_name: parsed.data.accountHolderName.trim(),
    pathward_routing_number: parsed.data.routingNumber.trim(),
    pathward_account_number: parsed.data.accountNumber.trim(),
    pathward_linked_at: new Date().toISOString(),
    pathward_linked_by: ctx.user.id,
  };

  if (isFirstLink) {
    profileUpdate.pathward_account_balance = 0;
  }

  const { error } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: error.message };
  }

  await createNotification({
    userId: parsed.data.userId,
    title: "Funding Account Linked",
    message:
      "Your Pathward funding account has been linked. Wire instructions are available in your dashboard. Your balance will update once mortgage funding is processed or your down payment is confirmed.",
    type: "application_update",
  });

  const { sendFundingAccountCreatedEmail } = await import("@/lib/email/hooks");
  void sendFundingAccountCreatedEmail(parsed.data.userId, "/dashboard");

  revalidateUserPaths(parsed.data.userId);
  return { success: "Linked Pathward account updated." };
}

export async function updatePathwardAccountBalanceAction(
  input: z.infer<typeof pathwardBalanceSchema>,
): Promise<AdminActionState> {
  await requireSuperAdmin();
  const parsed = pathwardBalanceSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("pathward_routing_number, pathward_account_number")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (!profile?.pathward_routing_number || !profile?.pathward_account_number) {
    return { error: "Link a Pathward account before updating the balance." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ pathward_account_balance: parsed.data.accountBalance })
    .eq("id", parsed.data.userId);

  if (error) {
    return { error: error.message };
  }

  const { sendFundingBalanceUpdatedEmail } = await import("@/lib/email/hooks");
  void sendFundingBalanceUpdatedEmail(
    parsed.data.userId,
    parsed.data.accountBalance,
    "/wallet",
  );

  revalidateUserPaths(parsed.data.userId);
  return { success: "Pathward account balance updated." };
}

export async function approveWithdrawableBalanceAction(
  userId: string,
): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();
  const supabase = await createClient();

  const mortgageApproved = await isMortgageApprovedForWithdrawal(userId);
  if (!mortgageApproved) {
    return {
      error: "Mortgage must be approved before releasing closing funds.",
    };
  }

  const fundingState = await getClientApplicationFundingState(userId);
  if (!fundingState.downPaymentVerified) {
    return {
      error:
        "Down payment must be verified before releasing closing funds for escrow transfer.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "pathward_routing_number, pathward_account_number, pathward_account_balance",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.pathward_routing_number || !profile?.pathward_account_number) {
    return { error: "Link a Pathward account before approving withdrawal." };
  }

  const accountBalance = Number(profile.pathward_account_balance ?? 0);
  if (accountBalance <= 0) {
    return { error: "Account balance must be greater than zero to release." };
  }

  const wallet = await getOrCreateWallet(userId);
  const referenceNumber = generateReferenceNumber("PWR");

  const { error: walletError } = await supabase
    .from("wallets")
    .update({ available_balance: accountBalance })
    .eq("id", wallet.id);

  if (walletError) {
    return { error: walletError.message };
  }

  const { data: releaseTx } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      transaction_type: "system_credit",
      amount: accountBalance,
      status: "completed",
      description: "Closing funds released for escrow transfer",
      reference_number: referenceNumber,
      created_by: ctx.user.id,
    })
    .select("id")
    .single();

  if (releaseTx) {
    await mirrorWalletTransaction({
      borrowerId: userId,
      walletTransactionId: releaseTx.id,
      walletType: "system_credit",
      amount: accountBalance,
      status: "completed",
      referenceNumber,
      description: "Closing funds released for escrow transfer",
      createdBy: ctx.user.id,
      isCredit: true,
      notify: {
        title: "Closing Funds Ready",
        message: `$${accountBalance.toFixed(2)} is now available to transfer to the seller via escrow.`,
      },
    });
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      pathward_withdrawable_approved_at: new Date().toISOString(),
      pathward_withdrawable_approved_by: ctx.user.id,
    })
    .eq("id", userId);

  if (profileError) {
    return { error: profileError.message };
  }

  await createNotification({
    userId,
    title: "Closing Funds Ready",
    message: `Your closing funds of $${accountBalance.toFixed(2)} are ready. You can now transfer to the seller via escrow from your dashboard.`,
    type: "wallet_credit",
    metadata: { amount: accountBalance, referenceNumber },
  });

  revalidateUserPaths(userId);
  return {
    success: `Released $${accountBalance.toFixed(2)} in closing funds for escrow transfer.`,
  };
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
