export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "pre_qualified"
  | "pre_approved"
  | "information_required"
  | "pending_finance_approval"
  | "approved"
  | "offer_sent"
  | "offer_accepted"
  | "offer_declined"
  | "funded"
  | "active"
  | "completed"
  | "rejected"
  | "defaulted";

export type ApplicationMessage = {
  id: string;
  applicationId: string;
  senderId?: string;
  senderRole: "client" | "officer" | "finance" | "system";
  senderName: string;
  message: string;
  attachmentUrl?: string;
  createdAt: string;
};

export type ApplicationStatusEntry = {
  id: string;
  status: ApplicationStatus;
  note?: string;
  createdAt: string;
  changedBy?: string;
};

export type DocumentReviewStatus =
  | "requested"
  | "pending_review"
  | "approved"
  | "rejected";

export type DocumentRequest = {
  id: string;
  applicationId: string;
  documentName: string;
  description?: string;
  required: boolean;
  fulfilled: boolean;
  reviewStatus: DocumentReviewStatus;
  fileName?: string;
  requestedAt: string;
  dueDate?: string;
  uploadedAt?: string;
};

export type LoanOffer = {
  id: string;
  applicationId: string;
  requestedAmount: number;
  recommendedAmount: number;
  finalAmount: number;
  offeredInterestRate: number;
  repaymentFrequency: string;
  repaymentPeriod: number;
  notes?: string;
  acceptedByClient: boolean | null;
  status: "pending" | "accepted" | "declined" | "expired";
  expiresAt?: string;
  createdAt: string;
};

export type ApplicationScoreInput = {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingDebt: number;
  requestedAmount: number;
  employmentStatus: string;
};

export type ApplicationScores = {
  riskScore: number;
  incomeScore: number;
  employmentScore: number;
  finalScore: number;
  scoredAt?: string;
};

export type ApplicationSummary = {
  id: string;
  applicationNumber: string;
  loanProductSlug: string;
  productName: string;
  requestedAmount: number;
  status: ApplicationStatus;
  submittedAt?: string;
  updatedAt: string;
  purpose?: string;
};

export type ApplicationDetail = ApplicationSummary & {
  selectedTermId?: string;
  purpose?: string;
  personalInfo: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
  scores?: ApplicationScores;
  progressSteps: Array<{
    id: string;
    label: string;
    status: "completed" | "current" | "upcoming";
  }>;
  statusHistory: ApplicationStatusEntry[];
  messages: ApplicationMessage[];
  documentRequests: DocumentRequest[];
  offers: LoanOffer[];
};

export type ApplicationActionState = {
  error?: string;
  success?: string;
};
