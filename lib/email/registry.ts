import type {
  EmailCommunicationClass,
  EmailDepartment,
  EmailTemplateKey,
} from "@/lib/email/types";

export const TEMPLATE_COMMUNICATION_CLASS: Record<
  EmailTemplateKey,
  EmailCommunicationClass
> = {
  welcome: "automated",
  verify_email: "automated",
  verification_success: "automated",
  password_reset: "automated",
  security_alert: "automated",
  application_submitted: "automated",
  application_under_review: "department",
  additional_documents_required: "department",
  application_approved: "automated",
  application_rejected: "automated",
  application_on_hold: "executive",
  pre_qualified_notice: "executive",
  eligible_amount_updated: "executive",
  funding_account_created: "automated",
  funding_account_activated: "automated",
  deposit_submitted: "automated",
  deposit_verified: "automated",
  deposit_rejected: "department",
  funding_balance_updated: "department",
  escrow_transfer_requested: "automated",
  escrow_transfer_pending_approval: "automated",
  escrow_transfer_approved: "automated",
  additional_funding_required: "department",
  funds_released_to_seller: "automated",
  mortgage_closed_successfully: "automated",
  custom_loan_officer: "department",
  custom_chief_lending_officer: "executive",
  custom_funding_department: "department",
  custom_closings_department: "department",
};

export const TEMPLATE_DEPARTMENTS: Record<EmailTemplateKey, EmailDepartment> = {
  welcome: "system",
  verify_email: "system",
  verification_success: "system",
  password_reset: "support",
  security_alert: "system",
  application_submitted: "system",
  application_under_review: "loan_officer",
  additional_documents_required: "underwriting",
  application_approved: "system",
  application_rejected: "system",
  application_on_hold: "executive",
  pre_qualified_notice: "executive",
  eligible_amount_updated: "executive",
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
  custom_chief_lending_officer: "executive",
  custom_funding_department: "funding",
  custom_closings_department: "closings",
};

export const DEPARTMENT_DISPLAY_NAMES: Record<EmailDepartment, string> = {
  system: "Orbit Mortgage System",
  loan_officer: "Loan Officer Department",
  underwriting: "Underwriting Department",
  funding: "Funding Department",
  closings: "Closing Department",
  support: "Client Support",
  executive: "Executive Office",
};

export const DEPARTMENT_CONTACT_EMAILS: Record<EmailDepartment, string> = {
  system: "noreply@orbitmortgage.com",
  loan_officer: "loanofficer@orbitmortgage.com",
  underwriting: "underwriting@orbitmortgage.com",
  funding: "funding@orbitmortgage.com",
  closings: "closing@orbitmortgage.com",
  support: "support@orbitmortgage.com",
  executive: "chief.lending.officer@orbitmortgage.com",
};

export const DEFAULT_STAFF_BY_DEPARTMENT: Partial<
  Record<EmailDepartment, { name: string; title: string }>
> = {
  loan_officer: {
    name: "Jordan Ellis",
    title: "Senior Loan Officer",
  },
  underwriting: {
    name: "Morgan Blake",
    title: "Underwriting Specialist",
  },
  funding: {
    name: "Taylor Reed",
    title: "Funding Operations Manager",
  },
  closings: {
    name: "Casey Nguyen",
    title: "Closing Coordinator",
  },
  support: {
    name: "Orbit Mortgage Support",
    title: "Client Support Team",
  },
  executive: {
    name: "Patricia Harmon",
    title: "Chief Lending Officer",
  },
};

export function resolveTemplateCommunicationClass(
  template: EmailTemplateKey,
): EmailCommunicationClass {
  return TEMPLATE_COMMUNICATION_CLASS[template];
}

export function resolveTemplateDepartment(template: EmailTemplateKey): EmailDepartment {
  return TEMPLATE_DEPARTMENTS[template];
}

export function resolveTemplateForEvent(event: string): EmailTemplateKey | null {
  const map: Record<string, EmailTemplateKey> = {
    welcome: "welcome",
    verify_email: "verify_email",
    verification_success: "verification_success",
    password_reset: "password_reset",
    security_alert: "security_alert",
    application_submitted: "application_submitted",
    application_under_review: "application_under_review",
    information_required: "additional_documents_required",
    application_approved: "application_approved",
    application_rejected: "application_rejected",
    application_on_hold: "application_on_hold",
    pre_qualified: "pre_qualified_notice",
    eligible_amount_updated: "eligible_amount_updated",
    funding_account_created: "funding_account_created",
    funding_account_activated: "funding_account_activated",
    deposit_submitted: "deposit_submitted",
    deposit_verified: "deposit_verified",
    deposit_rejected: "deposit_rejected",
    escrow_transfer_requested: "escrow_transfer_requested",
    escrow_transfer_pending: "escrow_transfer_pending_approval",
    escrow_transfer_approved: "escrow_transfer_approved",
    funds_released: "funds_released_to_seller",
    mortgage_closed: "mortgage_closed_successfully",
  };

  return map[event] ?? null;
}

export function selectEmailTemplateForNotification(input: {
  event?: string;
  status?: string;
}): EmailTemplateKey | null {
  if (input.event) {
    const byEvent = resolveTemplateForEvent(input.event);
    if (byEvent) return byEvent;
  }

  if (input.status) {
    const statusMap: Record<string, EmailTemplateKey> = {
      submitted: "application_submitted",
      under_review: "application_under_review",
      information_required: "additional_documents_required",
      approved: "application_approved",
      rejected: "application_rejected",
      pending_finance_approval: "application_on_hold",
      funded: "funding_account_activated",
      active: "mortgage_closed_successfully",
      completed: "mortgage_closed_successfully",
    };
    return statusMap[input.status] ?? null;
  }

  return null;
}
