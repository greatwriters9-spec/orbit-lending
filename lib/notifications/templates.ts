import type {
  AdminNotificationEvent,
  AdminNotificationSeverity,
} from "@/types/admin-notifications";

export type AdminNotificationTemplate = {
  title: string;
  message: string;
  severity: AdminNotificationSeverity;
  telegramBody?: string;
};

function formatTimestamp(value?: unknown): string {
  if (typeof value === "string" && value.length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  }
  return new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(value: unknown): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return String(value ?? "—");
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function str(payload: Record<string, unknown>, key: string, fallback = "—"): string {
  const value = payload[key];
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function registrationTelegram(payload: Record<string, unknown>): string {
  return `👤 New User Registration

Name:
${str(payload, "name")}

Email:
${str(payload, "email")}

Time:
${formatTimestamp(payload.timestamp)}`;
}

function applicationTelegram(payload: Record<string, unknown>): string {
  return `🏠 New Mortgage Application

Applicant:
${str(payload, "name")}

Requested Amount:
${formatCurrency(payload.amount)}

Reference:
${str(payload, "applicationId")}`;
}

function downPaymentTelegram(payload: Record<string, unknown>): string {
  return `💰 Down Payment Submitted

Applicant:
${str(payload, "name")}

Amount:
${formatCurrency(payload.amount)}

Reference:
${str(payload, "applicationId")}`;
}

function escrowTelegram(payload: Record<string, unknown>): string {
  return `🚨 Escrow Transfer Requested

Applicant:
${str(payload, "name")}

Closing Amount:
${formatCurrency(payload.amount)}

Reference:
${str(payload, "applicationId")}`;
}

function supportTelegram(payload: Record<string, unknown>): string {
  return `📨 New Support Message

From:
${str(payload, "name")}

Subject:
${str(payload, "subject")}`;
}

const EVENT_DEFAULTS: Partial<
  Record<
    AdminNotificationEvent,
    (payload: Record<string, unknown>) => AdminNotificationTemplate
  >
> = {
  NEW_USER_REGISTRATION: (payload) => ({
    title: "New User Registration",
    message: `${str(payload, "name")} (${str(payload, "email")}) registered for an Orbit Mortgage account.`,
    severity: "critical",
    telegramBody: registrationTelegram(payload),
  }),
  EMAIL_VERIFIED: (payload) => ({
    title: "Email Verified",
    message: `${str(payload, "email")} verified their email address.`,
    severity: "informational",
  }),
  PROFILE_COMPLETED: (payload) => ({
    title: "Profile Completed",
    message: `${str(payload, "name")} completed their profile.`,
    severity: "normal",
  }),
  IDENTITY_VERIFICATION_SUBMITTED: (payload) => ({
    title: "Identity Verification Submitted",
    message: `${str(payload, "name")} submitted identity verification.`,
    severity: "high",
  }),
  IDENTITY_VERIFICATION_FAILED: (payload) => ({
    title: "Identity Verification Failed",
    message: `Identity verification failed for ${str(payload, "name")}.`,
    severity: "critical",
  }),
  NEW_MORTGAGE_APPLICATION: (payload) => ({
    title: "New Mortgage Application",
    message: `${str(payload, "name")} submitted a mortgage application for ${formatCurrency(payload.amount)}.`,
    severity: "critical",
    telegramBody: applicationTelegram(payload),
  }),
  APPLICATION_UPDATED: (payload) => ({
    title: "Application Updated",
    message: `Application ${str(payload, "applicationId")} was updated by ${str(payload, "name")}.`,
    severity: "normal",
  }),
  APPLICATION_READY_FOR_REVIEW: (payload) => ({
    title: "Application Ready for Review",
    message: `Application ${str(payload, "applicationId")} is ready for review.`,
    severity: "high",
  }),
  DOCUMENT_UPLOADED: (payload) => ({
    title: "Document Uploaded",
    message: `${str(payload, "name")} uploaded ${str(payload, "documentName", "a document")} for application ${str(payload, "applicationId")}.`,
    severity: "high",
  }),
  APPLICATION_APPROVED: (payload) => ({
    title: "Application Approved",
    message: `Application ${str(payload, "applicationId")} was approved for ${formatCurrency(payload.amount)}.`,
    severity: "high",
  }),
  APPLICATION_REJECTED: (payload) => ({
    title: "Application Rejected",
    message: `Application ${str(payload, "applicationId")} was rejected.`,
    severity: "high",
  }),
  DOWN_PAYMENT_SUBMITTED: (payload) => ({
    title: "Down Payment Submitted",
    message: `${str(payload, "name")} submitted a down payment of ${formatCurrency(payload.amount)} for application ${str(payload, "applicationId")}.`,
    severity: "critical",
    telegramBody: downPaymentTelegram(payload),
  }),
  DEPOSIT_RECEIVED: (payload) => ({
    title: "Deposit Received",
    message: `Deposit of ${formatCurrency(payload.amount)} received for application ${str(payload, "applicationId")}.`,
    severity: "high",
  }),
  DEPOSIT_VERIFICATION_REQUIRED: (payload) => ({
    title: "Deposit Verification Required",
    message: `Verify deposit of ${formatCurrency(payload.amount)} for application ${str(payload, "applicationId")}.`,
    severity: "critical",
    telegramBody: downPaymentTelegram(payload),
  }),
  DEPOSIT_APPROVED: (payload) => ({
    title: "Deposit Approved",
    message: `Deposit of ${formatCurrency(payload.amount)} approved for application ${str(payload, "applicationId")}.`,
    severity: "normal",
  }),
  DEPOSIT_REJECTED: (payload) => ({
    title: "Deposit Rejected",
    message: `Deposit rejected for application ${str(payload, "applicationId")}.`,
    severity: "high",
  }),
  ADDITIONAL_FUNDS_REQUIRED: (payload) => ({
    title: "Additional Funds Required",
    message: `Additional funds of ${formatCurrency(payload.amount)} requested for application ${str(payload, "applicationId")}.`,
    severity: "high",
  }),
  FUNDING_GOAL_REACHED: (payload) => ({
    title: "Funding Goal Reached",
    message: `Closing funds goal reached for application ${str(payload, "applicationId")}.`,
    severity: "normal",
  }),
  ESCROW_TRANSFER_REQUESTED: (payload) => ({
    title: "Escrow Transfer Requested",
    message: `${str(payload, "name")} requested an escrow transfer of ${formatCurrency(payload.amount)} for application ${str(payload, "applicationId")}.`,
    severity: "critical",
    telegramBody: escrowTelegram(payload),
  }),
  ESCROW_TRANSFER_CANCELLED: (payload) => ({
    title: "Escrow Transfer Cancelled",
    message: `Escrow transfer cancelled for application ${str(payload, "applicationId")}.`,
    severity: "high",
  }),
  ESCROW_TRANSFER_APPROVED: (payload) => ({
    title: "Escrow Transfer Approved",
    message: `Escrow transfer approved for application ${str(payload, "applicationId")}.`,
    severity: "high",
  }),
  ESCROW_TRANSFER_COMPLETED: (payload) => ({
    title: "Escrow Transfer Completed",
    message: `Escrow transfer completed for application ${str(payload, "applicationId")}.`,
    severity: "normal",
  }),
  CLOSING_COMPLETED: (payload) => ({
    title: "Closing Completed",
    message: `Closing completed for application ${str(payload, "applicationId")}.`,
    severity: "normal",
  }),
  NEW_SUPPORT_MESSAGE: (payload) => ({
    title: "New Support Message",
    message: `New support message from ${str(payload, "name")}: ${str(payload, "subject")}.`,
    severity: "high",
    telegramBody: supportTelegram(payload),
  }),
  CLIENT_REPLY: (payload) => ({
    title: "Client Reply",
    message: `${str(payload, "name")} replied on support ticket ${str(payload, "ticketId")}.`,
    severity: "normal",
    telegramBody: supportTelegram(payload),
  }),
  NEW_CONVERSATION: (payload) => ({
    title: "New Conversation",
    message: `New conversation started by ${str(payload, "name")}.`,
    severity: "normal",
  }),
  LOAN_OFFICER_MESSAGE: (payload) => ({
    title: "Loan Officer Message",
    message: `Message sent to ${str(payload, "name")} on application ${str(payload, "applicationId")}.`,
    severity: "informational",
  }),
  FUNDING_DEPARTMENT_MESSAGE: (payload) => ({
    title: "Funding Department Message",
    message: str(payload, "message"),
    severity: "normal",
  }),
  CLOSING_DEPARTMENT_MESSAGE: (payload) => ({
    title: "Closing Department Message",
    message: str(payload, "message"),
    severity: "normal",
  }),
  CONTACT_FORM_SUBMITTED: (payload) => ({
    title: "Contact Form Submitted",
    message: `Contact form submitted by ${str(payload, "name")} (${str(payload, "email")}).`,
    severity: "normal",
  }),
  GUEST_MORTGAGE_INQUIRY: (payload) => ({
    title: "Guest Mortgage Inquiry",
    message: `Mortgage inquiry from ${str(payload, "name")} (${str(payload, "email")}).`,
    severity: "high",
  }),
  CALLBACK_REQUEST: (payload) => ({
    title: "Callback Request",
    message: `Callback requested by ${str(payload, "name")} (${str(payload, "phone", str(payload, "email"))}).`,
    severity: "high",
  }),
  GENERAL_INQUIRY: (payload) => ({
    title: "General Inquiry",
    message: `General inquiry from ${str(payload, "name")}.`,
    severity: "normal",
  }),
  MULTIPLE_FAILED_LOGINS: (payload) => ({
    title: "Multiple Failed Logins",
    message: `Multiple failed login attempts for ${str(payload, "email")}.`,
    severity: "critical",
  }),
  ACCOUNT_LOCKED: (payload) => ({
    title: "Account Locked",
    message: `Account locked for ${str(payload, "email")}.`,
    severity: "critical",
  }),
  SUSPICIOUS_ACTIVITY: (payload) => ({
    title: "Suspicious Activity",
    message: str(payload, "message", "Suspicious activity detected."),
    severity: "critical",
  }),
  ADMIN_LOGIN: (payload) => ({
    title: "Admin Login",
    message: `${str(payload, "name")} signed in to the admin portal.`,
    severity: "informational",
  }),
  ROLE_CHANGED: (payload) => ({
    title: "Role Changed",
    message: `Role changed to ${str(payload, "role")} for user ${str(payload, "email")}.`,
    severity: "critical",
  }),
};

export function resolveAdminNotificationTemplate(
  event: AdminNotificationEvent,
  payload: Record<string, unknown>,
  severityOverride?: AdminNotificationSeverity,
): AdminNotificationTemplate {
  const builder = EVENT_DEFAULTS[event];
  const template = builder
    ? builder(payload)
    : {
        title: event.replace(/_/g, " "),
        message: str(payload, "message", "An admin attention event occurred."),
        severity: "normal" as AdminNotificationSeverity,
      };

  return {
    ...template,
    severity: severityOverride ?? template.severity,
  };
}

export function formatTelegramAlert(input: {
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  dashboardUrl?: string;
  customBody?: string;
}): string {
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (input.customBody) {
    return input.customBody;
  }

  const reference =
    input.entityType && input.entityId
      ? `${input.entityType} #${input.entityId}`
      : "—";

  return `🚨 Orbit Mortgage Alert

Event:
${input.title}

Details:
${input.message}

Reference:
${reference}

Time:
${timestamp}

Dashboard:
${input.dashboardUrl ?? "—"}`;
}
