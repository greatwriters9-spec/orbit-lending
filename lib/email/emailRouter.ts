import type { CompanyEmailBranding } from "@/lib/email/company-branding";
import { getDepartmentSenderIdentity } from "@/lib/email/company-branding";
import { EMAIL_DEPARTMENTS } from "@/lib/email/types";
import type { EmailDepartment, EmailTemplateKey } from "@/lib/email/types";

export type EmailSenderIdentity = {
  fromName: string;
  fromEmail: string;
  replyTo: string;
  department: EmailDepartment;
  /** Resend-compatible `From` header value. */
  from: string;
};

type RoutedDepartment = EmailDepartment;

/** Canonical event → department routing for outbound email identities. */
const EVENT_ROUTING: Record<string, RoutedDepartment> = {
  // Authentication
  signup: "system",
  invite: "system",
  registration: "system",
  verify_email: "system",
  verification_success: "system",
  email_verification: "system",
  password_reset: "system",
  recovery: "system",
  magiclink: "system",
  magic_link: "system",
  email: "system",
  email_change: "system",
  reauthentication: "system",
  auth_verification_code: "system",

  // Loan officer
  welcome: "loan_officer",
  pre_qualified: "loan_officer",
  pre_qualified_notice: "loan_officer",
  application_submitted: "loan_officer",
  application_approved: "loan_officer",
  application_rejected: "loan_officer",
  application_declined: "loan_officer",
  application_under_review: "loan_officer",
  mortgage_offer: "loan_officer",
  offer_sent: "loan_officer",
  offer_accepted: "loan_officer",
  custom_loan_officer: "loan_officer",

  // Underwriting
  additional_documents_required: "underwriting",
  documents_received_for_review: "underwriting",
  information_required: "underwriting",
  income_verification: "underwriting",
  verification_complete: "underwriting",
  additional_information: "underwriting",

  // Funding
  funding_account_created: "funding",
  funding_account_activated: "funding",
  deposit_submitted: "funding",
  deposit_verified: "funding",
  deposit_received: "funding",
  deposit_rejected: "funding",
  funding_balance_updated: "funding",
  funding_updated: "funding",
  additional_funding_required: "funding",
  loan_disbursed: "funding",
  custom_funding_department: "funding",

  // Closing
  escrow_transfer_requested: "closings",
  escrow_transfer_pending: "closings",
  escrow_transfer_pending_approval: "closings",
  escrow_transfer_approved: "closings",
  escrow_transfer_cancelled: "closings",
  funds_released: "closings",
  funds_released_to_seller: "closings",
  mortgage_closed: "closings",
  mortgage_closed_successfully: "closings",
  closing_instructions: "closings",
  closing_scheduled: "closings",
  closing_complete: "closings",
  custom_closings_department: "closings",

  // Compliance
  security_alert: "compliance",
  compliance_notice: "compliance",
  identity_verification: "compliance",
  IDENTITY_VERIFICATION_SUBMITTED: "compliance",
  IDENTITY_VERIFICATION_FAILED: "compliance",

  // Support
  account_notification: "support",
  password_changed_notification: "support",
  email_changed_notification: "support",
  phone_changed_notification: "support",
  identity_linked_notification: "support",
  identity_unlinked_notification: "support",
  mfa_factor_enrolled_notification: "support",
  mfa_factor_unenrolled_notification: "support",
  custom_message: "support",
  NEW_SUPPORT_MESSAGE: "support",
  CLIENT_REPLY: "support",
  NEW_CONVERSATION: "support",
  LOAN_OFFICER_MESSAGE: "support",
  CONTACT_FORM_SUBMITTED: "support",
  GUEST_MORTGAGE_INQUIRY: "support",
  CALLBACK_REQUEST: "support",
  GENERAL_INQUIRY: "support",

  // Chief lending officer
  application_on_hold: "executive",
  eligible_amount_updated: "executive",
  custom_chief_lending_officer: "executive",
  executive_approval: "executive",
  special_approval: "executive",
  escalated_loan: "executive",
  ROLE_CHANGED: "executive",
  MULTIPLE_FAILED_LOGINS: "executive",
  ACCOUNT_LOCKED: "executive",
  SUSPICIOUS_ACTIVITY: "executive",
  ADMIN_LOGIN: "executive",

  // Admin notification routing
  NEW_USER_REGISTRATION: "system",
  EMAIL_VERIFIED: "system",
  PROFILE_COMPLETED: "loan_officer",
  NEW_MORTGAGE_APPLICATION: "loan_officer",
  APPLICATION_UPDATED: "loan_officer",
  APPLICATION_READY_FOR_REVIEW: "underwriting",
  DOCUMENT_UPLOADED: "underwriting",
  APPLICATION_APPROVED: "loan_officer",
  APPLICATION_REJECTED: "loan_officer",
  DOWN_PAYMENT_SUBMITTED: "funding",
  DEPOSIT_RECEIVED: "funding",
  DEPOSIT_VERIFICATION_REQUIRED: "funding",
  DEPOSIT_APPROVED: "funding",
  DEPOSIT_REJECTED: "funding",
  ADDITIONAL_FUNDS_REQUIRED: "funding",
  FUNDING_GOAL_REACHED: "funding",
  ESCROW_TRANSFER_REQUESTED: "closings",
  ESCROW_TRANSFER_CANCELLED: "closings",
  ESCROW_TRANSFER_APPROVED: "closings",
  ESCROW_TRANSFER_COMPLETED: "closings",
  CLOSING_COMPLETED: "closings",
  FUNDING_DEPARTMENT_MESSAGE: "funding",
  CLOSING_DEPARTMENT_MESSAGE: "closings",
};

