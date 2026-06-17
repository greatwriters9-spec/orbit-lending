"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { transitionApplicationStatus } from "@/lib/applications/engine/processor";
import { requireFinanceStaff } from "@/lib/auth/guards";
import { resolveRole } from "@/lib/auth/navigation";
import { logAuditEntry } from "@/lib/finance/audit";
import { notifyRepaymentEvent } from "@/lib/notifications/service";
import { logRepaymentActivity } from "@/lib/repayments/activity-log";
import {
  REPAYMENT_GRACE_PERIOD_DAYS,
  REPAYMENT_OVERDUE_THRESHOLD_DAYS,
} from "@/lib/repayments/constants";
import {
  calculateLoanHealth,
  calculateRepaymentProgress,
} from "@/lib/repayments/health";
import {
  canManageRepayments,
  canOverrideRepaymentSchedule,
} from "@/lib/repayments/permissions";
import {
  buildRepaymentSchedule,
  generateLoanNumber,
} from "@/lib/repayments/schedule-generator";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWallet } from "@/lib/wallet/ledger";
import { mirrorWalletTransaction } from "@/lib/transactions/wallet-bridge";
import { recordPlatformTransaction } from "@/lib/transactions/record";
import { generateReferenceNumber } from "@/lib/wallet/utils";
import type { RepaymentActionState } from "@/types/repayments";

const paymentSubmissionSchema = z.object({
  repaymentId: z.string().uuid(),
  paymentMethod: z.enum([
    "bank_transfer",
    "ach_transfer",
    "wire_transfer",
    "wallet_balance",
  ]),
  amount: z.number().positive("Amount must be greater than zero."),
  referenceNumber: z.string().min(3, "Reference number is required."),
  notes: z.string().optional(),
  proofDocumentUrl: z.string().url().optional().or(z.literal("")),
});

async function refreshLoanMetrics(loanId: string) {
  const supabase = await createClient();

  const [{ data: loan }, { data: scheduleRows }] = await Promise.all([
    supabase.from("loans").select("id").eq("id", loanId).maybeSingle(),
    supabase
      .from("loan_repayments")
      .select("status")
      .eq("loan_id", loanId),
  ]);

  if (!loan || !scheduleRows) {
    return;
  }

  const schedule = scheduleRows.map((row) => ({
    status: row.status as (typeof scheduleRows)[number]["status"],
  }));
  const paidInstallments = schedule.filter((item) => item.status === "paid").length;
  const health = calculateLoanHealth({ schedule });
  const progress = calculateRepaymentProgress({
    totalInstallments: schedule.length,
    paidInstallments,
  });

  await supabase
    .from("loans")
    .update({
      loan_health_rating: health.rating,
      loan_health_score: health.score,
      repayment_progress_percent: progress,
      paid_installments: paidInstallments,
    })
    .eq("id", loanId);
}

function revalidateTransactionPaths() {
  revalidatePath("/dashboard/transactions");
  revalidatePath("/finance/transactions");
}

async function completeLoanIfPaidOff(loanId: string, actorId?: string, actorRole?: string) {
  const supabase = await createClient();
  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .maybeSingle();

  if (!loan || Number(loan.remaining_balance) > 0 || loan.status === "completed") {
    return false;
  }

  await supabase
    .from("loans")
    .update({
      status: "completed",
      remaining_balance: 0,
      repayment_progress_percent: 100,
      loan_health_rating: "excellent",
      loan_health_score: 100,
    })
    .eq("id", loanId);

  await supabase
    .from("wallets")
    .update({ current_loan_exposure: 0 })
    .eq("user_id", loan.user_id);

  await transitionApplicationStatus(loan.application_id, "completed", {
    note: "Loan fully repaid.",
    skipValidation: true,
  });

  await logRepaymentActivity({
    loanId,
    actorId,
    actorRole,
    action: "loan_completed",
    details: { remainingBalance: 0 },
  });

  await notifyRepaymentEvent(
    loan.user_id,
    "Congratulations! Mortgage Fully Repaid",
    `Your Orbit Mortgage mortgage ${loan.loan_number ?? ""} has been fully repaid. Thank you for banking with us.`,
    "critical",
    { showModal: true, sendEmail: true },
  );

  await recordPlatformTransaction({
    borrowerId: loan.user_id,
    loanId: loan.id,
    createdBy: actorId ?? null,
    transactionType: "loan_closed",
    category: "administrative",
    amount: Number(loan.approved_amount ?? loan.principal_amount ?? 0),
    direction: "debit",
    status: "completed",
    referenceNumber: generateReferenceNumber("LC"),
    description: `Loan ${loan.loan_number ?? loan.id.slice(0, 8)} fully repaid and closed.`,
    metadata: {
      loanNumber: loan.loan_number,
      applicationId: loan.application_id,
    },
    timeline: [
      { eventType: "created", title: "Transaction Created", actorId: actorId },
      { eventType: "completed", title: "Loan Closed", actorId: actorId },
    ],
  });

  return true;
}

