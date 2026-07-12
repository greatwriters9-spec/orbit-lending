import {
  resolveTemplateCommunicationClass,
  resolveTemplateDepartment,
} from "@/lib/email/registry";
import type { EmailTemplateKey } from "@/lib/email/types";

export { resolveTemplateDepartment };

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  welcome: "Welcome",
  verify_email: "Verify Email",
  verification_success: "Verification Success",
  password_reset: "Password Reset",
  magic_link: "Magic Link Sign-In",
  auth_verification_code: "Verification Code",
  account_notification: "Account Notification",
  security_alert: "Security Alert",
  application_submitted: "Application Submitted",
  application_under_review: "Application Under Review",
  additional_documents_required: "Additional Documents Required",
  documents_received_for_review: "Documents Received For Review",
  application_approved: "Application Approved",
  application_rejected: "Application Rejected",
  application_on_hold: "Application On Hold",
  pre_qualified_notice: "Pre-Qualified Notice",
  eligible_amount_updated: "Eligible Amount Updated",
  funding_account_created: "Funding Account Linked",
  funding_account_activated: "Funding Account Activated",
  deposit_submitted: "Deposit Submitted",
  deposit_verified: "Deposit Verified",
  deposit_rejected: "Deposit Rejected",
  funding_balance_updated: "Funding Balance Updated",
  escrow_transfer_requested: "Escrow Transfer Requested",
  escrow_transfer_pending_approval: "Escrow Transfer Pending Approval",
  escrow_transfer_approved: "Escrow Transfer Approved",
  additional_funding_required: "Additional Funding Required",
  funds_released_to_seller: "Funds Released To Seller",
  mortgage_closed_successfully: "Mortgage Closed Successfully",
  custom_loan_officer: "Loan Officer Message",
  custom_chief_lending_officer: "Executive Message",
  custom_funding_department: "Funding Department Message",
  custom_closings_department: "Closing Department Message",
  custom_message: "Custom Message",
};

export const EMAIL_TEMPLATE_DEFAULT_SUBJECTS: Partial<Record<EmailTemplateKey, string>> = {
  custom_loan_officer: "Message from Your Loan Officer",
  custom_chief_lending_officer: "Important Update",
  custom_funding_department: "Update on Your Funding Account",
  custom_closings_department: "Update on Your Closing",
  custom_message: "",
};

export const EMAIL_TEMPLATE_DEFAULT_HEADLINES: Partial<Record<EmailTemplateKey, string>> = {
  custom_loan_officer: "Message from your loan officer",
  custom_chief_lending_officer: "An update on your mortgage",
  custom_funding_department: "An update on your funding account",
  custom_closings_department: "An update on your closing",
  custom_message: "",
};

export function getEmailTemplateLabel(templateKey: EmailTemplateKey): string {
  return EMAIL_TEMPLATE_LABELS[templateKey] ?? templateKey;
}

export const CLIENT_EMAIL_TEMPLATE_LABELS: Partial<Record<EmailTemplateKey, string>> = {
  welcome: "Welcome",
  verify_email: "Email verification",
  verification_success: "Email verified",
  password_reset: "Password reset",
  magic_link: "Secure sign-in link",
  auth_verification_code: "Verification code",
  account_notification: "Account update",
  security_alert: "Security notice",
  application_submitted: "Application received",
  application_under_review: "Application update",
  additional_documents_required: "Documents needed",
  documents_received_for_review: "Documents under review",
  application_approved: "Application approved",
  application_rejected: "Application update",
  application_on_hold: "Application update",
  pre_qualified_notice: "Pre-qualification update",
  eligible_amount_updated: "Mortgage amount update",
  funding_account_created: "Funding account",
  funding_account_activated: "Funding account ready",
  deposit_submitted: "Deposit received",
  deposit_verified: "Deposit verified",
  deposit_rejected: "Deposit update",
  funding_balance_updated: "Balance update",
  escrow_transfer_requested: "Closing transfer",
  escrow_transfer_pending_approval: "Closing transfer in review",
  escrow_transfer_approved: "Closing transfer approved",
  additional_funding_required: "Additional funds needed",
  funds_released_to_seller: "Closing complete",
  mortgage_closed_successfully: "Mortgage closed",
  custom_loan_officer: "Message from your loan team",
  custom_chief_lending_officer: "Important update",
  custom_funding_department: "Funding update",
  custom_closings_department: "Closing update",
  custom_message: "Custom message",
};

export function getClientEmailTemplateLabel(templateKey: EmailTemplateKey): string {
  return (
    CLIENT_EMAIL_TEMPLATE_LABELS[templateKey] ??
    getEmailTemplateLabel(templateKey)
  );
}

export const ADMIN_CUSTOM_TEMPLATES: EmailTemplateKey[] = [
  "custom_message",
  "custom_loan_officer",
  "custom_chief_lending_officer",
  "custom_funding_department",
  "custom_closings_department",
];

export const ADMIN_SENDABLE_TEMPLATES = [
  "custom_message",
  ...Object.keys(EMAIL_TEMPLATE_LABELS).filter(
    (key) => key !== "custom_message",
  ),
] as EmailTemplateKey[];

export const COMMUNICATION_CLASS_LABELS = {
  automated: "Automated System",
  department: "Department Communication",
  executive: "Executive Communication",
} as const;

export function getTemplateCommunicationClassLabel(template: EmailTemplateKey) {
  return COMMUNICATION_CLASS_LABELS[resolveTemplateCommunicationClass(template)];
}
