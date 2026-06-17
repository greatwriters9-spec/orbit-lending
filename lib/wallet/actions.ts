"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { transitionApplicationStatus } from "@/lib/applications/engine/processor";
import { calculateLoanPayment } from "@/lib/loans/calculator";
import { generateRepaymentScheduleForLoan } from "@/lib/repayments/actions";
import { assertClientAccountAllows } from "@/lib/auth/account-enforcement";
import { logAuditEntry } from "@/lib/finance/audit";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWallet } from "@/lib/wallet/ledger";
import { createNotification } from "@/lib/wallet/notifications";
import { generateReferenceNumber } from "@/lib/wallet/utils";
import { mirrorWalletTransaction } from "@/lib/transactions/wallet-bridge";
import { syncMortgageToPathwardClosing } from "@/lib/wallet/pathward-closing";
import type { WalletActionState } from "@/types/wallet";

const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  withdrawalMethod: z.enum([
    "bank_transfer",
    "debit_card",
    "credit_card",
    "crypto",
    "other",
  ]),
  destinationDetails: z.record(z.string(), z.string()).refine(
    (details) => Object.values(details).some((v) => v.trim().length > 0),
    "Destination details are required.",
  ),
  notes: z.string().optional(),
});

function revalidateTransactionPaths() {
  revalidatePath("/dashboard/transactions");
  revalidatePath("/finance/transactions");
}

