export const EMAIL_DEPARTMENTS = [
  "system",
  "loan_officer",
  "underwriting",
  "funding",
  "closings",
  "support",
  "executive",
] as const;

export type EmailDepartment = (typeof EMAIL_DEPARTMENTS)[number];

export type EmailCommunicationClass = "automated" | "department" | "executive";

export type EmailDeliveryStatus = "pending" | "sent" | "failed" | "skipped";

export type EmailStatusTone = "neutral" | "approved" | "pending" | "rejected";

export type EmailTemplateKey =
  | "welcome"
  | "verify_email"
  | "verification_success"
  | "password_reset"
  | "magic_link"
  | "auth_verification_code"
  | "account_notification"
  | "security_alert"
  | "application_submitted"
  | "application_under_review"
  | "additional_documents_required"
  | "application_approved"
  | "application_rejected"
  | "application_on_hold"
  | "pre_qualified_notice"
  | "eligible_amount_updated"
  | "funding_account_created"
  | "funding_account_activated"
  | "deposit_submitted"
  | "deposit_verified"
  | "deposit_rejected"
  | "funding_balance_updated"
  | "escrow_transfer_requested"
  | "escrow_transfer_pending_approval"
  | "escrow_transfer_approved"
  | "additional_funding_required"
  | "funds_released_to_seller"
  | "mortgage_closed_successfully"
  | "custom_loan_officer"
  | "custom_chief_lending_officer"
  | "custom_funding_department"
  | "custom_closings_department";

export type EmailTemplateData = Record<string, string | number | undefined | null>;

export type SendEmailInput = {
  department: EmailDepartment;
  template: EmailTemplateKey;
  recipient: string;
  userId?: string;
  data?: EmailTemplateData;
  /** Override rendered subject (admin custom messages). */
  subject?: string;
  /** Override body message (admin custom messages). */
  customMessage?: string;
  sentBy?: string;
  metadata?: Record<string, unknown>;
};

export type SendEmailResult =
  | { ok: true; logId: string; resendId?: string }
  | { ok: false; logId: string; error: string };

export type EmailCommunicationLog = {
  id: string;
  userId: string | null;
  recipientEmail: string;
  senderEmail: string;
  senderDisplayName: string;
  department: EmailDepartment;
  templateKey: EmailTemplateKey;
  subject: string;
  status: EmailDeliveryStatus;
  resendId: string | null;
  errorMessage: string | null;
  sentBy: string | null;
  createdAt: string;
};
