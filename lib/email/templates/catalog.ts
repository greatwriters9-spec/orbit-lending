import type {
  EmailDepartment,
  EmailTemplateData,
  EmailTemplateKey,
} from "@/lib/email/types";
import { getAppOrigin } from "@/lib/email/config";
import {
  renderMasterEmail,
  type MasterEmailContent,
} from "@/lib/email/templates/master";

export type ResolvedEmailTemplate = {
  subject: string;
  department: EmailDepartment;
  content: MasterEmailContent;
};

function str(data: EmailTemplateData | undefined, key: string, fallback = ""): string {
  const value = data?.[key];
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function currency(data: EmailTemplateData | undefined, key: string): string {
  const raw = data?.[key];
  if (raw === undefined || raw === null || raw === "") return "";
  const amount = Number(raw);
  if (Number.isNaN(amount)) return String(raw);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const TEMPLATE_DEPARTMENTS: Record<EmailTemplateKey, EmailDepartment> = {
  welcome: "system",
  verify_email: "system",
  verification_success: "system",
  password_reset: "support",
  security_alert: "system",
  application_submitted: "lending",
  application_under_review: "loan_officer",
  additional_documents_required: "loan_officer",
  application_approved: "lending",
  application_rejected: "lending",
  application_on_hold: "lending",
  pre_qualified_notice: "lending",
  eligible_amount_updated: "lending",
  funding_account_created: "funding",
  funding_account_activated: "funding",
  deposit_submitted: "funding",
  deposit_verified: "funding",
  deposit_rejected: "funding",
  funding_balance_updated: "funding",
  escrow_transfer_requested: "closings",
  escrow_transfer_pending_approval: "closings",
  escrow_transfer_approved: "closings",
  additional_funding_required: "funding",
  funds_released_to_seller: "closings",
  mortgage_closed_successfully: "closings",
  custom_loan_officer: "loan_officer",
  custom_chief_lending_officer: "lending",
  custom_funding_department: "funding",
  custom_closings_department: "closings",
};

const DEPARTMENT_LABELS: Record<EmailDepartment, string> = {
  system: "Orbit Mortgage System",
  loan_officer: "Orbit Mortgage Loan Officer",
  lending: "Chief Lending Officer - Orbit Mortgage",
  funding: "Orbit Mortgage Funding Department",
  closings: "Orbit Mortgage Closings Department",
  support: "Orbit Mortgage Support",
};

export function resolveTemplateDepartment(template: EmailTemplateKey): EmailDepartment {
  return TEMPLATE_DEPARTMENTS[template];
}

export function resolveEmailTemplate(
  template: EmailTemplateKey,
  data: EmailTemplateData = {},
  overrides?: { subject?: string; customMessage?: string },
): ResolvedEmailTemplate {
  const department = TEMPLATE_DEPARTMENTS[template];
  const firstName = str(data, "firstName", "there");
  const origin = getAppOrigin();
  const dashboardUrl = `${origin}/dashboard`;
  const loginUrl = `${origin}/login`;

  const builders: Record<
    EmailTemplateKey,
    () => { subject: string; content: MasterEmailContent }
  > = {
    welcome: () => ({
      subject: "Welcome to Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.system,
        headline: `Welcome, ${firstName}`,
        body: "Thank you for choosing Orbit Mortgage. Your secure client portal is ready. Complete your profile, explore your pre-qualification, and track every step of your home purchase with institutional-grade transparency.",
        ctaLabel: "Open Your Dashboard",
        ctaUrl: dashboardUrl,
      },
    }),
    verify_email: () => ({
      subject: "Verify Your Orbit Mortgage Email Address",
      content: {
        departmentLabel: DEPARTMENT_LABELS.system,
        headline: "Confirm your email address",
        body: "Please verify your email address to activate secure access to your Orbit Mortgage account.",
        tone: "pending",
        badge: "Action Required",
        ctaLabel: "Verify Email Address",
        ctaUrl: str(data, "verifyUrl", loginUrl),
      },
    }),
    verification_success: () => ({
      subject: "Email Verified — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.system,
        headline: "Your email is verified",
        body: "Your Orbit Mortgage account email has been confirmed. You can now receive application updates, funding notices, and closing communications.",
        tone: "approved",
        badge: "Verified",
        ctaLabel: "Continue to Dashboard",
        ctaUrl: dashboardUrl,
      },
    }),
    password_reset: () => ({
      subject: "Orbit Mortgage Password Reset Request",
      content: {
        departmentLabel: DEPARTMENT_LABELS.support,
        headline: "Password reset requested",
        body: "We received a request to reset your Orbit Mortgage portal password. If you did not make this request, contact our support team immediately.",
        tone: "pending",
        badge: "Security Notice",
        ctaLabel: "Reset Password",
        ctaUrl: str(data, "resetUrl", loginUrl),
      },
    }),
    security_alert: () => ({
      subject: "Orbit Mortgage Security Alert",
      content: {
        departmentLabel: DEPARTMENT_LABELS.system,
        headline: "New sign-in detected",
        body: str(
          data,
          "message",
          "Your Orbit Mortgage account was accessed. If this was not you, contact support immediately.",
        ),
        tone: "rejected",
        badge: "Security Alert",
        ctaLabel: "Review Account",
        ctaUrl: `${origin}/dashboard/profile`,
      },
    }),
    application_submitted: () => ({
      subject: "Mortgage Application Received — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.lending,
        headline: "Application received",
        body: "Your mortgage application has been submitted to Orbit Mortgage. Our lending team will review your file and contact you if additional information is required.",
        tone: "pending",
        badge: "Submitted",
        detailRows: [
          { label: "Application", value: str(data, "applicationNumber", "—") },
          { label: "Requested Amount", value: currency(data, "requestedAmount") || "—" },
        ],
        ctaLabel: "View Application",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    application_under_review: () => ({
      subject: "Your Mortgage Application Is Under Review",
      content: {
        departmentLabel: DEPARTMENT_LABELS.loan_officer,
        headline: "Underwriting review in progress",
        body: "Your assigned loan officer and underwriting team are reviewing your mortgage application.",
        tone: "pending",
        badge: "Under Review",
        ctaLabel: "View Application Status",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    additional_documents_required: () => ({
      subject: "Additional Documents Required — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.loan_officer,
        headline: "We need additional information",
        body: str(
          data,
          "message",
          "Please upload the requested documents to continue your mortgage review.",
        ),
        tone: "pending",
        badge: "Action Required",
        ctaLabel: "Upload Documents",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    application_approved: () => ({
      subject: "Congratulations — Mortgage Approved",
      content: {
        departmentLabel: DEPARTMENT_LABELS.lending,
        headline: "Your mortgage is approved",
        body: "Congratulations. Your mortgage application has been approved by Orbit Mortgage.",
        tone: "approved",
        badge: "Approved",
        detailRows: [
          { label: "Approved Amount", value: currency(data, "approvedAmount") || "—" },
        ],
        ctaLabel: "View Funding Dashboard",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    application_rejected: () => ({
      subject: "Mortgage Application Update — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.lending,
        headline: "Application decision",
        body: str(
          data,
          "message",
          "Your mortgage application was not approved at this time.",
        ),
        tone: "rejected",
        badge: "Not Approved",
        ctaLabel: "Contact Support",
        ctaUrl: `${origin}/dashboard/support`,
      },
    }),
    application_on_hold: () => ({
      subject: "Mortgage Application On Hold — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.lending,
        headline: "Application placed on hold",
        body: str(
          data,
          "message",
          "Your mortgage application is temporarily on hold while we complete an internal review.",
        ),
        tone: "pending",
        badge: "On Hold",
        ctaLabel: "View Application",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    pre_qualified_notice: () => ({
      subject: "Pre-Qualification Results — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.lending,
        headline: "You are pre-qualified",
        body: "Based on your information, Orbit Mortgage has calculated your preliminary buying power.",
        tone: "approved",
        badge: "Pre-Qualified",
        detailRows: [
          { label: "Estimated Mortgage", value: currency(data, "mortgageAmount") || "—" },
          { label: "Maximum Home Price", value: currency(data, "maxHomePrice") || "—" },
        ],
        ctaLabel: "View Pre-Qualification",
        ctaUrl: str(data, "actionUrl", `${origin}/dashboard/qualification-result`),
      },
    }),
    eligible_amount_updated: () => ({
      subject: "Approved Mortgage Amount Updated",
      content: {
        departmentLabel: DEPARTMENT_LABELS.lending,
        headline: "Your eligible amount has changed",
        body: "The Chief Lending Officer has updated your approved mortgage amount.",
        detailRows: [
          { label: "Previous Amount", value: currency(data, "previousAmount") || "—" },
          { label: "Updated Amount", value: currency(data, "approvedAmount") || "—" },
        ],
        ctaLabel: "Review Dashboard",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    funding_account_created: () => ({
      subject: "Funding Account Ready — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.funding,
        headline: "Your funding account is ready",
        body: "Orbit Mortgage has established your Pathward funding account.",
        tone: "approved",
        badge: "Funding Account",
        ctaLabel: "View Funding Account",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    funding_account_activated: () => ({
      subject: "Funding Account Activated — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.funding,
        headline: "Funding account activated",
        body: "Your Orbit Mortgage funding account is now active.",
        tone: "approved",
        ctaLabel: "Open Funding Dashboard",
        ctaUrl: str(data, "actionUrl", `${origin}/wallet`),
      },
    }),
    deposit_submitted: () => ({
      subject: "Deposit Received — Pending Verification",
      content: {
        departmentLabel: DEPARTMENT_LABELS.funding,
        headline: "Deposit submitted for verification",
        body: "We received your deposit submission. The Funding Department will verify your wire shortly.",
        tone: "pending",
        badge: "Pending Verification",
        detailRows: [{ label: "Amount", value: currency(data, "amount") || "—" }],
        ctaLabel: "View Funding Status",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    deposit_verified: () => ({
      subject: "Deposit Verified — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.funding,
        headline: "Your deposit has been verified",
        body: "The Funding Department has verified your deposit.",
        tone: "approved",
        badge: "Verified",
        detailRows: [{ label: "Verified Amount", value: currency(data, "amount") || "—" }],
        ctaLabel: "View Closing Funds",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    deposit_rejected: () => ({
      subject: "Deposit Verification Update — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.funding,
        headline: "Deposit could not be verified",
        body: str(
          data,
          "message",
          "We were unable to verify your recent deposit.",
        ),
        tone: "rejected",
        badge: "Action Required",
        ctaLabel: "View Funding Account",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    funding_balance_updated: () => ({
      subject: "Funding Account Balance Updated",
      content: {
        departmentLabel: DEPARTMENT_LABELS.funding,
        headline: "Your funding balance changed",
        body: "Your Orbit Mortgage funding account balance has been updated.",
        detailRows: [{ label: "Current Balance", value: currency(data, "balance") || "—" }],
        ctaLabel: "View Account",
        ctaUrl: str(data, "actionUrl", `${origin}/wallet`),
      },
    }),
    escrow_transfer_requested: () => ({
      subject: "Escrow Transfer Request Received",
      content: {
        departmentLabel: DEPARTMENT_LABELS.closings,
        headline: "Escrow transfer request received",
        body: "We received your request to transfer closing funds to the seller via escrow.",
        tone: "pending",
        badge: "Request Received",
        detailRows: [{ label: "Transfer Amount", value: currency(data, "amount") || "—" }],
        ctaLabel: "Track Transfer",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    escrow_transfer_pending_approval: () => ({
      subject: "Escrow Transfer Pending Orbit Approval",
      content: {
        departmentLabel: DEPARTMENT_LABELS.closings,
        headline: "Pending Orbit Mortgage approval",
        body: "Your escrow transfer request is pending internal approval from the Closings Department.",
        tone: "pending",
        badge: "Pending Approval",
        ctaLabel: "View Status",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    escrow_transfer_approved: () => ({
      subject: "Escrow Transfer Approved — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.closings,
        headline: "Escrow transfer approved",
        body: "Your escrow transfer has been approved by Orbit Mortgage.",
        tone: "approved",
        badge: "Approved",
        detailRows: [{ label: "Transfer Amount", value: currency(data, "amount") || "—" }],
        ctaLabel: "View Closing Details",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    additional_funding_required: () => ({
      subject: "Additional Funding Required — Orbit Mortgage",
      content: {
        departmentLabel: DEPARTMENT_LABELS.funding,
        headline: "Additional deposit required",
        body: str(
          data,
          "message",
          "The Funding Department requires an additional deposit before closing can proceed.",
        ),
        tone: "pending",
        badge: "Additional Funding",
        detailRows: [
          { label: "Required Amount", value: currency(data, "amount") || "—" },
          { label: "Purpose", value: str(data, "label", "Closing Requirement") },
        ],
        ctaLabel: "Make Payment",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    funds_released_to_seller: () => ({
      subject: "Closing Funds Released to Seller",
      content: {
        departmentLabel: DEPARTMENT_LABELS.closings,
        headline: "Funds released to seller",
        body: "Orbit Mortgage has released your closing funds to the seller via escrow.",
        tone: "approved",
        badge: "Funds Released",
        detailRows: [{ label: "Amount Released", value: currency(data, "amount") || "—" }],
        ctaLabel: "View Closing Summary",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    mortgage_closed_successfully: () => ({
      subject: "Congratulations — Mortgage Closed Successfully",
      content: {
        departmentLabel: DEPARTMENT_LABELS.closings,
        headline: "Your mortgage has closed",
        body: "Congratulations on completing your home purchase with Orbit Mortgage.",
        tone: "approved",
        badge: "Closed",
        ctaLabel: "View Your Mortgage",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    custom_loan_officer: () => ({
      subject: str(data, "subject", "Message from Your Loan Officer"),
      content: {
        departmentLabel: DEPARTMENT_LABELS.loan_officer,
        headline: str(data, "headline", "Message from your loan officer"),
        body: overrides?.customMessage ?? str(data, "message", ""),
      },
    }),
    custom_chief_lending_officer: () => ({
      subject: str(data, "subject", "Message from Chief Lending Officer"),
      content: {
        departmentLabel: DEPARTMENT_LABELS.lending,
        headline: str(data, "headline", "Message from the Chief Lending Officer"),
        body: overrides?.customMessage ?? str(data, "message", ""),
      },
    }),
    custom_funding_department: () => ({
      subject: str(data, "subject", "Message from Funding Department"),
      content: {
        departmentLabel: DEPARTMENT_LABELS.funding,
        headline: str(data, "headline", "Message from the Funding Department"),
        body: overrides?.customMessage ?? str(data, "message", ""),
      },
    }),
    custom_closings_department: () => ({
      subject: str(data, "subject", "Message from Closings Department"),
      content: {
        departmentLabel: DEPARTMENT_LABELS.closings,
        headline: str(data, "headline", "Message from the Closings Department"),
        body: overrides?.customMessage ?? str(data, "message", ""),
      },
    }),
  };

  const built = builders[template]();
  return {
    subject: overrides?.subject ?? built.subject,
    department,
    content: overrides?.customMessage
      ? { ...built.content, body: overrides.customMessage }
      : built.content,
  };
}

export function renderEmailFromTemplate(
  template: EmailTemplateKey,
  data?: EmailTemplateData,
  overrides?: { subject?: string; customMessage?: string },
) {
  const resolved = resolveEmailTemplate(template, data, overrides);
  const rendered = renderMasterEmail(resolved.content);
  return {
    ...resolved,
    ...rendered,
  };
}

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  welcome: "Welcome",
  verify_email: "Verify Email",
  verification_success: "Verification Success",
  password_reset: "Password Reset",
  security_alert: "Security Alert",
  application_submitted: "Application Submitted",
  application_under_review: "Application Under Review",
  additional_documents_required: "Additional Documents Required",
  application_approved: "Application Approved",
  application_rejected: "Application Rejected",
  application_on_hold: "Application On Hold",
  pre_qualified_notice: "Pre-Qualified Notice",
  eligible_amount_updated: "Eligible Amount Updated",
  funding_account_created: "Funding Account Created",
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
  custom_loan_officer: "Custom — Loan Officer",
  custom_chief_lending_officer: "Custom — Chief Lending Officer",
  custom_funding_department: "Custom — Funding Department",
  custom_closings_department: "Custom — Closings Department",
};

export const ADMIN_CUSTOM_TEMPLATES: EmailTemplateKey[] = [
  "custom_loan_officer",
  "custom_chief_lending_officer",
  "custom_funding_department",
  "custom_closings_department",
];

export const ADMIN_SENDABLE_TEMPLATES = Object.keys(
  EMAIL_TEMPLATE_LABELS,
) as EmailTemplateKey[];