export async function generateRepaymentScheduleForLoan(
  loanId: string,
): Promise<RepaymentActionState> {
  const supabase = await createClient();
  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .maybeSingle();

  if (!loan) {
    return { error: "Loan not found." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("application_number")
    .eq("id", loan.application_id)
    .maybeSingle();

  const { data: existing } = await supabase
    .from("loan_repayments")
    .select("id")
    .eq("loan_id", loanId)
    .limit(1);

  if (existing?.length) {
    return { success: "Repayment schedule already exists." };
  }

  const applicationNumber = application?.application_number ?? null;
  const loanNumber = generateLoanNumber(applicationNumber);
  const fundingDate = new Date(loan.funded_at ?? loan.start_date);

  const schedule = buildRepaymentSchedule({
    loanId,
    borrowerId: loan.user_id,
    principal: Number(loan.principal_amount),
    annualInterestRate: Number(loan.interest_rate),
    repaymentPeriod: Number(loan.repayment_period),
    repaymentFrequency: loan.repayment_frequency,
    fundingDate,
  });

  if (!schedule.length) {
    return { error: "Unable to generate repayment schedule." };
  }

  const totalRepayment = schedule[0]!.remaining_balance_before;

  await supabase.from("loan_repayments").insert(schedule);
  await supabase
    .from("loans")
    .update({
      loan_number: loanNumber,
      total_repayment_amount: totalRepayment,
      remaining_balance: totalRepayment,
      repayment_progress_percent: 0,
    })
    .eq("id", loanId);

  await logRepaymentActivity({
    loanId,
    action: "repayment_created",
    details: {
      installments: schedule.length,
      totalRepayment,
      loanNumber,
    },
  });

  await notifyRepaymentEvent(
    loan.user_id,
    "Repayment Schedule Created",
    `Your mortgage payment schedule for ${loanNumber} has been generated with ${schedule.length} installments. View your schedule in Repayments.`,
    "high",
  );

  return { success: "Repayment schedule generated." };
}

export async function submitPaymentAction(
  input: z.infer<typeof paymentSubmissionSchema>,
): Promise<RepaymentActionState> {
  const parsed = paymentSubmissionSchema.safeParse(input);
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

  const { data: repayment } = await supabase
    .from("loan_repayments")
    .select("*")
    .eq("id", parsed.data.repaymentId)
    .eq("borrower_id", user.id)
    .maybeSingle();

  if (!repayment) {
    return { error: "Installment not found." };
  }

  if (["paid", "waived", "pending_verification"].includes(repayment.status)) {
    return { error: "This installment cannot accept a new payment right now." };
  }

  const { data: submission, error } = await supabase
    .from("payment_submissions")
    .insert({
      repayment_id: repayment.id,
      borrower_id: user.id,
      payment_method: parsed.data.paymentMethod,
      amount: parsed.data.amount,
      reference_number: parsed.data.referenceNumber,
      proof_document_url: parsed.data.proofDocumentUrl || null,
      notes: parsed.data.notes ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !submission) {
    return { error: error?.message ?? "Failed to submit payment." };
  }

  await supabase
    .from("loan_repayments")
    .update({ status: "pending_verification" })
    .eq("id", repayment.id);

  await logRepaymentActivity({
    loanId: repayment.loan_id,
    repaymentId: repayment.id,
    actorId: user.id,
    actorRole: "client",
    action: "payment_submitted",
    details: {
      submissionId: submission.id,
      amount: parsed.data.amount,
      method: parsed.data.paymentMethod,
    },
  });

  await notifyRepaymentEvent(
    user.id,
    "Payment Submitted",
    `Your mortgage payment of $${parsed.data.amount.toFixed(2)} for installment #${repayment.installment_number} is pending verification.`,
    "high",
  );

  revalidatePath("/dashboard/repayments");
  revalidatePath("/finance/repayments");
  revalidateTransactionPaths();

  return { success: "Payment submitted for verification." };
}

export async function approvePaymentAction(
  submissionId: string,
  reviewNotes?: string,
): Promise<RepaymentActionState> {
  const ctx = await requireFinanceStaff();
  if (!canManageRepayments(ctx.role)) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();
  const { data: submission } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission || submission.status !== "pending") {
    return { error: "Payment submission not found or already processed." };
  }

  const { data: repayment } = await supabase
    .from("loan_repayments")
    .select("*")
    .eq("id", submission.repayment_id)
    .maybeSingle();

  if (!repayment) {
    return { error: "Repayment installment not found." };
  }

  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", repayment.loan_id)
    .maybeSingle();

  if (!loan) {
    return { error: "Loan not found." };
  }

  const amount = Number(submission.amount);
  const wallet = await getOrCreateWallet(loan.user_id);

  if (
    submission.payment_method === "wallet_balance" &&
    amount > wallet.availableBalance
  ) {
    return { error: "Insufficient wallet balance for this payment." };
  }

  const referenceNumber = generateReferenceNumber("RPY");

  if (submission.payment_method === "wallet_balance") {
    await supabase
      .from("wallets")
      .update({
        available_balance: wallet.availableBalance - amount,
        total_repaid: Number(wallet.totalRepaid ?? 0) + amount,
      })
      .eq("id", wallet.id);
  } else {
    await supabase
      .from("wallets")
      .update({
        total_repaid: Number(wallet.totalRepaid ?? 0) + amount,
      })
      .eq("id", wallet.id);
  }

  const { data: repaymentTx } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      transaction_type: "repayment_received",
      amount,
      status: "completed",
      description: `Repayment received — Installment #${repayment.installment_number}`,
      reference_number: referenceNumber,
      application_id: loan.application_id,
      created_by: ctx.user.id,
    })
    .select("id")
    .single();

  if (repaymentTx) {
    await mirrorWalletTransaction({
      borrowerId: loan.user_id,
      walletTransactionId: repaymentTx.id,
      walletType: "repayment_received",
      amount,
      status: "completed",
      referenceNumber,
      description: `Repayment received — Installment #${repayment.installment_number}`,
      applicationId: loan.application_id,
      loanId: loan.id,
      repaymentId: repayment.id,
      createdBy: ctx.user.id,
      notify: {
        title: "Repayment Received",
        message: `Your repayment of $${amount.toFixed(2)} has been applied to loan ${loan.loan_number ?? ""}.`,
      },
    });
  }

  const newRemainingBalance = Math.max(
    Number(loan.remaining_balance) - amount,
    0,
  );

  await supabase
    .from("payment_submissions")
    .update({
      status: "approved",
      reviewed_by: ctx.user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
    })
    .eq("id", submissionId);

  await supabase
    .from("loan_repayments")
    .update({
      status: "paid",
      remaining_balance_after: newRemainingBalance,
    })
    .eq("id", repayment.id);

  await supabase
    .from("loans")
    .update({
      remaining_balance: newRemainingBalance,
      total_paid_amount: Number(loan.total_paid_amount ?? 0) + amount,
    })
    .eq("id", loan.id);

  await refreshLoanMetrics(loan.id);

  await logRepaymentActivity({
    loanId: loan.id,
    repaymentId: repayment.id,
    actorId: ctx.user.id,
    actorRole: ctx.role,
    action: "payment_approved",
    details: { submissionId, amount, referenceNumber },
  });

  await logAuditEntry({
    action: "repayment.payment_approved",
    entityType: "payment_submission",
    entityId: submissionId,
    newValues: { amount, loanId: loan.id, repaymentId: repayment.id },
  });

  await notifyRepaymentEvent(
    loan.user_id,
    "Payment Approved",
    `Your mortgage payment of $${amount.toFixed(2)} for installment #${repayment.installment_number} on mortgage ${loan.loan_number ?? ""} has been approved.`,
    "high",
  );

  await completeLoanIfPaidOff(loan.id, ctx.user.id, ctx.role);

  revalidatePath("/dashboard/repayments");
  revalidatePath("/finance/repayments");
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidateTransactionPaths();

  return { success: "Payment approved and applied to the loan." };
}

