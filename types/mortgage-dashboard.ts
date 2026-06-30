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
  | "Pending"
  | "Verified"
  | "Transfer Pending"
  | "Amount Required";

export type ClosingFundsStatus =
  | "locked"
  | "ready_for_closing"
  | "available"
  | "transfer_pending"
  | "transferred";

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
  /** Platform banking partner label — always Pathward for client-facing branding. */
  bankName: string;
  /** Actual linked account bank for wire/deposit instructions only. */
  wireBankName: string;
  accountHolder: string;
  routingNumber: string;
  accountNumberLast4: string;
  requiredDeposit: number;
  currentBalance: number;
  remainingRequired: number;
  fundingPercent: number;
  fundingStatus: FundingStatusLabel;
  fundingStatusDisplay: string;
  fundingActionLabel: string;
  depositLabel: string;
  showDepositUI: boolean;
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
  breakdown: FundingBreakdownItem[];
  fundingPhase: FundingPhase;
  requestLabel: string;
  showFundingSection: boolean;
};

export type FundingBreakdownItem = {
  id: string;
  label: string;
  amount: number;
  isDefault: boolean;
};

export type FundingPhase =
  | "down_payment"
  | "escrow_pending"
  | "admin_requested"
  | "complete";

export type FundingRequirementFee = {
  id: string;
  label: string;
  amount: number;
  addedAt: string;
  addedBy: string;
};

export type SellerDestinationDetails = {
  accountName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  notes?: string;
};

export type EscrowTransferMeta = {
  status: "pending" | "approved" | "rejected";
  amount: number;
  pathwardBalanceAtTransfer?: number;
  initiatedAt: string;
  withdrawalRequestId: string;
  sellerDestination?: SellerDestinationDetails;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedReason?: string;
};

export type ClosingFundsMeta = {
  mortgageCreditedToPathward?: number;
  escrowTransfer?: EscrowTransferMeta;
};

export type ClosingFundsView = {
  /** Full property purchase price — total amount required at closing. */
  totalClosingAmount: number;
  /** Mirrors Funding Account current balance toward closing. */
  availableBalance: number;
  /** Amount still owed toward closing: uncredited mortgage plus undeposited client payments. */
  pendingBalance: number;
  status: ClosingFundsStatus;
  statusLabel: string;
  actionLabel: string;
  mortgageApproved: boolean;
  downPaymentVerified: boolean;
  canTransferToEscrow: boolean;
  escrowTransfer?: EscrowTransferMeta | null;
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
  baseDownPaymentAmount?: number;
  verifiedDownPaymentAmount?: number;
  fundingPhase?: FundingPhase;
  activeRequest?: FundingRequirementFee | null;
  requestLabel?: string;
  /** @deprecated Use activeRequest instead */
  additionalFees?: FundingRequirementFee[];
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
