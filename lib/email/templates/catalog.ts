import type { EmailTemplateContent, EmailBrandingContext } from "@/lib/email/react/types";
import { formatBrandingAddress } from "@/lib/admin/branding/config";
import {
  type CompanyEmailBranding,
  getDepartmentContactEmailForBranding,
  resolveCompanyEmailBranding,
} from "@/lib/email/company-branding";
import { DEFAULT_BRANDING_CONFIG } from "@/types/branding-config";
import { renderReactEmailTemplate } from "@/lib/email/react/render";
import {
  DEFAULT_STAFF_BY_DEPARTMENT,
  DEPARTMENT_DISPLAY_NAMES,
  resolveTemplateCommunicationClass,
  resolveTemplateDepartment,
  TEMPLATE_DEPARTMENTS,
} from "@/lib/email/registry";
import type {
  EmailDepartment,
  EmailTemplateData,
  EmailTemplateKey,
} from "@/lib/email/types";

export type ResolvedEmailTemplate = {
  subject: string;
  department: EmailDepartment;
  content: EmailTemplateContent;
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

function formatEmailDate(value?: string): string {
  if (value) return value;
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function brandingToEmailContext(
  companyBranding: CompanyEmailBranding,
): EmailBrandingContext {
  const config = companyBranding.branding;
  return {
    institutionName: config.institutionName,
    tagline: config.tagline,
    supportEmail: companyBranding.supportEmail,
    supportPhone: config.supportPhone,
    officeHours: config.officeHours,
    addressLine: formatBrandingAddress(config),
    websiteDomain: config.websiteDomain,
    websiteUrl: companyBranding.websiteUrl,
    bankPartnerName: config.bankPartnerName,
    logoUrl: companyBranding.logo,
    primaryColor: companyBranding.primaryColor,
    secondaryColor: companyBranding.secondaryColor,
    noReplyEmail: companyBranding.noReplyEmail,
    footerText: companyBranding.footerText,
    socialLinks: companyBranding.socialLinks,
  };
}

function departmentDisplayName(
  department: EmailDepartment,
  companyBranding?: CompanyEmailBranding,
): string {
  if (department === "system") {
    return companyBranding?.name ?? DEPARTMENT_DISPLAY_NAMES.system;
  }
  const defaults = companyBranding?.branding.departmentDefaults[
    department as keyof typeof companyBranding.branding.departmentDefaults
  ];
  if (defaults?.staffName) {
    return defaults.staffName;
  }
  return DEPARTMENT_DISPLAY_NAMES[department];
}

function baseMeta(
  department: EmailDepartment,
  data: EmailTemplateData,
  companyBranding?: CompanyEmailBranding,
) {
  const contactEmail = companyBranding
    ? getDepartmentContactEmailForBranding(companyBranding, department)
    : "";

  return {
    departmentName: departmentDisplayName(department, companyBranding),
    referenceNumber: str(data, "applicationNumber", str(data, "referenceNumber")),
    dateLabel: formatEmailDate(str(data, "dateLabel")),
    contactDepartment: departmentDisplayName(department, companyBranding),
    contactEmail,
  };
}

function staffForDepartment(
  department: EmailDepartment,
  data: EmailTemplateData,
  companyBranding?: CompanyEmailBranding,
) {
  const brandingDefaults = companyBranding?.branding.departmentDefaults[
    department as keyof typeof companyBranding.branding.departmentDefaults
  ];
  const registryDefaults = DEFAULT_STAFF_BY_DEPARTMENT[department];
  const contactEmail = companyBranding
    ? getDepartmentContactEmailForBranding(companyBranding, department)
    : brandingDefaults?.contactEmail ?? "";

  return {
    name: str(
      data,
      "staffName",
      brandingDefaults?.staffName ?? registryDefaults?.name ?? `${companyBranding?.name ?? DEFAULT_BRANDING_CONFIG.institutionName} Team`,
    ),
    title: str(
      data,
      "staffTitle",
      brandingDefaults?.staffTitle ?? registryDefaults?.title ?? "Mortgage Specialist",
    ),
    email: str(data, "staffEmail", contactEmail),
    department: departmentDisplayName(department, companyBranding),
  };
}

function closedMortgageProgress() {
  return [
    { label: "Application", status: "Approved", date: "Feb 8, 2026", state: "complete" as const },
    { label: "Underwriting", status: "Complete", date: "Feb 18, 2026", state: "complete" as const },
    { label: "Funding", status: "Complete", date: "May 28, 2026", state: "complete" as const },
    { label: "Closing", status: "Closed", date: "Jun 18, 2026", state: "complete" as const },
  ];
}

export { TEMPLATE_DEPARTMENTS };

export function resolveEmailTemplate(
  template: EmailTemplateKey,
  data: EmailTemplateData = {},
  overrides?: { subject?: string; customMessage?: string },
  companyBranding?: CompanyEmailBranding,
): ResolvedEmailTemplate {
  const department = TEMPLATE_DEPARTMENTS[template];
  const communicationClass = resolveTemplateCommunicationClass(template);
  const firstName = str(data, "firstName", "there");
  const origin = companyBranding?.websiteUrl ?? "";
  const dashboardUrl = `${origin}/dashboard`;
  const loginUrl = `${origin}/login`;
  const meta = baseMeta(department, data, companyBranding);
  const emailBranding = companyBranding ? brandingToEmailContext(companyBranding) : undefined;
  const brand = companyBranding?.name ?? DEFAULT_BRANDING_CONFIG.institutionName;

  const builders: Record<
    EmailTemplateKey,
    () => { subject: string; content: EmailTemplateContent }
  > = {
    welcome: () => ({
      subject: `Welcome to ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: `Welcome, ${firstName}`,
        body: `Thank you for choosing ${brand}. Your account is ready. Complete your profile, explore your pre-qualification, and track every step of your home purchase with clear updates along the way.`,
        ctaLabel: "Open Your Dashboard",
        ctaUrl: dashboardUrl,
        showProgress: false,
      },
    }),
    verify_email: () => ({
      subject: `Verify Your ${brand} Email Address`,
      content: {
        ...meta,
        communicationClass,
        headline: str(data, "headline", "Confirm your email address"),
        body: str(
          data,
          "message",
          `Please verify your email address to activate secure access to your ${brand} account.`,
        ),
        tone: "pending",
        badge: "Action Required",
        ctaLabel: "Verify Email Address",
        ctaUrl: str(data, "verifyUrl", loginUrl),
        showProgress: false,
      },
    }),
    verification_success: () => ({
      subject: `Email Verified — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Your email is verified",
        body: `Your ${brand} account email has been confirmed. You can now receive application updates, funding notices, and closing communications.`,
        tone: "approved",
        badge: "Verified",
        ctaLabel: "Continue to Dashboard",
        ctaUrl: dashboardUrl,
        showProgress: false,
      },
    }),
    password_reset: () => ({
      subject: `${brand} Password Reset Request`,
      content: {
        ...meta,
        departmentName: DEPARTMENT_DISPLAY_NAMES.support,
        contactEmail: companyBranding?.supportEmail ?? meta.contactEmail,
        communicationClass,
        headline: "Password reset requested",
        body: `We received a request to reset your ${brand} portal password. If you did not make this request, contact our support team immediately.`,
        tone: "pending",
        badge: "Security Notice",
        ctaLabel: "Reset Password",
        ctaUrl: str(data, "resetUrl", loginUrl),
        showProgress: false,
        showContact: true,
      },
    }),
    magic_link: () => ({
      subject: `Your ${brand} Sign-In Link`,
      content: {
        ...meta,
        communicationClass,
        headline: "Sign in securely",
        body: `Use the secure link below to sign in to your ${brand} account. This link expires shortly and can only be used once.`,
        tone: "pending",
        badge: "Secure Sign-In",
        ctaLabel: `Sign In to ${brand}`,
        ctaUrl: str(data, "magicLinkUrl", loginUrl),
        showProgress: false,
      },
    }),
    auth_verification_code: () => ({
      subject: `Your ${brand} Verification Code`,
      content: {
        ...meta,
        communicationClass,
        headline: str(data, "headline", "Your verification code"),
        body: str(
          data,
          "message",
          `Your one-time verification code is ${str(data, "otpCode", "------")}. It expires shortly.`,
        ),
        tone: "pending",
        badge: "Verification Code",
        ctaLabel: `Continue to ${brand}`,
        ctaUrl: loginUrl,
        showProgress: false,
        showContact: true,
      },
    }),
    account_notification: () => ({
      subject: str(data, "headline", str(data, "subject", `Update from ${brand}`)),
      content: {
        ...meta,
        communicationClass,
        headline: str(data, "headline", "Account update"),
        body: str(
          data,
          "message",
          `You have a new update in your ${brand} account.`,
        ),
        ctaLabel: str(data, "ctaLabel", `View in ${brand}`),
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
      },
    }),
    security_alert: () => ({
      subject: `${brand} Security Alert`,
      content: {
        ...meta,
        communicationClass,
        headline: "New sign-in detected",
        body: str(
          data,
          "message",
          `Your ${brand} account was accessed. If this was not you, contact support immediately.`,
        ),
        tone: "rejected",
        badge: "Security Alert",
        ctaLabel: "Review Account",
        ctaUrl: `${origin}/dashboard/profile`,
        showProgress: false,
      },
    }),
    application_submitted: () => ({
      subject: `Mortgage Application Received — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Application received",
        body: `Your mortgage application has been submitted to ${brand}. Our lending team will review your file and contact you if additional information is required.`,
        tone: "pending",
        badge: "Submitted",
        detailRows: [
          { label: "Application", value: str(data, "applicationNumber", "—") },
          { label: "Requested Amount", value: currency(data, "requestedAmount") || "—" },
        ],
        ctaLabel: "View Application",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
      },
    }),
    application_under_review: () => ({
      subject: "Your Mortgage Application Is Under Review",
      content: {
        ...meta,
        communicationClass,
        headline: "Underwriting review in progress",
        body: "Your assigned loan officer and underwriting team are reviewing your mortgage application.",
        tone: "pending",
        badge: "Under Review",
        staff: staffForDepartment(department, data, companyBranding),
        ctaLabel: "View Application Status",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
        showContact: true,
      },
    }),
    additional_documents_required: () => ({
      subject: `Additional Documents Required — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "We need additional information",
        body: str(
          data,
          "message",
          "Please upload the requested documents to continue your mortgage review.",
        ),
        tone: "pending",
        badge: "Action Required",
        detailRows: str(data, "documentNames")
          ? [{ label: "Requested Documents", value: str(data, "documentNames") || "—" }]
          : undefined,
        staff: staffForDepartment(department, data, companyBranding),
        ctaLabel: "Upload Documents",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
      },
    }),
    documents_received_for_review: () => ({
      subject: `Documents Received — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Your documents were received",
        body: "Thank you for uploading your documents. Our team is reviewing them and will update you when the review is complete.",
        tone: "pending",
        badge: "Under Review",
        detailRows: str(data, "documentName")
          ? [{ label: "Document", value: str(data, "documentName") || "—" }]
          : undefined,
        staff: staffForDepartment(department, data, companyBranding),
        ctaLabel: "View Application",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
      },
    }),
    application_approved: () => ({
      subject: "Congratulations — Mortgage Approved",
      content: {
        ...meta,
        communicationClass,
        headline: "Your mortgage is approved",
        body: `Congratulations. Your mortgage application has been approved by ${brand}.`,
        tone: "approved",
        badge: "Approved",
        detailRows: [
          { label: "Approved Amount", value: currency(data, "approvedAmount") || "—" },
        ],
        ctaLabel: "View Funding Dashboard",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
      },
    }),
    application_rejected: () => ({
      subject: `Mortgage Application Update — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Application decision",
        body: str(
          data,
          "message",
          "Your mortgage application was not approved at this time.",
        ),
        tone: "rejected",
        badge: "Declined",
        ctaLabel: "Contact Support",
        ctaUrl: `${origin}/dashboard/support`,
        showProgress: false,
      },
    }),
    application_on_hold: () => ({
      subject: `Mortgage Application On Hold — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Application placed on hold",
        body: str(
          data,
          "message",
          "Your mortgage application is on hold while we complete an additional review.",
        ),
        tone: "pending",
        badge: "On Hold",
        executiveSignature: staffForDepartment("executive", data, companyBranding),
        ctaLabel: "View Application",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
        showContact: false,
      },
    }),
    pre_qualified_notice: () => ({
      subject: `Pre-Qualification Results — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "You are pre-qualified",
        body: `Based on your information, ${brand} has calculated your preliminary buying power.`,
        tone: "approved",
        badge: "Pre-Qualified",
        detailRows: [
          { label: "Estimated Mortgage", value: currency(data, "mortgageAmount") || "—" },
          { label: "Maximum Home Price", value: currency(data, "maxHomePrice") || "—" },
        ],
        executiveSignature: staffForDepartment("executive", data, companyBranding),
        ctaLabel: "View Pre-Qualification",
        ctaUrl: str(data, "actionUrl", `${origin}/dashboard/qualification-result`),
        showProgress: false,
        showContact: false,
      },
    }),
    eligible_amount_updated: () => ({
      subject: "Approved Mortgage Amount Updated",
      content: {
        ...meta,
        communicationClass,
        headline: "Your eligible amount has changed",
        body: "Your approved mortgage amount has been updated.",
        detailRows: [
          { label: "Previous Amount", value: currency(data, "previousAmount") || "—" },
          { label: "Updated Amount", value: currency(data, "approvedAmount") || "—" },
        ],
        executiveSignature: staffForDepartment("executive", data, companyBranding),
        ctaLabel: "Review Dashboard",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
        showContact: false,
      },
    }),
    funding_account_created: () => ({
      subject: `Funding Account Linked — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Your funding account has been linked",
        body: `${brand} has linked your Pathward funding account. View wire instructions in your dashboard. Your balance will update once mortgage funding is processed or your down payment is confirmed.`,
        tone: "approved",
        badge: "Account Linked",
        ctaLabel: "View Dashboard",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    funding_account_activated: () => ({
      subject: `Funding Account Activated — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Funding account activated",
        body: `Your ${brand} funding account is now active.`,
        tone: "approved",
        badge: "Activated",
        ctaLabel: "Open Funding Dashboard",
        ctaUrl: str(data, "actionUrl", `${origin}/wallet`),
      },
    }),
    deposit_submitted: () => ({
      subject: "Deposit Received — Pending Verification",
      content: {
        ...meta,
        communicationClass,
        headline: "Deposit submitted for verification",
        body: "We received your deposit submission. Our funding team will verify your transfer shortly.",
        tone: "pending",
        badge: "Pending Verification",
        detailRows: [{ label: "Amount", value: currency(data, "amount") || "—" }],
        ctaLabel: "View Funding Status",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    deposit_verified: () => ({
      subject: `Deposit Verified — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Your deposit has been verified",
        body: "We've verified your deposit.",
        tone: "approved",
        badge: "Verified",
        detailRows: [{ label: "Verified Amount", value: currency(data, "amount") || "—" }],
        ctaLabel: "View Closing Funds",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    deposit_rejected: () => ({
      subject: `Deposit Verification Update — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Deposit could not be verified",
        body: str(
          data,
          "message",
          "We were unable to verify your recent deposit.",
        ),
        tone: "rejected",
        badge: "Action Required",
        staff: staffForDepartment(department, data, companyBranding),
        ctaLabel: "View Funding Account",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
      },
    }),
    funding_balance_updated: () => ({
      subject: "Funding Account Balance Updated",
      content: {
        ...meta,
        communicationClass,
        headline: "Your funding balance changed",
        body: `Your ${brand} funding account balance has been updated.`,
        staff: staffForDepartment(department, data, companyBranding),
        detailRows: [{ label: "Current Balance", value: currency(data, "balance") || "—" }],
        ctaLabel: "View Account",
        ctaUrl: str(data, "actionUrl", `${origin}/wallet`),
        showProgress: false,
      },
    }),
    escrow_transfer_requested: () => ({
      subject: "Escrow Transfer Request Received",
      content: {
        ...meta,
        communicationClass,
        headline: "Escrow transfer request received",
        body: "We received your request to transfer closing funds to the seller via escrow.",
        tone: "pending",
        badge: "Initiated",
        detailRows: [{ label: "Transfer Amount", value: currency(data, "amount") || "—" }],
        ctaLabel: "Track Transfer",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    escrow_transfer_pending_approval: () => ({
      subject: `Escrow Transfer Pending ${brand} Approval`,
      content: {
        ...meta,
        communicationClass,
        headline: `Pending ${brand} approval`,
        body: "Your escrow transfer request is being reviewed by our closing team.",
        tone: "pending",
        badge: "Pending Approval",
        ctaLabel: "View Status",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    escrow_transfer_approved: () => ({
      subject: `Escrow Transfer Approved — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Escrow transfer approved",
        body: `Your escrow transfer has been approved by ${brand}.`,
        tone: "approved",
        badge: "Approved",
        detailRows: [{ label: "Transfer Amount", value: currency(data, "amount") || "—" }],
        ctaLabel: "View Closing Details",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
      },
    }),
    additional_funding_required: () => ({
      subject: `Additional Funding Required — ${brand}`,
      content: {
        ...meta,
        communicationClass,
        headline: "Additional deposit required",
        body: str(
          data,
          "message",
          "An additional deposit is required before closing can proceed.",
        ),
        tone: "pending",
        badge: "Additional Funding",
        staff: staffForDepartment(department, data, companyBranding),
        detailRows: [
          { label: "Required Amount", value: currency(data, "amount") || "—" },
          { label: "Purpose", value: str(data, "label", "Closing Requirement") },
        ],
        ctaLabel: "Make Payment",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: false,
      },
    }),
    funds_released_to_seller: () => ({
      subject: "Closing Funds Released to Seller",
      content: {
        ...meta,
        communicationClass,
        headline: "Funds released to seller",
        body: `${brand} has released your closing funds to the seller via escrow.`,
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
        ...meta,
        communicationClass,
        headline: "Your mortgage has successfully closed.",
        body:
          overrides?.customMessage ??
          str(
            data,
            "message",
            `Congratulations on completing your home purchase with ${brand}. The funds have been released to the seller.`,
          ),
        tone: "approved",
        badge: "Closed",
        detailRows: [
          {
            label: "Mortgage ID",
            value: str(data, "applicationNumber", "ORB-2026-128972"),
          },
          {
            label: "Property Address",
            value: str(data, "propertyAddress", "1050 Woodward Ave, Detroit, MI 48226"),
          },
          {
            label: "Mortgage Amount",
            value: currency(data, "approvedAmount") || "$503,920.00",
          },
          {
            label: "Total Closing Amount",
            value: currency(data, "closingAmount") || "$629,900.00",
          },
          { label: "Current Status", value: "Closed" },
        ],
        progressSteps: closedMortgageProgress(),
        ctaLabel: "View Mortgage Details",
        ctaUrl: str(data, "actionUrl", dashboardUrl),
        showProgress: true,
        showInfoGrid: true,
        showContact: true,
      },
    }),
    custom_loan_officer: () => ({
      subject: str(data, "subject", "Message from Your Loan Officer"),
      content: {
        ...meta,
        communicationClass,
        headline: str(data, "headline", "Message from your loan officer"),
        body: overrides?.customMessage ?? str(data, "message", ""),
        staff: staffForDepartment("loan_officer", data, companyBranding),
        showProgress: false,
      },
    }),
    custom_chief_lending_officer: () => ({
      subject: str(data, "subject", `Important update from ${brand}`),
      content: {
        ...meta,
        departmentName: DEPARTMENT_DISPLAY_NAMES.executive,
        communicationClass,
        headline: str(data, "headline", "An update on your mortgage"),
        body: overrides?.customMessage ?? str(data, "message", ""),
        executiveSignature: staffForDepartment("executive", data, companyBranding),
        showProgress: false,
        showContact: false,
      },
    }),
    custom_funding_department: () => ({
      subject: str(data, "subject", "Update on your funding account"),
      content: {
        ...meta,
        communicationClass,
        headline: str(data, "headline", "An update on your funding account"),
        body: overrides?.customMessage ?? str(data, "message", ""),
        staff: staffForDepartment("funding", data, companyBranding),
        showProgress: false,
      },
    }),
    custom_closings_department: () => ({
      subject: str(data, "subject", "Update on your closing"),
      content: {
        ...meta,
        communicationClass,
        headline: str(data, "headline", "An update on your closing"),
        body: overrides?.customMessage ?? str(data, "message", ""),
        staff: staffForDepartment("closings", data, companyBranding),
        showProgress: false,
      },
    }),
    custom_message: () => ({
      subject: str(data, "subject", `Message from ${brand}`),
      content: {
        ...meta,
        communicationClass: "department",
        headline: str(data, "headline", str(data, "subject", `Message from ${brand}`)),
        body: overrides?.customMessage ?? str(data, "message", ""),
        staff: staffForDepartment(
          (str(data, "department", "system") as EmailDepartment) || "system",
          data,
          companyBranding,
        ),
        showProgress: false,
        showContact: true,
      },
    }),
  };

  const built = builders[template]();
  const content = {
    ...built.content,
    communicationClass,
    branding: emailBranding,
    ...(overrides?.customMessage &&
    (template.startsWith("custom_") || template === "custom_message")
      ? { body: overrides.customMessage }
      : {}),
  };

  return {
    subject: overrides?.subject ?? built.subject,
    department,
    content,
  };
}

export async function renderEmailFromTemplate(
  template: EmailTemplateKey,
  data?: EmailTemplateData,
  overrides?: { subject?: string; customMessage?: string },
  companyId?: string,
) {
  const companyBranding = await resolveCompanyEmailBranding(companyId);
  const resolved = resolveEmailTemplate(template, data, overrides, companyBranding);
  const rendered = await renderReactEmailTemplate({
    template,
    preview: resolved.subject,
    content: resolved.content,
  });

  return {
    ...resolved,
    ...rendered,
  };
}
