"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { parseClosingFundsMeta } from "@/lib/dashboard/closing-funds-meta";
import {
  buildEscrowPendingFundingMeta,
} from "@/lib/dashboard/funding-requirements";
import { parseDownPaymentMeta } from "@/lib/dashboard/mortgage-journey";
import { assertClientAccountAllows } from "@/lib/auth/account-enforcement";
import { logAuditEntry } from "@/lib/finance/audit";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWallet } from "@/lib/wallet/ledger";
import { createNotification } from "@/lib/wallet/notifications";
import { generateReferenceNumber } from "@/lib/wallet/utils";
import { mirrorWalletTransaction } from "@/lib/transactions/wallet-bridge";
import type { EscrowTransferMeta, SellerDestinationDetails } from "@/types/mortgage-dashboard";
import type { WalletActionState } from "@/types/wallet";

const sellerDestinationSchema = z.object({
  accountName: z.string().min(2, "Seller account holder name is required."),
  bankName: z.string().min(2, "Seller bank name is required."),
  routingNumber: z
    .string()
    .regex(/^\d{9}$/, "Routing number must be 9 digits."),
  accountNumber: z
    .string()
    .regex(/^\d{6,17}$/, "Account number must be 6 to 17 digits."),
  notes: z.string().optional(),
});

function revalidateEscrowPaths(userId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/wallet/withdraw");
  revalidatePath("/finance/withdrawals");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/super-admin/users");
  revalidatePath(`/super-admin/users/${userId}`);
  revalidatePath("/dashboard/transactions");
  revalidatePath("/finance/transactions");
}

async function fetchLatestApplicationForUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loan_applications")
    .select("id, personal_info, application_number")
    .eq("user_id", userId)
    .neq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

async function persistEscrowTransferMeta(
  applicationId: string,
  personalInfo: Record<string, unknown>,
  escrowTransfer: EscrowTransferMeta,
) {
  const supabase = await createClient();
  const closingMeta = parseClosingFundsMeta(personalInfo) ?? {};
  const existingDownPayment = parseDownPaymentMeta(personalInfo);
  const onboarding = personalInfo.onboarding as
    | { preQualification?: { estimatedDownPayment?: number } }
    | undefined;
  const fallbackDownPayment =
    onboarding?.preQualification?.estimatedDownPayment ?? 0;

  const downPayment =
    escrowTransfer.status === "pending"
      ? buildEscrowPendingFundingMeta(existingDownPayment, fallbackDownPayment)
      : existingDownPayment;

  await supabase
    .from("loan_applications")
    .update({
      personal_info: {
        ...personalInfo,
        downPayment,
        closingFunds: {
          ...closingMeta,
          escrowTransfer,
        },
      },
    })
    .eq("id", applicationId);

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status: "active",
    note:
      escrowTransfer.status === "pending"
        ? `Your escrow transfer of $${escrowTransfer.amount.toFixed(2)} is being reviewed by our closing team.`
        : escrowTransfer.status === "approved"
          ? `Escrow transfer of $${escrowTransfer.amount.toFixed(2)} approved and sent to seller.`
          : `Escrow transfer rejected: ${escrowTransfer.rejectedReason ?? "Funds restored."}`,
    changed_by: escrowTransfer.approvedBy ?? null,
  });
}

