import { resolveUserEmail } from "@/lib/notifications/resolve-user-email";

import { sendEmail } from "@/lib/email/service";
import { resolveTemplateDepartment } from "@/lib/email/templates/catalog";
import type { EmailTemplateData, EmailTemplateKey } from "@/lib/email/types";

type TimelineEmailInput = {
  userId: string;
  template: EmailTemplateKey;
  data?: EmailTemplateData;
  email?: string;
  metadata?: Record<string, unknown>;
  subject?: string;
  customMessage?: string;
};

export async function sendTimelineEmail(input: TimelineEmailInput) {
  const recipient =
    input.email ?? (await resolveUserEmail(input.userId));

  if (!recipient) {
    console.warn(
      `[sendTimelineEmail] No email for user ${input.userId} (${input.template})`,
    );
    return { ok: false as const, error: "Recipient email not found." };
  }

  return sendEmail({
    department: resolveTemplateDepartment(input.template),
    template: input.template,
    recipient,
    userId: input.userId,
    data: input.data,
    subject: input.subject,
    customMessage: input.customMessage,
    metadata: input.metadata,
  });
}

export async function sendWelcomeEmail(userId: string, firstName?: string) {
  return sendTimelineEmail({
    userId,
    template: "welcome",
    data: { firstName },
  });
}

export async function sendVerifyEmailEmail(input: {
  userId: string;
  recipient: string;
  verifyUrl: string;
  firstName?: string;
}) {
  return sendTimelineEmail({
    userId: input.userId,
    email: input.recipient,
    template: "verify_email",
    data: {
      verifyUrl: input.verifyUrl,
      firstName: input.firstName,
    },
    metadata: { source: "auth_signup" },
  });
}

export async function sendVerificationSuccessEmail(
  userId: string,
  firstName?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "verification_success",
    data: { firstName },
  });
}

export async function sendPasswordResetNoticeEmail(
  userId: string,
  resetUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "password_reset",
    data: { resetUrl },
  });
}

export async function sendSecurityAlertEmail(
  userId: string,
  message: string,
) {
  return sendTimelineEmail({
    userId,
    template: "security_alert",
    data: { message },
  });
}

export async function sendDocumentsReceivedForReviewEmail(
  userId: string,
  data: EmailTemplateData,
) {
  return sendTimelineEmail({
    userId,
    template: "documents_received_for_review",
    data,
  });
}

export async function sendPreQualifiedNoticeEmail(
  userId: string,
  data: EmailTemplateData,
) {
  return sendTimelineEmail({
    userId,
    template: "pre_qualified_notice",
    data,
  });
}

export async function sendFundingAccountCreatedEmail(
  userId: string,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "funding_account_created",
    data: { actionUrl },
  });
}

export async function sendDepositSubmittedEmail(
  userId: string,
  amount: number,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "deposit_submitted",
    data: { amount, actionUrl },
  });
}

export async function sendDepositVerifiedEmail(
  userId: string,
  amount: number,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "deposit_verified",
    data: { amount, actionUrl },
  });
}

export async function sendDepositRejectedEmail(
  userId: string,
  message?: string,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "deposit_rejected",
    data: { message, actionUrl },
  });
}

export async function sendAdditionalFundingRequiredEmail(
  userId: string,
  amount: number,
  label: string,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "additional_funding_required",
    data: { amount, label, actionUrl },
  });
}

export async function sendEscrowTransferRequestedEmail(
  userId: string,
  amount: number,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "escrow_transfer_requested",
    data: { amount, actionUrl },
  });
}

export async function sendEscrowTransferPendingApprovalEmail(
  userId: string,
  amount: number,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "escrow_transfer_pending_approval",
    data: { amount, actionUrl },
  });
}

export async function sendEscrowTransferApprovedEmail(
  userId: string,
  amount: number,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "escrow_transfer_approved",
    data: { amount, actionUrl },
  });
}

export async function sendFundsReleasedEmail(
  userId: string,
  amount: number,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "funds_released_to_seller",
    data: { amount, actionUrl },
  });
}

export async function sendMortgageClosedEmail(
  userId: string,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "mortgage_closed_successfully",
    data: { actionUrl },
  });
}

export async function sendFundingBalanceUpdatedEmail(
  userId: string,
  balance: number,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "funding_balance_updated",
    data: { balance, actionUrl },
  });
}

export async function sendEligibleAmountUpdatedEmail(
  userId: string,
  approvedAmount: number,
  previousAmount?: number,
  actionUrl?: string,
) {
  return sendTimelineEmail({
    userId,
    template: "eligible_amount_updated",
    data: { approvedAmount, previousAmount, actionUrl },
  });
}

export const APPLICATION_STATUS_EMAIL_TEMPLATES: Partial<
  Record<string, EmailTemplateKey>
> = {
  submitted: "application_submitted",
  under_review: "application_under_review",
  information_required: "additional_documents_required",
  approved: "application_approved",
  rejected: "application_rejected",
  offer_declined: "application_rejected",
  pending_finance_approval: "application_on_hold",
  funded: "funding_balance_updated",
  active: "mortgage_closed_successfully",
  completed: "mortgage_closed_successfully",
};