export async function rejectPaymentAction(
  submissionId: string,
  reason: string,
): Promise<RepaymentActionState> {
  const parsedReason = z.string().min(3).safeParse(reason);
  if (!parsedReason.success) {
    return { error: "Rejection reason must be at least 3 characters." };
  }

  const ctx = await requireFinanceStaff();
  if (!canManageRepayments(ctx.role)) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();
  const { data: submission } = await supabase
    .from("payment_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission || submission.status !== "pending") {
    return { error: "Payment submission not found or already processed." };
  }

  const { data: repayment } = await supabase
    .from("loan_repayments")
    .select("*")
    .eq("id", submission.repayment_id)
    .maybeSingle();

  if (!repayment) {
    return { error: "Repayment installment not found." };
  }

  const restoreStatus = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${repayment.due_date}T00:00:00`);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < -REPAYMENT_OVERDUE_THRESHOLD_DAYS) return "overdue";
    if (diffDays < -REPAYMENT_GRACE_PERIOD_DAYS) return "late";
    if (diffDays === 0) return "due_today";
    return "upcoming";
  })();

  await supabase
    .from("payment_submissions")
    .update({
      status: "rejected",
      reviewed_by: ctx.user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reason,
    })
    .eq("id", submissionId);

  await supabase
    .from("loan_repayments")
    .update({ status: restoreStatus })
    .eq("id", repayment.id);

  await logRepaymentActivity({
    loanId: repayment.loan_id,
    repaymentId: repayment.id,
    actorId: ctx.user.id,
    actorRole: ctx.role,
    action: "payment_rejected",
    details: { submissionId, reason },
  });

  await notifyRepaymentEvent(
    submission.borrower_id,
    "Payment Rejected",
    `Your mortgage payment submission for installment #${repayment.installment_number} was rejected. Reason: ${reason}`,
    "critical",
  );

  revalidatePath("/dashboard/repayments");
  revalidatePath("/finance/repayments");

  return { success: "Payment rejected and client notified." };
}