export async function initiateEscrowTransferAction(
  input: SellerDestinationDetails,
): Promise<WalletActionState> {
  const parsed = sellerDestinationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid seller account details." };
  }

  const seller = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const accountBlock = await assertClientAccountAllows(user.id, "wallet_withdraw");
  if (accountBlock) {
    return { error: accountBlock };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "pathward_routing_number, pathward_account_number, pathward_account_balance, pathward_withdrawable_approved_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.pathward_withdrawable_approved_at) {
    return {
      error:
        "Closing funds have not been released yet. Orbit Mortgage will notify you when your transfer is ready.",
    };
  }

  const wallet = await getOrCreateWallet(user.id);
  const transferAmount = wallet.availableBalance;

  if (transferAmount <= 0) {
    return { error: "No closing funds are available to transfer." };
  }

  const application = await fetchLatestApplicationForUser(user.id);
  if (!application) {
    return { error: "No active application found for escrow transfer." };
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const existingEscrow = parseClosingFundsMeta(personalInfo)?.escrowTransfer;
  if (existingEscrow?.status === "pending") {
    return { error: "An escrow transfer is already pending approval." };
  }

  const referenceNumber = generateReferenceNumber("ESC");
  const pathwardBalance = Number(profile.pathward_account_balance ?? 0);

  const { data: withdrawal, error: withdrawalError } = await supabase
    .from("withdrawal_requests")
    .insert({
      wallet_id: wallet.id,
      user_id: user.id,
      amount: transferAmount,
      withdrawal_method: "bank_transfer",
      destination_details: {
        transferType: "escrow_to_seller",
        accountName: seller.accountName,
        accountNumber: seller.accountNumber,
        routingNumber: seller.routingNumber,
        bank: seller.bankName,
        note: seller.notes ?? "Transfer to seller via escrow",
      },
      notes: seller.notes ?? "Escrow transfer to seller",
      status: "pending",
    })
    .select("id")
    .single();

  if (withdrawalError || !withdrawal) {
    return { error: withdrawalError?.message ?? "Failed to initiate escrow transfer." };
  }

  const { error: walletError } = await supabase
    .from("wallets")
    .update({
      available_balance: 0,
      pending_balance: wallet.pendingBalance + transferAmount,
    })
    .eq("id", wallet.id);

  if (walletError) {
    return { error: walletError.message };
  }

  const { data: walletTx, error: txError } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      transaction_type: "withdrawal_request",
      amount: transferAmount,
      status: "pending",
      description: "Escrow transfer to seller — pending approval",
      reference_number: referenceNumber,
      withdrawal_request_id: withdrawal.id,
      application_id: application.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (txError || !walletTx) {
    return { error: txError?.message ?? "Failed to record escrow transfer." };
  }

  await mirrorWalletTransaction({
    borrowerId: user.id,
    walletTransactionId: walletTx.id,
    walletType: "withdrawal_request",
    amount: transferAmount,
    status: "pending",
    referenceNumber,
    description: "Escrow transfer to seller — pending approval",
    applicationId: application.id,
    createdBy: user.id,
    previousBalance: transferAmount,
    newBalance: 0,
    notify: {
      title: "Escrow Transfer Initiated",
      message: `Your escrow transfer of $${transferAmount.toFixed(2)} has been submitted and is being reviewed.`,
    },
  });

  await supabase
    .from("profiles")
    .update({ pathward_account_balance: 0 })
    .eq("id", user.id);

  const escrowTransfer: EscrowTransferMeta = {
    status: "pending",
    amount: transferAmount,
    pathwardBalanceAtTransfer: pathwardBalance,
    initiatedAt: new Date().toISOString(),
    withdrawalRequestId: withdrawal.id,
    sellerDestination: seller,
  };

  await persistEscrowTransferMeta(application.id, personalInfo, escrowTransfer);

  await logAuditEntry({
    action: "wallet.escrow_transfer_initiated",
    entityType: "withdrawal_request",
    entityId: withdrawal.id,
    newValues: {
      amount: transferAmount,
      pathwardBalanceZeroed: pathwardBalance,
      applicationId: application.id,
    },
  });

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["super_admin", "admin", "finance_officer"]);

  for (const admin of admins ?? []) {
    await createNotification({
      userId: admin.id,
      title: "Escrow Transfer Pending Approval",
      message: `Client initiated an escrow transfer of $${transferAmount.toFixed(2)} for application ${application.application_number ?? application.id.slice(0, 8)}.`,
      type: "withdrawal_requested",
      metadata: {
        withdrawalRequestId: withdrawal.id,
        applicationId: application.id,
        userId: user.id,
        amount: transferAmount,
      },
    });
  }

  await createNotification({
    userId: user.id,
    title: "Escrow Transfer Submitted",
    message: `Your transfer of $${transferAmount.toFixed(2)} to the seller via escrow is being reviewed.`,
    type: "withdrawal_requested",
    metadata: { withdrawalRequestId: withdrawal.id, amount: transferAmount },
  });

  const emailHooks = await import("@/lib/email/hooks");
  void emailHooks.sendEscrowTransferRequestedEmail(user.id, transferAmount, "/dashboard");
  void emailHooks.sendEscrowTransferPendingApprovalEmail(
    user.id,
    transferAmount,
    "/dashboard",
  );

  revalidateEscrowPaths(user.id);
  return {
    success:
      "Escrow transfer initiated. Your funding and closing balances are now $0.00 while pending approval.",
  };
}

export async function finalizeEscrowTransferApproval(
  withdrawalRequestId: string,
  reviewerId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("withdrawal_requests")
    .select("id, user_id, amount, destination_details")
    .eq("id", withdrawalRequestId)
    .maybeSingle();

  if (!request) {
    return { error: "Withdrawal request not found." };
  }

  const isEscrow =
    (request.destination_details as Record<string, string> | null)?.transferType ===
    "escrow_to_seller";

  if (!isEscrow) {
    return {};
  }

  const application = await fetchLatestApplicationForUser(request.user_id);
  if (!application) {
    return {};
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const closingMeta = parseClosingFundsMeta(personalInfo);
  const existing = closingMeta?.escrowTransfer;

  if (!existing || existing.withdrawalRequestId !== withdrawalRequestId) {
    return {};
  }

  await persistEscrowTransferMeta(application.id, personalInfo, {
    ...existing,
    status: "approved",
    approvedAt: new Date().toISOString(),
    approvedBy: reviewerId,
  });

  const emailHooks = await import("@/lib/email/hooks");
  void emailHooks.sendEscrowTransferApprovedEmail(
    request.user_id,
    Number(request.amount),
    "/dashboard",
  );
  void emailHooks.sendFundsReleasedEmail(
    request.user_id,
    Number(request.amount),
    "/dashboard",
  );

  revalidateEscrowPaths(request.user_id);
  return {};
}

export async function finalizeEscrowTransferRejection(
  withdrawalRequestId: string,
  reviewerId: string,
  reason: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("withdrawal_requests")
    .select("id, user_id, amount, destination_details")
    .eq("id", withdrawalRequestId)
    .maybeSingle();

  if (!request) {
    return { error: "Withdrawal request not found." };
  }

  const isEscrow =
    (request.destination_details as Record<string, string> | null)?.transferType ===
    "escrow_to_seller";

  if (!isEscrow) {
    return {};
  }

  const application = await fetchLatestApplicationForUser(request.user_id);
  if (!application) {
    return {};
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const closingMeta = parseClosingFundsMeta(personalInfo);
  const existing = closingMeta?.escrowTransfer;
  const pathwardRestore = Number(existing?.pathwardBalanceAtTransfer ?? 0);

  if (pathwardRestore > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("pathward_account_balance")
      .eq("id", request.user_id)
      .maybeSingle();

    await supabase
      .from("profiles")
      .update({
        pathward_account_balance:
          Number(profile?.pathward_account_balance ?? 0) + pathwardRestore,
      })
      .eq("id", request.user_id);
  }

  if (existing) {
    await persistEscrowTransferMeta(application.id, personalInfo, {
      ...existing,
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectedReason: reason,
      approvedBy: reviewerId,
    });
  }

  revalidateEscrowPaths(request.user_id);
  return {};
}
