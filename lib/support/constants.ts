import type {
  SupportContactPreference,
  SupportEscalationLevel,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/support";

export const SUPPORT_ATTACHMENTS_BUCKET = "support-attachments";
export const SUPPORT_MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export const TICKET_CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  application_support: "Application Support",
  loan_status_inquiry: "Mortgage Status Inquiry",
  repayment_assistance: "Repayment Assistance",
  payment_verification: "Payment Verification",
  withdrawal_issue: "Withdrawal Issue",
  document_verification: "Document Verification",
  account_access: "Account Access",
  security_concern: "Security Concern",
  technical_issue: "Technical Issue",
  general_inquiry: "General Inquiry",
  other: "Other",
};

export const TICKET_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
  critical: "Critical",
};

export const TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  waiting_for_client: "Waiting For Client",
  escalated: "Escalated",
  resolved: "Resolved",
  closed: "Closed",
};

export const CONTACT_PREFERENCE_LABELS: Record<SupportContactPreference, string> = {
  email: "Email",
  in_app: "In-App",
  both: "Email & In-App",
};

export const ESCALATION_LEVEL_LABELS: Record<SupportEscalationLevel, string> = {
  loan_officer: "Loan Officer",
  credit_manager: "Credit Manager",
  chief_lending_officer: "Chief Lending Officer",
};

export const KNOWLEDGE_CATEGORY_LABELS: Record<string, string> = {
  getting_started: "Getting Started",
  applying_for_financing: "Applying For a Mortgage",
  loan_status_tracking: "Mortgage Status Tracking",
  repayments: "Repayments",
  wallet_management: "Funding Account Management",
  transactions: "Transactions",
  document_uploads: "Document Uploads",
  account_security: "Account Security",
  faq: "Frequently Asked Questions",
};

export const QUICK_ACTION_CATEGORIES: Array<{
  label: string;
  category: SupportTicketCategory;
  description: string;
}> = [
  {
    label: "Contact Support",
    category: "general_inquiry",
    description: "General questions about your account",
  },
  {
    label: "Open New Ticket",
    category: "general_inquiry",
    description: "Submit a new support request",
  },
  {
    label: "Message Loan Officer",
    category: "loan_status_inquiry",
    description: "Questions about your mortgage or application",
  },
  {
    label: "Report Payment Issue",
    category: "payment_verification",
    description: "Payment not reflected or verification delay",
  },
  {
    label: "Mortgage Application Assistance",
    category: "application_support",
    description: "Help completing or updating your application",
  },
  {
    label: "Account Verification Help",
    category: "document_verification",
    description: "Document or identity verification support",
  },
  {
    label: "Technical Support",
    category: "technical_issue",
    description: "Portal access or technical problems",
  },
  {
    label: "Document Assistance",
    category: "document_verification",
    description: "Upload or document submission help",
  },
];

export function generateTicketNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORB-SUP-${date}-${suffix}`;
}

export function getInitialEscalationLevel(
  priority: SupportTicketPriority,
): SupportEscalationLevel {
  if (priority === "critical" || priority === "urgent") {
    return "credit_manager";
  }
  return "loan_officer";
}

export function shouldAutoEscalate(priority: SupportTicketPriority): boolean {
  return priority === "high" || priority === "urgent" || priority === "critical";
}