export async function waiveInstallmentAction(
  repaymentId: string,
  reason: string,
): Promise<RepaymentActionState> {
  const parsedReason = z.string().min(3).safeParse(reason);
  if (!parsedReason.success) {
    return { error: "Reason must be at least 3 characters." };
  }

  const ctx = await requireFinanceStaff();
  if (!canManageRepayments(ctx.role)) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();
  const { data: repayment } = await supabase
    .from("loan_repayments")
    .select("*")
    .eq("id", repaymentId)
    .maybeSingle();

  if (!repayment || repayment.status === "paid") {
    return { error: "Installment not found or already paid." };
  }

  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", repayment.loan_id)
    .maybeSingle();

  if (!loan) {
    return { error: "Loan not found." };
  }

  const newRemainingBalance = Math.max(
    Number(loan.remaining_balance) - Number(repayment.installment_amount),
    0,
  );

  await supabase
    .from("loan_repayments")
    .update({
      status: "waived",
      remaining_balance_after: newRemainingBalance,
    })
    .eq("id", repaymentId);

  await supabase
    .from("loans")
    .update({ remaining_balance: newRemainingBalance })
    .eq("id", loan.id);

  await refreshLoanMetrics(loan.id);

  await logRepaymentActivity({
    loanId: loan.id,
    repaymentId,
    actorId: ctx.user.id,
    actorRole: ctx.role,
    action: "repayment_waived",
    details: { reason },
  });

  await notifyRepaymentEvent(
    loan.user_id,
    "Installment Waived",
    `Installment #${repayment.installment_number} on mortgage ${loan.loan_number ?? ""} has been waived.`,
    "high",
  );

  await completeLoanIfPaidOff(loan.id, ctx.user.id, ctx.role);

  revalidatePath("/dashboard/repayments");
  revalidatePath("/finance/repayments");

  return { success: "Installment waived." };
}

export async function extendDueDateAction(
  repaymentId: string,
  newDueDate: string,
  reason: string,
): Promise<RepaymentActionState> {
  const ctx = await requireFinanceStaff();
  if (!canManageRepayments(ctx.role)) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();
  const { data: repayment } = await supabase
    .from("loan_repayments")
    .select("*")
    .eq("id", repaymentId)
    .maybeSingle();

  if (!repayment || ["paid", "waived"].includes(repayment.status)) {
    return { error: "Installment cannot be rescheduled." };
  }

  await supabase
    .from("loan_repayments")
    .update({
      due_date: newDueDate,
      status: "upcoming",
    })
    .eq("id", repaymentId);

  await logRepaymentActivity({
    loanId: repayment.loan_id,
    repaymentId,
    actorId: ctx.user.id,
    actorRole: ctx.role,
    action: "due_date_extended",
    details: { previousDueDate: repayment.due_date, newDueDate, reason },
  });

  revalidatePath("/dashboard/repayments");
  revalidatePath("/finance/repayments");

  return { success: "Due date extended." };
}