export async function requestWithdrawalAction(
  input: z.infer<typeof withdrawSchema>,
): Promise<WalletActionState> {
  const parsed = withdrawSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

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

  const wallet = await getOrCreateWallet(user.id);

  if (parsed.data.amount > wallet.availableBalance) {
    return {
      error: `Insufficient available balance. You have $${wallet.availableBalance.toFixed(2)} available.`,
    };
  }

  const referenceNumber = generateReferenceNumber("WDR");

  const { data: withdrawal, error: withdrawalError } = await supabase
    .from("withdrawal_requests")
    .insert({
      wallet_id: wallet.id,
      user_id: user.id,
      amount: parsed.data.amount,
      withdrawal_method: parsed.data.withdrawalMethod,
      destination_details: parsed.data.destinationDetails,
      notes: parsed.data.notes ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (withdrawalError || !withdrawal) {
    return { error: withdrawalError?.message ?? "Failed to create withdrawal request." };
  }

  const { error: walletError } = await supabase
    .from("wallets")
    .update({
      available_balance: wallet.availableBalance - parsed.data.amount,
      pending_balance: wallet.pendingBalance + parsed.data.amount,
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
      amount: parsed.data.amount,
      status: "pending",
      description: `Withdrawal request — ${parsed.data.withdrawalMethod.replace(/_/g, " ")}`,
      reference_number: referenceNumber,
      withdrawal_request_id: withdrawal.id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (txError || !walletTx) {
    return { error: txError?.message ?? "Failed to create withdrawal transaction." };
  }

  await mirrorWalletTransaction({
    borrowerId: user.id,
    walletTransactionId: walletTx.id,
    walletType: "withdrawal_request",
    amount: parsed.data.amount,
    status: "pending",
    referenceNumber,
    description: `Withdrawal request — ${parsed.data.withdrawalMethod.replace(/_/g, " ")}`,
    createdBy: user.id,
    previousBalance: wallet.availableBalance,
    newBalance: wallet.availableBalance - parsed.data.amount,
    notify: {
      title: "Withdrawal Request Submitted",
      message: `Your withdrawal request for $${parsed.data.amount.toFixed(2)} is pending review.`,
    },
  });

  await logAuditEntry({
    action: "wallet.withdrawal_requested",
    entityType: "withdrawal_request",
    entityId: withdrawal.id,
    newValues: {
      amount: parsed.data.amount,
      method: parsed.data.withdrawalMethod,
      walletId: wallet.id,
    },
  });

  await createNotification({
    userId: user.id,
    title: "Withdrawal Request Submitted",
    message: `Your withdrawal request for $${parsed.data.amount.toFixed(2)} is pending loan officer approval.`,
    type: "withdrawal_requested",
    metadata: { withdrawalRequestId: withdrawal.id, amount: parsed.data.amount },
  });

  revalidatePath("/wallet");
  revalidatePath("/wallet/withdraw");
  revalidateTransactionPaths();

  return {
    success: "Withdrawal request submitted. Funds are held pending approval.",
  };
}

export async function fundLoanAction(
  applicationId: string,
): Promise<WalletActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found." };
  }

  if (application.status !== "approved") {
    return {
      error: `Funding blocked. Application status is "${application.status}". Only approved applications can be funded.`,
    };
  }

  const approvedAmount = Number(
    application.approved_amount ?? application.requested_amount ?? 0,
  );

  if (approvedAmount <= 0) {
    return { error: "Approved amount is not set. Cannot fund this application." };
  }

  const { data: existingLoan } = await supabase
    .from("loans")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();

  if (existingLoan) {
    return { error: "This application has already been funded." };
  }

  const wallet = await getOrCreateWallet(application.user_id);
  const referenceNumber = generateReferenceNumber("FND");
  const fundedAt = new Date().toISOString();

  const { data: offer } = await supabase
    .from("loan_offers")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const interestRate = Number(offer?.offered_interest_rate ?? 0);
  const repaymentFrequency = offer?.repayment_frequency ?? "Monthly";
  const repaymentPeriod = Number(offer?.repayment_period ?? 12);
  const calculation = calculateLoanPayment({
    principal: approvedAmount,
    annualInterestRate: interestRate,
    repaymentPeriod,
    repaymentFrequency,
  });
  const totalRepayment = calculation?.totalRepayment ??
    approvedAmount * (1 + interestRate / 100) * (repaymentPeriod / 12);

  const { data: fundingTx, error: txError } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      transaction_type: "loan_funding",
      amount: approvedAmount,
      status: "completed",
      description: `Loan funding — Application ${application.application_number ?? applicationId.slice(0, 8)}`,
      reference_number: referenceNumber,
      application_id: applicationId,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (txError || !fundingTx) {
    await createNotification({
      userId: application.user_id,
      title: "Funding Failed",
      message: `Loan funding could not be completed. Please contact support.`,
      type: "funding_failed",
      metadata: { applicationId },
    });
    return { error: txError.message };
  }

  const { error: walletError } = await supabase
    .from("wallets")
    .update({
      available_balance: wallet.availableBalance + approvedAmount,
      total_funded: wallet.totalFunded + approvedAmount,
      current_loan_exposure: wallet.currentLoanExposure + approvedAmount,
    })
    .eq("id", wallet.id);

  if (walletError) {
    return { error: walletError.message };
  }

  const { error: appError } = await supabase
    .from("loan_applications")
    .update({
      funded_at: fundedAt,
      approved_amount: approvedAmount,
    })
    .eq("id", applicationId);

  if (appError) {
    return { error: appError.message };
  }

  const fundResult = await transitionApplicationStatus(applicationId, "funded", {
    note: `Loan funded for $${approvedAmount.toFixed(2)} via Pathward National Bank.`,
    auditAction: "loan.funded",
    auditOldValues: {
      status: application.status,
      availableBalance: wallet.availableBalance,
    },
    auditNewValues: {
      fundedAmount: approvedAmount,
      referenceNumber,
      walletId: wallet.id,
      fundedAt,
    },
    skipValidation: true,
  });

  if (fundResult.error) {
    return { error: fundResult.error };
  }

  await transitionApplicationStatus(applicationId, "active", {
    note: "Loan activated after wallet funding.",
    skipValidation: true,
  });

  const maturityDate = new Date();
  maturityDate.setMonth(maturityDate.getMonth() + repaymentPeriod);

  const { data: createdLoan, error: loanInsertError } = await supabase
    .from("loans")
    .insert({
      user_id: application.user_id,
      application_id: applicationId,
      loan_offer_id: offer?.id ?? null,
      principal_amount: approvedAmount,
      interest_rate: interestRate,
      repayment_frequency: repaymentFrequency,
      repayment_period: repaymentPeriod,
      total_repayment_amount: totalRepayment,
      remaining_balance: totalRepayment,
      maturity_date: maturityDate.toISOString().split("T")[0],
      status: "active",
      funded_at: fundedAt,
    })
    .select("id")
    .single();

  if (loanInsertError || !createdLoan) {
    return { error: loanInsertError?.message ?? "Failed to create loan record." };
  }

  await generateRepaymentScheduleForLoan(createdLoan.id);

  await syncMortgageToPathwardClosing(
    supabase,
    application.user_id,
    applicationId,
    approvedAmount,
  );

  await mirrorWalletTransaction({
    borrowerId: application.user_id,
    walletTransactionId: fundingTx.id,
    walletType: "loan_funding",
    amount: approvedAmount,
    status: "completed",
    referenceNumber,
    description: `Loan funding — Application ${application.application_number ?? applicationId.slice(0, 8)}`,
    applicationId,
    loanId: createdLoan.id,
    createdBy: user.id,
    previousBalance: wallet.availableBalance,
    newBalance: wallet.availableBalance + approvedAmount,
    isCredit: true,
    notify: {
      title: "Loan Disbursement Completed",
      message: `$${approvedAmount.toFixed(2)} has been disbursed to your funding account.`,
    },
  });

  await createNotification({
    userId: application.user_id,
    title: "Loan Funded",
    message: `$${approvedAmount.toFixed(2)} has been credited to your funding account. Powered by Pathward National Bank.`,
    type: "loan_funded",
    metadata: { applicationId, amount: approvedAmount, referenceNumber },
  });

  revalidatePath("/finance/funding");
  revalidatePath("/finance/dashboard");
  revalidatePath("/finance/repayments");
  revalidatePath("/wallet");
  revalidatePath("/dashboard/repayments");
  revalidatePath(`/finance/applications/${applicationId}`);
  revalidateTransactionPaths();

  return {
    success: `Loan funded successfully. $${approvedAmount.toFixed(2)} credited to client wallet.`,
  };
}

export async function approveWithdrawalAction(
  withdrawalRequestId: string,
  note?: string,
): Promise<WalletActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { data: request } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("id", withdrawalRequestId)
    .maybeSingle();

  if (!request || request.status !== "pending") {
    return { error: "Withdrawal request not found or already processed." };
  }

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("id", request.wallet_id)
    .single();

  if (!wallet) {
    return { error: "Wallet not found." };
  }

  const amount = Number(request.amount);
  const referenceNumber = generateReferenceNumber("WAP");

  const { error: walletError } = await supabase
    .from("wallets")
    .update({
      pending_balance: Number(wallet.pending_balance) - amount,
      total_withdrawn: Number(wallet.total_withdrawn) + amount,
    })
    .eq("id", wallet.id);

  if (walletError) {
    return { error: walletError.message };
  }

  const { data: approvedTx } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      transaction_type: "withdrawal_approved",
      amount,
      status: "completed",
      description: note ?? "Withdrawal approved and processed.",
      reference_number: referenceNumber,
      withdrawal_request_id: withdrawalRequestId,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (approvedTx) {
    await mirrorWalletTransaction({
      borrowerId: request.user_id,
      walletTransactionId: approvedTx.id,
      walletType: "withdrawal_approved",
      amount,
      status: "completed",
      referenceNumber,
      description: note ?? "Withdrawal approved and processed.",
      createdBy: user.id,
      notify: {
        title: "Withdrawal Approved",
        message: `Your withdrawal of $${amount.toFixed(2)} has been approved and processed.`,
      },
    });
  }

  await supabase
    .from("withdrawal_requests")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", withdrawalRequestId);

  await logAuditEntry({
    action: "wallet.withdrawal_approved",
    entityType: "withdrawal_request",
    entityId: withdrawalRequestId,
    oldValues: { status: "pending", pendingBalance: wallet.pending_balance },
    newValues: { status: "approved", amount, referenceNumber },
  });

  await createNotification({
    userId: request.user_id,
    title: "Withdrawal Approved",
    message: `Your withdrawal of $${amount.toFixed(2)} has been approved and processed via Pathward National Bank.`,
    type: "withdrawal_approved",
    metadata: { withdrawalRequestId, amount, referenceNumber },
  });

  revalidatePath("/finance/withdrawals");
  revalidatePath("/wallet");
  revalidateTransactionPaths();

  return { success: "Withdrawal approved and processed." };
}

export async function rejectWithdrawalAction(
  withdrawalRequestId: string,
  reason: string,
): Promise<WalletActionState> {
  const parsed = z.string().min(3).safeParse(reason);
  if (!parsed.success) {
    return { error: "Rejection reason must be at least 3 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { data: request } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("id", withdrawalRequestId)
    .maybeSingle();

  if (!request || request.status !== "pending") {
    return { error: "Withdrawal request not found or already processed." };
  }

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("id", request.wallet_id)
    .single();

  if (!wallet) {
    return { error: "Wallet not found." };
  }

  const amount = Number(request.amount);
  const referenceNumber = generateReferenceNumber("WRJ");

  const { error: walletError } = await supabase
    .from("wallets")
    .update({
      pending_balance: Number(wallet.pending_balance) - amount,
      available_balance: Number(wallet.available_balance) + amount,
    })
    .eq("id", wallet.id);

  if (walletError) {
    return { error: walletError.message };
  }

  const { data: rejectedTx } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      transaction_type: "withdrawal_rejected",
      amount,
      status: "completed",
      description: `Withdrawal rejected: ${reason}`,
      reference_number: referenceNumber,
      withdrawal_request_id: withdrawalRequestId,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (rejectedTx) {
    await mirrorWalletTransaction({
      borrowerId: request.user_id,
      walletTransactionId: rejectedTx.id,
      walletType: "withdrawal_rejected",
      amount,
      status: "completed",
      referenceNumber,
      description: `Withdrawal rejected: ${reason}`,
      createdBy: user.id,
      isCredit: true,
      notify: {
        title: "Withdrawal Rejected",
        message: `Your withdrawal request was rejected. Reason: ${reason}`,
      },
    });
  }

  await supabase
    .from("withdrawal_requests")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq("id", withdrawalRequestId);

  await logAuditEntry({
    action: "wallet.withdrawal_rejected",
    entityType: "withdrawal_request",
    entityId: withdrawalRequestId,
    oldValues: {
      status: "pending",
      availableBalance: wallet.available_balance,
      pendingBalance: wallet.pending_balance,
    },
    newValues: { status: "rejected", reason, amount, referenceNumber },
  });

  await createNotification({
    userId: request.user_id,
    title: "Withdrawal Rejected",
    message: `Your withdrawal request for $${amount.toFixed(2)} was rejected. Funds have been returned to your available balance. Reason: ${reason}`,
    type: "withdrawal_rejected",
    metadata: { withdrawalRequestId, amount, reason },
  });

  revalidatePath("/finance/withdrawals");
  revalidatePath("/wallet");
  revalidateTransactionPaths();

  return { success: "Withdrawal rejected. Funds returned to available balance." };
}

export async function createManualAdjustmentAction(input: {
  userId: string;
  amount: number;
  type: "credit" | "debit";
  reason: string;
}): Promise<WalletActionState> {
  const schema = z.object({
    userId: z.string().uuid(),
    amount: z.number().positive(),
    type: z.enum(["credit", "debit"]),
    reason: z.string().min(5),
  });

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const wallet = await getOrCreateWallet(parsed.data.userId);
  const referenceNumber = generateReferenceNumber("ADJ");
  const isCredit = parsed.data.type === "credit";

  if (!isCredit && parsed.data.amount > wallet.availableBalance) {
    return { error: "Insufficient available balance for debit adjustment." };
  }

  const { error: walletError } = await supabase
    .from("wallets")
    .update({
      available_balance: isCredit
        ? wallet.availableBalance + parsed.data.amount
        : wallet.availableBalance - parsed.data.amount,
    })
    .eq("id", wallet.id);

  if (walletError) {
    return { error: walletError.message };
  }

  const { data: adjustmentTx } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      transaction_type: "manual_adjustment",
      amount: parsed.data.amount,
      status: "completed",
      description: `Manual ${parsed.data.type}: ${parsed.data.reason}`,
      reference_number: referenceNumber,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (adjustmentTx) {
    await mirrorWalletTransaction({
      borrowerId: parsed.data.userId,
      walletTransactionId: adjustmentTx.id,
      walletType: "manual_adjustment",
      amount: parsed.data.amount,
      status: "completed",
      referenceNumber,
      description: `Manual ${parsed.data.type}: ${parsed.data.reason}`,
      createdBy: user.id,
      isCredit,
      notify: {
        title: isCredit ? "Adjustment Applied" : "Funding Account Debit Applied",
        message: `A manual ${parsed.data.type} of $${parsed.data.amount.toFixed(2)} was applied. Reason: ${parsed.data.reason}`,
      },
    });
  }

  await logAuditEntry({
    action: isCredit ? "wallet.manual_credit" : "wallet.manual_debit",
    entityType: "wallet",
    entityId: wallet.id,
    oldValues: { availableBalance: wallet.availableBalance },
    newValues: {
      availableBalance: isCredit
        ? wallet.availableBalance + parsed.data.amount
        : wallet.availableBalance - parsed.data.amount,
      reason: parsed.data.reason,
      amount: parsed.data.amount,
    },
  });

  await createNotification({
    userId: parsed.data.userId,
    title: isCredit ? "Funding Account Credit" : "Funding Account Debit",
    message: `A manual ${parsed.data.type} of $${parsed.data.amount.toFixed(2)} was applied to your funding account. Reason: ${parsed.data.reason}`,
    type: isCredit ? "wallet_credit" : "wallet_debit",
    metadata: { amount: parsed.data.amount, reason: parsed.data.reason },
  });

  revalidatePath("/wallet");
  revalidatePath("/finance/withdrawals");
  revalidateTransactionPaths();

  return { success: `Manual ${parsed.data.type} applied successfully.` };
}
