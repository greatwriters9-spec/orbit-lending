"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { resolveInstitutionNameForUserId } from "@/lib/company/resolve-branding";
import { parseDownPaymentMeta } from "@/lib/dashboard/mortgage-journey";
import { parseClosingFundsMeta, parseEscrowTransferMeta, isEscrowTransferPending } from "@/lib/dashboard/closing-funds-meta";
import {
  buildAdminRequestedDepositMeta,
  buildEscrowPendingFundingMeta,
  buildPostAdminDepositVerifiedMeta,
  computeTotalRequiredFunding,
  isClosingDownPaymentComplete,
  resolveBaseDownPaymentAmount,
  resolveCurrentRequestLabel,
  resolveFundingPhase,
} from "@/lib/dashboard/funding-requirements";
import { getOrCreateWallet } from "@/lib/wallet/ledger";
import { generateReferenceNumber } from "@/lib/wallet/utils";
import { mirrorWalletTransaction } from "@/lib/transactions/wallet-bridge";
import { notifyAdmin } from "@/lib/notifications/notify";
import { createNotification } from "@/lib/wallet/notifications";
import { creditPathwardAccountBalance } from "@/lib/wallet/pathward-closing";
import type { DownPaymentMeta } from "@/types/mortgage-dashboard";
export type DownPaymentActionState = {
  error?: string;
  success?: string;
};