export async function markInstallmentPaidManuallyAction(
  repaymentId: string,
  notes?: string,
): Promise<RepaymentActionState> {
  const ctx = await requireFinanceStaff();
  if (!canManageRepayments(ctx.role)) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();
  const { data: repayment } = await supabase
    .from("loan_repayments")
    .select("*")
    .eq("id", repaymentId)
    .maybeSingle();

  if (!repayment || ["paid", "waived"].includes(repayment.status)) {
    return { error: "Installment not eligible for manual payment." };
  }

  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", repayment.loan_id)
    .maybeSingle();

  if (!loan) {
    return { error: "Loan not found." };
  }

  const amount = Number(repayment.installment_amount);
  const wallet = await getOrCreateWallet(loan.user_id);
  const referenceNumber = generateReferenceNumber("RMP");
  const newRemainingBalance = Math.max(
    Number(loan.remaining_balance) - amount,
    0,
  );

  const { data: manualRepaymentTx } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      transaction_type: "repayment_received",
      amount,
      status: "completed",
      description: `Manual repayment — Installment #${repayment.installment_number}`,
      reference_number: referenceNumber,
      application_id: loan.application_id,
      created_by: ctx.user.id,
    })
    .select("id")
    .single();

  if (manualRepaymentTx) {
    await mirrorWalletTransaction({
      borrowerId: loan.user_id,
      walletTransactionId: manualRepaymentTx.id,
      walletType: "repayment_received",
      amount,
      status: "completed",
      referenceNumber,
      description: `Manual repayment — Installment #${repayment.installment_number}`,
      applicationId: loan.application_id,
      loanId: loan.id,
      repaymentId,
      createdBy: ctx.user.id,
      notify: {
        title: "Repayment Applied",
        message: `Installment #${repayment.installment_number} has been marked as paid.`,
      },
    });
  }

  await supabase
    .from("wallets")
    .update({
      total_repaid: Number(wallet.totalRepaid ?? 0) + amount,
    })
    .eq("id", wallet.id);

  await supabase
    .from("loan_repayments")
    .update({
      status: "paid",
      remaining_balance_after: newRemainingBalance,
    })
    .eq("id", repaymentId);

  await supabase
    .from("loans")
    .update({
      remaining_balance: newRemainingBalance,
      total_paid_amount: Number(loan.total_paid_amount ?? 0) + amount,
    })
    .eq("id", loan.id);

  await refreshLoanMetrics(loan.id);

  await logRepaymentActivity({
    loanId: loan.id,
    repaymentId,
    actorId: ctx.user.id,
    actorRole: ctx.role,
    action: "manual_payment_applied",
    details: { amount, notes },
  });

  await notifyRepaymentEvent(
    loan.user_id,
    "Payment Applied",
    `Installment #${repayment.installment_number} on mortgage ${loan.loan_number ?? ""} has been marked as paid.`,
    "high",
  );

  await completeLoanIfPaidOff(loan.id, ctx.user.id, ctx.role);

  revalidatePath("/dashboard/repayments");
  revalidatePath("/finance/repayments");
  revalidateTransactionPaths();

  return { success: "Installment marked as paid." };
}

