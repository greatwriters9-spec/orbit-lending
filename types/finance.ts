import type {
  ApplicationStatus,
  ApplicationStatusEntry,
  ApplicationScores,
  DocumentReviewStatus,
  LoanOffer,
} from "@/types/application-details";

export type InternalNote = {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  note: string;
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  createdAt: string;
};

export type FinanceApplicationSummary = {
  id: string;
  applicationNumber: string;
  loanProductSlug: string;
  productName: string;
  applicantName: string;
  requestedAmount: number;
  status: ApplicationStatus;
  submittedAt?: string;
  updatedAt: string;
  purpose?: string;
};

export type FinanceApplicationDetail = FinanceApplicationSummary & {
  userId: string;
  approvedAmount?: number;
  pathwardBalance: number;
  selectedTermId?: string;
  personalInfo: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
  scores?: ApplicationScores;
  statusHistory: ApplicationStatusEntry[];
  offers: LoanOffer[];
  internalNotes: InternalNote[];
  auditLogs: AuditLogEntry[];
  documentRequests: Array<{
    id: string;
    documentName: string;
    description?: string;
    required: boolean;
    fulfilled: boolean;
    reviewStatus: DocumentReviewStatus;
    fileName?: string;
    requestedAt: string;
    dueDate?: string;
    uploadedAt?: string;
    downloadUrl?: string | null;
  }>;
  messages: Array<{
    id: string;
    senderRole: string;
    senderName: string;
    message: string;
    createdAt: string;
  }>;
};

export type FinanceDashboardStats = {
  pendingReview: number;
  informationRequired: number;
  pendingApproval: number;
  approvedToday: number;
};

export type FinanceActionState = {
  error?: string;
  success?: string;
};
