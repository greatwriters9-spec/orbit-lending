import type { ApplicationStatus } from "@/types/application-details";
import type { PortfolioSummary } from "@/types/dashboard";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";
import type { PathwardLinkedAccount } from "@/types/wallet";

export type MortgageDashboardState =
  | "empty"
  | "pre_qualified"
  | "property_submitted"
  | "approved"
  | "closing"
  | "active_mortgage";

export type DownPaymentStatus =
  | "awaiting_deposit"
  | "partially_funded"
  | "fully_funded"
  | "pending_verification"
  | "verified"
  | "rejected";

export type FundingStatusLabel =
  | "Awaiting Deposit"
  | "Partially Funded"
  | "Fully Funded"
  | "Pending Verification"
  | "Verified";

export type ClosingFundsStatus = "locked" | "ready_for_closing" | "available";

export type MortgageSummaryView = {
  approvedMortgageAmount: number;
  amountLabel: string;
  requiredDownPayment: number;
  estimatedMonthlyPayment: number;
  maximumHomePrice: number;
  statusLabel: string;
  isEligibleAmount: boolean;
};

export type MortgageDetailsView = {
  productName: string;
  interestRate: number;
  termYears: number;
  termMonths: number;
  propertyUsage: string;
  propertyType: string;
  loanToValue: number;
};

export type PathwardFundingView = {
  bankName: string;
  accountHolder: string;
  routingNumber: string;
  accountNumberLast4: string;
  requiredDeposit: number;
  currentBalance: number;
  remainingRequired: number;
  fundingPercent: number;
  fundingStatus: FundingStatusLabel;
  linked: boolean;
  setupPending: boolean;
  showFundingActions: boolean;
};

export type DownPaymentView = {
  requiredAmount: number;
  amountReceived: number;
  remainingAmount: number;
  status: DownPaymentStatus;
  statusLabel: FundingStatusLabel;
  canSubmitDepositCompleted: boolean;
};

export type ClosingFundsView = {
  projectedTransferAmount: number;
  transferableBalance: number;
  pendingPathwardBalance: number;
  status: ClosingFundsStatus;
  statusLabel: string;
  mortgageApproved: boolean;
  downPaymentVerified: boolean;
  canTransferToEscrow: boolean;
};

export type NextActionView = {
  title: string;
  message: string;
  buttonLabel: string;
  buttonHref: string;
  checklist?: string[];
};

export type DocumentCenterItem = {
  id: string;
  name: string;
  status: "approved" | "pending" | "required" | "rejected";
};

export type PropertyDetailsView = {
  address: string;
  purchasePrice: number;
  propertyType: string;
  propertyUsage: string;
  mortgageAmount: number;
  closingDate?: string;
};

export type MortgageActivityItem = {
  id: string;
  title: string;
  date: string;
  description?: string;
};

export type MortgageMessageItem = {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  category: "advisor" | "underwriting" | "support" | "system";
};

export type DownPaymentMeta = {
  status: DownPaymentStatus;
  requiredAmount: number;
  verificationRequestedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedReason?: string;
  pathwardCreditApplied?: number;
};

export type MortgageDashboardView = {
  state: MortgageDashboardState;
  journeyStage: number;
  applicationId?: string;
  applicationNumber?: string;
  applicationStatus?: ApplicationStatus;
  summary: MortgageSummaryView;
  details: MortgageDetailsView;
  pathwardFunding: PathwardFundingView;
  downPayment: DownPaymentView;
  closingFunds: ClosingFundsView;
  nextAction: NextActionView;
  documents: DocumentCenterItem[];
  propertyDetails: PropertyDetailsView | null;
  activities: MortgageActivityItem[];
  messages: MortgageMessageItem[];
  portfolio: PortfolioSummary | null;
  linkedAccount: PathwardLinkedAccount | null;
  propertyAddressLine?: string;
};

export const JOURNEY_STAGE_LABELS = [
  "Pre-Qualified",
  "Find Property",
  "Submit Property",
  "Underwriting",
  "Conditional Approval",
  "Funding Account",
  "Closing",
  "Mortgage Active",
] as const;