export async function uploadPaymentProofAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Select a file to upload." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "File must be 5 MB or smaller." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const path = `${user.id}/${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("repayment-proofs")
    .upload(path, buffer, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from("repayment-proofs").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function processRepaymentStatusMaintenance(): Promise<{
  updated: number;
}> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: installments } = await supabase
    .from("loan_repayments")
    .select("*")
    .in("status", ["upcoming", "due_today", "late"]);

  let updated = 0;

  for (const installment of installments ?? []) {
    const due = new Date(`${installment.due_date}T00:00:00`);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    let nextStatus = installment.status;
    if (diffDays === 0 && installment.status === "upcoming") {
      nextStatus = "due_today";
    } else if (
      diffDays < 0 &&
      Math.abs(diffDays) <= REPAYMENT_GRACE_PERIOD_DAYS &&
      ["upcoming", "due_today"].includes(installment.status)
    ) {
      nextStatus = "late";
    } else if (
      diffDays < -REPAYMENT_GRACE_PERIOD_DAYS &&
      ["upcoming", "due_today", "late"].includes(installment.status)
    ) {
      nextStatus = "overdue";
    }

    if (nextStatus !== installment.status) {
      await supabase
        .from("loan_repayments")
        .update({ status: nextStatus })
        .eq("id", installment.id);
      updated += 1;

      if (nextStatus === "overdue") {
        const { data: loan } = await supabase
          .from("loans")
          .select("user_id, loan_number")
          .eq("id", installment.loan_id)
          .maybeSingle();

        if (loan) {
          await notifyRepaymentEvent(
            loan.user_id,
            "Payment Overdue",
            `Installment #${installment.installment_number} on mortgage ${loan.loan_number ?? ""} is overdue. Please submit payment immediately.`,
            "critical",
          );
        }
      }
    }
  }

  const loanIds = [...new Set((installments ?? []).map((item) => item.loan_id))];
  for (const loanId of loanIds) {
    await refreshLoanMetrics(loanId);
  }

  return { updated };
}

export async function processRepaymentReminders(): Promise<{ sent: number }> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: installments } = await supabase
    .from("loan_repayments")
    .select("*")
    .in("status", ["upcoming", "due_today", "late", "overdue"]);

  let sent = 0;

  for (const installment of installments ?? []) {
    const due = new Date(`${installment.due_date}T00:00:00`);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const reminderType =
      diffDays === 7
        ? "7_days_before"
        : diffDays === 3
          ? "3_days_before"
          : diffDays === 0
            ? "due_today"
            : diffDays === -1
              ? "1_day_late"
              : diffDays === -7
                ? "7_days_late"
                : null;

    if (!reminderType) {
      continue;
    }

    const { data: existing } = await supabase
      .from("repayment_reminder_logs")
      .select("id")
      .eq("repayment_id", installment.id)
      .eq("reminder_type", reminderType)
      .maybeSingle();

    if (existing) {
      continue;
    }

    const { data: loan } = await supabase
      .from("loans")
      .select("user_id, loan_number")
      .eq("id", installment.loan_id)
      .maybeSingle();

    if (!loan) {
      continue;
    }
    const titles: Record<string, string> = {
      "7_days_before": "Upcoming Payment Reminder",
      "3_days_before": "Mortgage Payment Due in 3 Days",
      due_today: "Mortgage Payment Due Today",
      "1_day_late": "Payment Is Late",
      "7_days_late": "Urgent: Payment Overdue",
    };

    await notifyRepaymentEvent(
      loan.user_id,
      titles[reminderType] ?? "Repayment Reminder",
      `Mortgage ${loan.loan_number ?? ""} — Installment #${installment.installment_number} of $${Number(installment.installment_amount).toFixed(2)} is ${reminderType.replace(/_/g, " ")}.`,
      reminderType.includes("late") ? "critical" : "high",
    );

    await supabase.from("repayment_reminder_logs").insert({
      repayment_id: installment.id,
      reminder_type: reminderType,
    });

    sent += 1;
  }

  return { sent };
}

export async function overrideRepaymentStatusAction(
  repaymentId: string,
  status: string,
  reason: string,
): Promise<RepaymentActionState> {
  const ctx = await requireFinanceStaff();
  if (!canOverrideRepaymentSchedule(ctx.role)) {
    return { error: "Only Chief Lending Officers can override repayment statuses." };
  }

  const supabase = await createClient();
  const { data: repayment } = await supabase
    .from("loan_repayments")
    .select("*")
    .eq("id", repaymentId)
    .maybeSingle();

  if (!repayment) {
    return { error: "Installment not found." };
  }

  await supabase
    .from("loan_repayments")
    .update({ status })
    .eq("id", repaymentId);

  await refreshLoanMetrics(repayment.loan_id);

  await logRepaymentActivity({
    loanId: repayment.loan_id,
    repaymentId,
    actorId: ctx.user.id,
    actorRole: resolveRole(ctx.profile?.role),
    action: "status_overridden",
    details: { status, reason },
  });

  revalidatePath("/dashboard/repayments");
  revalidatePath("/finance/repayments");

  return { success: "Repayment status updated." };
}