const EMAIL_TEMPLATE_KEYS = new Set<string>([
  "welcome",
  "verify_email",
  "verification_success",
  "password_reset",
  "magic_link",
  "auth_verification_code",
  "account_notification",
  "security_alert",
  "application_submitted",
  "application_under_review",
  "additional_documents_required",
  "documents_received_for_review",
  "application_approved",
  "application_rejected",
  "application_on_hold",
  "pre_qualified_notice",
  "eligible_amount_updated",
  "funding_account_created",
  "funding_account_activated",
  "deposit_submitted",
  "deposit_verified",
  "deposit_rejected",
  "funding_balance_updated",
  "escrow_transfer_requested",
  "escrow_transfer_pending_approval",
  "escrow_transfer_approved",
  "additional_funding_required",
  "funds_released_to_seller",
  "mortgage_closed_successfully",
  "custom_loan_officer",
  "custom_chief_lending_officer",
  "custom_funding_department",
  "custom_closings_department",
  "custom_message",
]);

const EMAIL_DEPARTMENT_SET = new Set<string>(EMAIL_DEPARTMENTS);

function isEmailDepartment(value: string): value is EmailDepartment {
  return EMAIL_DEPARTMENT_SET.has(value);
}

function resolveEventDepartment(event: string): RoutedDepartment {
  const trimmed = event.trim();
  if (!trimmed) {
    return "support";
  }

  if (trimmed.startsWith("department:")) {
    const department = trimmed.slice("department:".length);
    if (isEmailDepartment(department)) {
      return department;
    }
  }

  const direct =
    EVENT_ROUTING[trimmed] ??
    EVENT_ROUTING[trimmed.toLowerCase()] ??
    EVENT_ROUTING[trimmed.toUpperCase()];

  if (direct) {
    return direct;
  }

  if (EMAIL_TEMPLATE_KEYS.has(trimmed)) {
    return EVENT_ROUTING[trimmed] ?? "support";
  }

  return "support";
}

export function getEmailSenderByDepartment(
  department: EmailDepartment,
  companyBranding: CompanyEmailBranding,
): EmailSenderIdentity {
  return getDepartmentSenderIdentity(companyBranding, department);
}

/**
 * Resolve the outbound sender identity for a communication event.
 * Accepts template keys, auth action types, admin notification events,
 * or `department:{name}` selectors from the Communication Center.
 */
export function getEmailSender(
  event: string,
  companyBranding: CompanyEmailBranding,
): EmailSenderIdentity {
  const department = resolveEventDepartment(event);
  return getEmailSenderByDepartment(department, companyBranding);
}

export function resolveOutgoingEmailEvent(input: {
  template: EmailTemplateKey;
  department?: EmailDepartment;
  metadata?: Record<string, unknown>;
}): string {
  const metadata = input.metadata ?? {};

  if (typeof metadata.event === "string" && metadata.event.trim()) {
    return metadata.event.trim();
  }

  if (
    typeof metadata.adminNotificationEvent === "string" &&
    metadata.adminNotificationEvent.trim()
  ) {
    return metadata.adminNotificationEvent.trim();
  }

  if (
    typeof metadata.emailActionType === "string" &&
    metadata.emailActionType.trim()
  ) {
    return metadata.emailActionType.trim();
  }

  if (input.department) {
    return `department:${input.department}`;
  }

  return input.template;
}