export async function submitDownPaymentVerificationAction(
  applicationId: string,
): Promise<DownPaymentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("id, user_id, personal_info, status, application_number")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found." };
  }

  if (!["approved", "funded"].includes(application.status)) {
    return {
      error:
        "Down payment can only be submitted after your mortgage application is approved.",
    };
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const existing = parseDownPaymentMeta(personalInfo);
  const onboarding = personalInfo.onboarding as
    | { preQualification?: { estimatedDownPayment?: number } }
    | undefined;
  const fallbackDownPayment =
    onboarding?.preQualification?.estimatedDownPayment ?? 0;
  const escrowTransfer = parseEscrowTransferMeta(personalInfo);
  const requiredAmount = computeTotalRequiredFunding(
    existing,
    fallbackDownPayment,
    escrowTransfer,
  );
  const requestLabel = resolveCurrentRequestLabel(existing, escrowTransfer);
  const phase = resolveFundingPhase(existing, escrowTransfer);

  const downPayment: DownPaymentMeta = {
    ...existing,
    status: "pending_verification",
    requiredAmount,
    baseDownPaymentAmount: resolveBaseDownPaymentAmount(existing, fallbackDownPayment),
    fundingPhase: phase,
    activeRequest: existing?.activeRequest,
    requestLabel,
    verificationRequestedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("loan_applications")
    .update({
      personal_info: {
        ...personalInfo,
        downPayment,
      },
    })
    .eq("id", applicationId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status: application.status,
    note:
      phase === "admin_requested"
        ? `Customer submitted ${requestLabel} deposit for verification.`
        : "Customer submitted down payment for verification.",
    changed_by: user.id,
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const applicantName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || profile?.email || "Applicant";

  void notifyAdmin({
    event:
      phase === "admin_requested"
        ? "DEPOSIT_VERIFICATION_REQUIRED"
        : "DOWN_PAYMENT_SUBMITTED",
    severity: "critical",
    payload: {
      name: applicantName,
      email: profile?.email,
      amount: requiredAmount,
      applicationId: application.application_number ?? applicationId,
      timestamp: new Date().toISOString(),
    },
    entityType: "application",
    entityId: applicationId,
    dashboardUrl: `/finance/applications/${applicationId}`,
  });

  const institutionName = await resolveInstitutionNameForUserId(user.id);

  await createNotification({
    userId: user.id,
    title: "Deposit Submitted for Verification",
    message: `Your down payment has been submitted for review. ${institutionName} will verify your deposit shortly.`,
    type: "application_update",
    metadata: { applicationId },
  });

  const { sendDepositSubmittedEmail } = await import("@/lib/email/hooks");
  void sendDepositSubmittedEmail(
    user.id,
    requiredAmount,
    `/dashboard/loans/${applicationId}`,
  );

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/loans/${applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/finance/applications");

  return { success: "Down payment submitted for verification." };
}

export async function reviewDownPaymentVerificationAction(input: {
  applicationId: string;
  decision: "approve" | "reject" | "request_proof";
  reason?: string;
}): Promise<DownPaymentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["super_admin", "admin", "finance_officer"].includes(profile.role)) {
    return { error: "You do not have permission to review down payments." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("id, user_id, personal_info, status, application_number")
    .eq("id", input.applicationId)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found." };
  }

  const institutionName = await resolveInstitutionNameForUserId(application.user_id);

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const existing = parseDownPaymentMeta(personalInfo);
  const escrowTransfer = parseEscrowTransferMeta(personalInfo);
  const onboarding = personalInfo.onboarding as
    | { preQualification?: { estimatedDownPayment?: number } }
    | undefined;
  const fallbackDownPayment =
    onboarding?.preQualification?.estimatedDownPayment ?? 0;
  const requiredAmount = computeTotalRequiredFunding(
    existing,
    fallbackDownPayment,
    escrowTransfer,
  );
  const phase = resolveFundingPhase(existing, escrowTransfer);
  const alreadyCredited = Number(existing?.pathwardCreditApplied ?? 0);
  const isAdminRequest = phase === "admin_requested";

  let downPayment: DownPaymentMeta =
    input.decision === "approve"
      ? {
          status: "verified",
          requiredAmount: isAdminRequest ? 0 : requiredAmount,
          baseDownPaymentAmount: resolveBaseDownPaymentAmount(
            existing,
            fallbackDownPayment,
          ),
          verifiedDownPaymentAmount:
            existing?.verifiedDownPaymentAmount ??
            resolveBaseDownPaymentAmount(existing, fallbackDownPayment),
          fundingPhase: isAdminRequest ? "escrow_pending" : "down_payment",
          activeRequest: isAdminRequest ? undefined : existing?.activeRequest,
          requestLabel: isAdminRequest ? undefined : existing?.requestLabel,
          verificationRequestedAt: existing?.verificationRequestedAt,
          verifiedAt: new Date().toISOString(),
          verifiedBy: user.id,
          pathwardCreditApplied: alreadyCredited,
        }
      : input.decision === "reject"
        ? {
            status: "rejected",
            requiredAmount,
            baseDownPaymentAmount: resolveBaseDownPaymentAmount(
              existing,
              fallbackDownPayment,
            ),
            fundingPhase: phase,
            activeRequest: existing?.activeRequest,
            requestLabel: existing?.requestLabel,
            verificationRequestedAt: existing?.verificationRequestedAt,
            rejectedReason: input.reason ?? "Deposit could not be verified.",
            pathwardCreditApplied: alreadyCredited,
          }
        : {
            status: "fully_funded",
            requiredAmount,
            baseDownPaymentAmount: resolveBaseDownPaymentAmount(
              existing,
              fallbackDownPayment,
            ),
            fundingPhase: phase,
            activeRequest: existing?.activeRequest,
            requestLabel: existing?.requestLabel,
            verificationRequestedAt: existing?.verificationRequestedAt,
            rejectedReason: input.reason ?? "Additional proof requested.",
            pathwardCreditApplied: alreadyCredited,
          };

  if (input.decision === "approve") {
    const { data: clientProfile } = await supabase
      .from("profiles")
      .select(
        "pathward_routing_number, pathward_account_number, pathward_account_balance",
      )
      .eq("id", application.user_id)
      .maybeSingle();

    if (
      !clientProfile?.pathward_routing_number ||
      !clientProfile?.pathward_account_number
    ) {
      return {
        error:
          "Link the client's Pathward account before verifying the deposit.",
      };
    }

    const currentPathwardBalance = Number(clientProfile.pathward_account_balance ?? 0);

    if (isAdminRequest && requiredAmount > 0) {
      const creditResult = await creditPathwardAccountBalance(
        supabase,
        application.user_id,
        requiredAmount,
      );

      if (creditResult.error) {
        return { error: creditResult.error };
      }

      const escrowPending = isEscrowTransferPending(escrowTransfer);

      if (escrowPending) {
        const wallet = await getOrCreateWallet(application.user_id);
        const referenceNumber = generateReferenceNumber("ADM");

        await supabase
          .from("wallets")
          .update({
            pending_balance: wallet.pendingBalance + requiredAmount,
          })
          .eq("id", wallet.id);

        const closingMeta = parseClosingFundsMeta(personalInfo);
        const pendingEscrow = closingMeta?.escrowTransfer;
        if (pendingEscrow?.withdrawalRequestId) {
          await supabase
            .from("withdrawal_requests")
            .update({
              amount: Number(pendingEscrow.amount) + requiredAmount,
            })
            .eq("id", pendingEscrow.withdrawalRequestId);

          personalInfo.closingFunds = {
            ...closingMeta,
            escrowTransfer: {
              ...pendingEscrow,
              amount: Number(pendingEscrow.amount) + requiredAmount,
            },
          };
        }

        const { data: creditTx } = await supabase
          .from("wallet_transactions")
          .insert({
            wallet_id: wallet.id,
            transaction_type: "system_credit",
            amount: requiredAmount,
            status: "completed",
            description: `${existing?.activeRequest?.label ?? "Additional deposit"} credited for escrow transfer`,
            reference_number: referenceNumber,
            application_id: input.applicationId,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (creditTx) {
          await mirrorWalletTransaction({
            borrowerId: application.user_id,
            walletTransactionId: creditTx.id,
            walletType: "system_credit",
            amount: requiredAmount,
            status: "completed",
            referenceNumber,
            description: `${existing?.activeRequest?.label ?? "Additional deposit"} credited for escrow transfer`,
            applicationId: input.applicationId,
            createdBy: user.id,
            isCredit: true,
            notify: {
              title: "Deposit Verified",
              message: `Your ${existing?.activeRequest?.label ?? "requested"} deposit of $${requiredAmount.toFixed(2)} has been verified and added to your funding account. ${institutionName} will complete your escrow transfer.`,
            },
          });
        }

        downPayment = buildPostAdminDepositVerifiedMeta(
          existing,
          fallbackDownPayment,
          requiredAmount,
        );
      } else {
        const base = resolveBaseDownPaymentAmount(existing, fallbackDownPayment);
        downPayment = {
          status: "verified",
          requiredAmount: 0,
          baseDownPaymentAmount: base,
          verifiedDownPaymentAmount: base,
          fundingPhase: "down_payment",
          activeRequest: undefined,
          requestLabel: undefined,
          verificationRequestedAt: existing?.verificationRequestedAt,
          verifiedAt: new Date().toISOString(),
          verifiedBy: user.id,
          pathwardCreditApplied:
            Number(existing?.pathwardCreditApplied ?? 0) + creditResult.credited,
        };
      }

      downPayment.verifiedBy = user.id;
    } else if (existing?.status !== "verified" && requiredAmount > 0) {
      const closingMeta = parseClosingFundsMeta(personalInfo);
      const mortgageBaseline = Number(closingMeta?.mortgageCreditedToPathward ?? 0);
      const depositBalance = Math.max(0, currentPathwardBalance - mortgageBaseline);
      const creditNeeded = Math.max(0, requiredAmount - alreadyCredited);
      const externalDepositRecorded =
        creditNeeded > 0 &&
        depositBalance >= requiredAmount &&
        alreadyCredited === 0;

      if (creditNeeded > 0 && !externalDepositRecorded) {
        const creditResult = await creditPathwardAccountBalance(
          supabase,
          application.user_id,
          creditNeeded,
        );

        if (creditResult.error) {
          return { error: creditResult.error };
        }

        downPayment.pathwardCreditApplied = alreadyCredited + creditResult.credited;
      } else {
        downPayment.pathwardCreditApplied = Math.max(
          requiredAmount,
          alreadyCredited,
        );
      }

      downPayment.verifiedDownPaymentAmount = requiredAmount;
      downPayment.fundingPhase = "down_payment";
    } else if (requiredAmount > 0) {
      downPayment.pathwardCreditApplied = requiredAmount;
      downPayment.verifiedDownPaymentAmount = requiredAmount;
    }
  }

  const { error } = await supabase
    .from("loan_applications")
    .update({
      personal_info: {
        ...personalInfo,
        downPayment,
      },
    })
    .eq("id", input.applicationId);

  if (error) {
    return { error: error.message };
  }

  const note =
    input.decision === "approve"
      ? isAdminRequest
        ? `${existing?.activeRequest?.label ?? "Additional deposit"} of $${requiredAmount.toFixed(2)} verified and added to the pending escrow transfer.`
        : downPayment.pathwardCreditApplied &&
            downPayment.pathwardCreditApplied > alreadyCredited
          ? `Down payment verified. $${(downPayment.pathwardCreditApplied - alreadyCredited).toFixed(2)} added to Pathward closing funds.`
          : downPayment.pathwardCreditApplied
            ? "Down payment verified and included in Pathward closing funds."
            : `Down payment verified by ${institutionName}.`
      : input.decision === "reject"
        ? `Down payment rejected: ${input.reason ?? "Could not verify deposit."}`
        : `Additional proof requested: ${input.reason ?? "Please upload supporting documents."}`;

  await supabase.from("application_status_history").insert({
    application_id: input.applicationId,
    status: application.status,
    note,
    changed_by: user.id,
  });

  await createNotification({
    userId: application.user_id,
    title:
      input.decision === "approve"
        ? "Down Payment Verified"
        : input.decision === "reject"
          ? "Down Payment Verification Failed"
          : "Additional Proof Required",
    message:
      input.decision === "approve"
        ? `${note} Your verified down payment is now included in your Pathward closing balance toward the seller transfer.`
        : note,
    type: "application_update",
    metadata: { applicationId: input.applicationId, decision: input.decision },
  });

  if (input.decision === "approve") {
    void notifyAdmin({
      event: "DEPOSIT_APPROVED",
      payload: {
        amount: requiredAmount,
        applicationId: application.application_number ?? input.applicationId,
      },
      entityType: "application",
      entityId: input.applicationId,
      dashboardUrl: `/finance/applications/${input.applicationId}`,
    });
  } else if (input.decision === "reject") {
    void notifyAdmin({
      event: "DEPOSIT_REJECTED",
      severity: "high",
      payload: {
        applicationId: application.application_number ?? input.applicationId,
        message: input.reason,
      },
      entityType: "application",
      entityId: input.applicationId,
      dashboardUrl: `/finance/applications/${input.applicationId}`,
    });
  }

  const emailHooks = await import("@/lib/email/hooks");
  if (input.decision === "approve") {
    void emailHooks.sendDepositVerifiedEmail(
      application.user_id,
      requiredAmount,
      `/dashboard/loans/${input.applicationId}`,
    );
  } else if (input.decision === "reject") {
    void emailHooks.sendDepositRejectedEmail(
      application.user_id,
      input.reason,
      `/dashboard/loans/${input.applicationId}`,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/loans/${input.applicationId}`);
  revalidatePath(`/finance/applications/${input.applicationId}`);
  revalidatePath(`/admin/applications`);
  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");

  return {
    success:
      input.decision === "approve"
        ? "Down payment verified."
        : input.decision === "reject"
          ? "Down payment rejected."
          : "Additional proof requested.",
  };
}

export async function addFundingRequirementFeeAction(input: {
  applicationId: string;
  label: string;
  amount: number;
}): Promise<DownPaymentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["super_admin", "admin", "finance_officer"].includes(profile.role)) {
    return { error: "You do not have permission to request additional deposits." };
  }

  if (!input.label.trim() || input.amount <= 0) {
    return { error: "A label and positive amount are required." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("id, user_id, personal_info, status, application_number")
    .eq("id", input.applicationId)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found." };
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const escrowTransfer = parseEscrowTransferMeta(personalInfo);

  if (!["approved", "funded", "active"].includes(application.status)) {
    return {
      error: "Additional deposits can only be requested for approved applications.",
    };
  }

  const existing = parseDownPaymentMeta(personalInfo);
  if (existing?.activeRequest && existing.fundingPhase === "admin_requested") {
    return {
      error:
        "A deposit request is already active. The client must complete it before a new request can be issued.",
    };
  }

  const downPaymentComplete = isClosingDownPaymentComplete(existing);
  if (!downPaymentComplete && !isEscrowTransferPending(escrowTransfer)) {
    return {
      error:
        "Verify the client's down payment before requesting additional deposits.",
    };
  }

  const onboarding = personalInfo.onboarding as
    | { preQualification?: { estimatedDownPayment?: number } }
    | undefined;
  const fallbackDownPayment =
    onboarding?.preQualification?.estimatedDownPayment ?? 0;

  const downPayment = buildAdminRequestedDepositMeta({
    existing,
    fallbackDownPayment,
    label: input.label.trim(),
    amount: input.amount,
    addedBy: user.id,
  });

  const { error } = await supabase
    .from("loan_applications")
    .update({
      personal_info: {
        ...personalInfo,
        downPayment,
      },
    })
    .eq("id", input.applicationId);

  if (error) {
    return { error: error.message };
  }

  const note = `Additional deposit requested: ${input.label.trim()} ($${input.amount.toFixed(2)}). This is the only amount due from the client.`;

  await supabase.from("application_status_history").insert({
    application_id: input.applicationId,
    status: application.status,
    note,
    changed_by: user.id,
  });

  await createNotification({
    userId: application.user_id,
    title: `${input.label.trim()} Required`,
    message: `${note} Deposit this amount to your Funding Account. Your original down payment is not due again.`,
    type: "application_update",
    metadata: {
      applicationId: input.applicationId,
      feeLabel: input.label.trim(),
      feeAmount: input.amount,
    },
  });

  void notifyAdmin({
    event: "ADDITIONAL_FUNDS_REQUIRED",
    severity: "high",
    payload: {
      amount: input.amount,
      applicationId: application.application_number ?? input.applicationId,
      message: input.label.trim(),
    },
    entityType: "application",
    entityId: input.applicationId,
    dashboardUrl: `/finance/applications/${input.applicationId}`,
  });

  const { sendAdditionalFundingRequiredEmail } = await import("@/lib/email/hooks");
  void sendAdditionalFundingRequiredEmail(
    application.user_id,
    input.amount,
    input.label.trim(),
    `/dashboard/loans/${input.applicationId}`,
  );

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/loans/${input.applicationId}`);
  revalidatePath(`/finance/applications/${input.applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");

  return { success: note };
}

export async function removeFundingRequirementFeeAction(input: {
  applicationId: string;
  feeId: string;
}): Promise<DownPaymentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["super_admin", "admin", "finance_officer"].includes(profile.role)) {
    return { error: "You do not have permission to remove deposit requests." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("id, user_id, personal_info, status, application_number")
    .eq("id", input.applicationId)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found." };
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const existing = parseDownPaymentMeta(personalInfo);

  if (!existing?.activeRequest || existing.activeRequest.id !== input.feeId) {
    return { error: "Active deposit request not found." };
  }

  const onboarding = personalInfo.onboarding as
    | { preQualification?: { estimatedDownPayment?: number } }
    | undefined;
  const fallbackDownPayment =
    onboarding?.preQualification?.estimatedDownPayment ?? 0;

  const downPayment = buildEscrowPendingFundingMeta(existing, fallbackDownPayment);

  const { error } = await supabase
    .from("loan_applications")
    .update({
      personal_info: {
        ...personalInfo,
        downPayment,
      },
    })
    .eq("id", input.applicationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/finance/applications/${input.applicationId}`);

  return { success: "Deposit request removed." };
}
