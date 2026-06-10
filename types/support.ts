export type SupportTicketCategory =
  | "application_support"
  | "loan_status_inquiry"
  | "repayment_assistance"
  | "payment_verification"
  | "withdrawal_issue"
  | "document_verification"
  | "account_access"
  | "security_concern"
  | "technical_issue"
  | "general_inquiry"
  | "other";

export type SupportTicketPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent"
  | "critical";

export type SupportTicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "waiting_for_client"
  | "escalated"
  | "resolved"
  | "closed";

export type SupportContactPreference = "email" | "in_app" | "both";

export type SupportEscalationLevel =
  | "loan_officer"
  | "credit_manager"
  | "chief_lending_officer";

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  borrowerId: string;
  applicationId: string | null;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  description: string;
  contactPreference: SupportContactPreference;
  assignedTo: string | null;
  assignedStaffName: string | null;
  escalationLevel: SupportEscalationLevel;
  escalatedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  borrowerName?: string | null;
  borrowerEmail?: string | null;
};

export type SupportTicketMessage = {
  id: string;
  ticketId: string;
  senderId: string | null;
  senderRole: "client" | "staff" | "system";
  senderName: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  attachments?: SupportTicketAttachment[];
};

export type SupportTicketAttachment = {
  id: string;
  ticketId: string;
  messageId: string | null;
  fileName: string;
  storagePath: string;
  downloadUrl?: string | null;
  createdAt: string;
};

export type SupportTimelineEvent = {
  id: string;
  ticketId: string;
  eventType: string;
  title: string;
  description: string | null;
  actorId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type SupportKnowledgeArticle = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
};

export type SupportSummary = {
  openTickets: number;
  awaitingClient: number;
  recentResponses: number;
  unreadSupportNotifications: number;
};

export type SupportAnalytics = {
  openTickets: number;
  averageResolutionHours: number;
  satisfactionScore: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  escalationRate: number;
};

export type SupportActionState = {
  error?: string;
  success?: string;
  ticketId?: string;
};

export type SupportTicketFilters = {
  status?: SupportTicketStatus[];
  category?: SupportTicketCategory[];
  priority?: SupportTicketPriority[];
  search?: string;
  assignedToMe?: boolean;
};
