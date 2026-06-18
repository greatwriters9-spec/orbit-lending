import { computePreQualification } from "@/lib/onboarding/pre-qualification";
import { extractPreQualification, parseOnboardingMeta } from "@/lib/onboarding/parse-application";
import {
  buildCurrentFundingBreakdown,
  resolveCurrentRequiredAmount,
  resolveCurrentRequestLabel,
  resolveFundingPhase,
  resolveFundingStatusDisplay,
  shouldShowDepositUI,
  shouldShowFundingSection,
  resolveVerifiedDownPaymentForClosing,
} from "@/lib/dashboard/funding-requirements";
import {
  resolveMortgageCardStatusLabel,
  resolveMortgageFundingWorkflow,
} from "@/lib/dashboard/mortgage-funding-workflow";
import { parseEscrowTransferMeta } from "@/lib/dashboard/closing-funds-meta";
import type { ApplicationStatus } from "@/types/application-details";
import type {
  ClosingFundsView,
  DownPaymentMeta,
  DownPaymentStatus,
  DownPaymentView,
  FundingPhase,
  FundingStatusLabel,
  MortgageDashboardState,
  MortgageDetailsView,
  MortgageSummaryView,
  PathwardFundingView,
} from "@/types/mortgage-dashboard";
import type { PreQualificationResult, PropertyUse } from "@/types/mortgage-onboarding";
import type { PathwardLinkedAccount } from "@/types/wallet";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family Home",
  condo: "Condo",
  townhouse: "Townhouse",
  multi_family: "Multi-Family",
};

const PROPERTY_USE_LABELS: Record<string, string> = {
  primary_residence: "Primary Residence",
  vacation_home: "Vacation Home",
  investment_property: "Investment Property",
};

const UNDERWRITING_STATUSES = new Set<ApplicationStatus>([
  "submitted",
  "under_review",
  "information_required",
]);

const CONDITIONAL_STATUSES = new Set<ApplicationStatus>([
  "pre_approved",
  "pending_finance_approval",
  "offer_sent",
  "offer_accepted",
  "offer_declined",
]);

/** Application accepted by admin — client enters funding / down payment phase */
export const FUNDING_PHASE_STATUSES = new Set<ApplicationStatus>([
  "approved",
  "funded",
]);

/** Mortgage eligible for closing disbursement after down payment verified */
export const CLOSING_READY_STATUSES = new Set<ApplicationStatus>([
  "approved",
  "funded",
  "active",
  "completed",
]);

export function parseDownPaymentMeta(
  personalInfo: Record<string, unknown> | null | undefined,
): DownPaymentMeta | null {
  if (!personalInfo?.downPayment || typeof personalInfo.downPayment !== "object") {
    return null;
  }
  return personalInfo.downPayment as DownPaymentMeta;
}

export function resolveMortgageDashboardState(input: {
  hasActiveLoan: boolean;
  applicationStatus?: ApplicationStatus;
  downPaymentVerified: boolean;
  mortgageApproved: boolean;
  hasProperty: boolean;
  withdrawableReleased: boolean;
}): MortgageDashboardState {
  if (input.hasActiveLoan) {
    return "active_mortgage";
  }

  if (!input.applicationStatus || input.applicationStatus === "draft") {
    return "empty";
  }

  if (
    input.downPaymentVerified &&
    input.mortgageApproved &&
    input.withdrawableReleased &&
    CLOSING_READY_STATUSES.has(input.applicationStatus)
  ) {
    return "closing";
  }

  if (
    input.mortgageApproved &&
    FUNDING_PHASE_STATUSES.has(input.applicationStatus)
  ) {
    return "approved";
  }

  if (
    input.hasProperty &&
    (UNDERWRITING_STATUSES.has(input.applicationStatus) ||
      CONDITIONAL_STATUSES.has(input.applicationStatus))
  ) {
    return "property_submitted";
  }

  if (input.applicationStatus === "pre_qualified") {
    return "pre_qualified";
  }

  if (UNDERWRITING_STATUSES.has(input.applicationStatus)) {
    return "property_submitted";
  }

  if (CONDITIONAL_STATUSES.has(input.applicationStatus)) {
    return "property_submitted";
  }

  return "pre_qualified";
}

export function resolveJourneyStage(input: {
  applicationStatus?: ApplicationStatus;
  dashboardState: MortgageDashboardState;
  hasProperty: boolean;
  downPaymentVerified: boolean;
}): number {
  if (input.dashboardState === "active_mortgage") {
    return 8;
  }

  if (input.dashboardState === "closing") {
    return 7;
  }

  if (input.dashboardState === "approved") {
    return input.downPaymentVerified ? 7 : 6;
  }

  const status = input.applicationStatus;
  if (!status || status === "pre_qualified") {
    return input.hasProperty ? 3 : 1;
  }

  if (UNDERWRITING_STATUSES.has(status)) {
    return 4;
  }

  if (CONDITIONAL_STATUSES.has(status)) {
    return 5;
  }

  if (status === "approved") {
    return 6;
  }

  if (status === "funded") {
    return 7;
  }

  return 1;
}

export function buildMortgageSummary(input: {
  preQual: PreQualificationResult;
  applicationStatus?: ApplicationStatus;
  approvedAmount?: number;
}): MortgageSummaryView {
  const adminApprovedAmount =
    input.approvedAmount && input.approvedAmount > 0
      ? input.approvedAmount
      : undefined;
  const isEligibleAmount = !isApplicationApprovedForFunding(input.applicationStatus);
  const approvedMortgageAmount =
    adminApprovedAmount ?? input.preQual.estimatedMortgageAmount;

  return {
    approvedMortgageAmount,
    amountLabel: isEligibleAmount
      ? "Eligible Mortgage Amount"
      : "Approved Mortgage Amount",
    requiredDownPayment: input.preQual.estimatedDownPayment,
    estimatedMonthlyPayment: input.preQual.estimatedMonthlyPayment,
    maximumHomePrice: input.preQual.maximumHomePrice,
    statusLabel: resolveMortgageCardStatusLabel(input.applicationStatus),
    isEligibleAmount,
  };
}

export function buildMortgageDetails(input: {
  preQual: PreQualificationResult;
  purchasePrice?: number;
  propertyType?: string;
  propertyUse?: string;
}): MortgageDetailsView {
  const termYears = Math.round(input.preQual.loanTermMonths / 12);
  const purchasePrice = input.purchasePrice ?? input.preQual.maximumHomePrice;
  const ltv =
    purchasePrice > 0
      ? Math.round((input.preQual.estimatedMortgageAmount / purchasePrice) * 100)
      : 90;

  return {
    productName: `${termYears}-Year Fixed Mortgage`,
    interestRate: input.preQual.interestRate,
    termYears,
    termMonths: input.preQual.loanTermMonths,
    propertyUsage:
      PROPERTY_USE_LABELS[input.propertyUse ?? ""] ?? "Primary Residence",
    propertyType:
      PROPERTY_TYPE_LABELS[input.propertyType ?? ""] ?? "Single Family Home",
    loanToValue: ltv,
  };
}

export function buildPathwardFundingView(input: {
  linkedAccount: PathwardLinkedAccount | null;
  requiredDeposit: number;
  downPaymentStatus: DownPaymentStatus;
  applicationApprovedForFunding: boolean;
  downPaymentMeta: DownPaymentMeta | null;
  escrowTransfer?: ReturnType<typeof parseEscrowTransferMeta>;
  purchasePrice: number;
  mortgageApproved: boolean;
  mortgageCredited: number;
  applicationStatus?: ApplicationStatus;
}): PathwardFundingView {
  const rawBalance = input.linkedAccount?.accountBalance ?? 0;
  const phase = resolveFundingPhase(input.downPaymentMeta, input.escrowTransfer);
  const showDepositUI = shouldShowDepositUI(input.downPaymentMeta, input.escrowTransfer);
  const requestLabel = resolveCurrentRequestLabel(
    input.downPaymentMeta,
    input.escrowTransfer,
  );
  const depositLabel =
    phase === "admin_requested"
      ? requestLabel
      : "Required Down Payment";
  const linked = Boolean(input.linkedAccount);
  const setupPending = input.applicationApprovedForFunding && !linked;

  const workflow = resolveMortgageFundingWorkflow({
    applicationStatus: input.applicationStatus,
    purchasePrice: input.purchasePrice,
    pathwardBalance: rawBalance,
    pathwardLinked: linked,
    mortgageApproved: input.mortgageApproved,
    mortgageCredited: input.mortgageCredited,
    escrowTransfer: input.escrowTransfer,
  });

  const currentBalance = workflow.fundingAccountBalance;
  const effectiveRequired = showDepositUI ? input.requiredDeposit : 0;
  const remainingRequired = Math.max(0, effectiveRequired - currentBalance);

  const fundingStatus = mapFundingStatusLabel(
    input.downPaymentStatus,
    currentBalance,
    effectiveRequired,
    phase,
    workflow.fundingAccountStatus,
  );

  const depositStatusDisplay = resolveFundingStatusDisplay(
    input.downPaymentMeta,
    input.escrowTransfer,
  );

  return {
    bankName: "Pathward National Bank",
    accountHolder: input.linkedAccount?.accountHolderName ?? "Pending Setup",
    routingNumber: input.linkedAccount?.routingNumber ?? "—",
    accountNumberLast4: input.linkedAccount?.accountNumberLast4 ?? "—",
    requiredDeposit: effectiveRequired,
    currentBalance,
    remainingRequired,
    fundingPercent: workflow.fundingProgressPercent,
    fundingStatus,
    fundingStatusDisplay: showDepositUI ? depositStatusDisplay : workflow.fundingAccountStatus,
    fundingActionLabel: workflow.fundingActionLabel,
    depositLabel,
    showDepositUI,
    linked,
    setupPending,
    showFundingActions: linked && input.applicationApprovedForFunding,
  };
}

export function buildDownPaymentView(input: {
  requiredAmount: number;
  pathwardBalance: number;
  mortgageCredited?: number;
  meta: DownPaymentMeta | null;
  escrowTransfer?: ReturnType<typeof parseEscrowTransferMeta>;
}): DownPaymentView {
  const phase = resolveFundingPhase(input.meta, input.escrowTransfer);
  const showFundingSection = shouldShowFundingSection(input.meta, input.escrowTransfer);
  const showDepositUI = shouldShowDepositUI(input.meta, input.escrowTransfer);
  const currentRequired = resolveCurrentRequiredAmount(
    input.meta,
    input.requiredAmount,
    input.escrowTransfer,
  );
  const requestLabel = resolveCurrentRequestLabel(input.meta, input.escrowTransfer);
  const isVerified = input.meta?.status === "verified" && phase === "down_payment";
  const isAdminVerified =
    input.meta?.status === "verified" && phase !== "admin_requested";
  const verifiedDownPayment = resolveVerifiedDownPaymentForClosing(
    input.meta,
    input.requiredAmount,
  );
  const depositBalance = Math.max(
    0,
    input.pathwardBalance - (input.mortgageCredited ?? 0),
  );
  const amountReceived =
    phase === "escrow_pending"
      ? 0
      : input.meta?.status === "verified"
        ? verifiedDownPayment
        : Math.min(depositBalance, currentRequired);
  const remainingAmount = showDepositUI
    ? Math.max(0, currentRequired - amountReceived)
    : 0;
  const status = showDepositUI
    ? resolveDownPaymentStatus(input.meta, amountReceived, currentRequired)
    : (input.meta?.status ?? "verified");

  return {
    requiredAmount: currentRequired,
    amountReceived,
    remainingAmount,
    status,
    statusLabel: mapFundingStatusLabel(
      status,
      amountReceived,
      currentRequired,
      phase,
      resolveFundingStatusDisplay(input.meta, input.escrowTransfer),
    ),
    canSubmitDepositCompleted:
      showDepositUI &&
      status !== "pending_verification" &&
      !isVerified &&
      !isAdminVerified &&
      depositBalance > 0,
    breakdown: buildCurrentFundingBreakdown(
      input.meta,
      input.requiredAmount,
      input.escrowTransfer,
    ),
    fundingPhase: phase,
    requestLabel,
    showFundingSection,
  };
}

function resolveDownPaymentStatus(
  meta: DownPaymentMeta | null,
  received: number,
  required: number,
): DownPaymentStatus {
  if (meta?.status === "verified") return "verified";
  if (meta?.status === "pending_verification") return "pending_verification";
  if (meta?.status === "rejected") return "rejected";
  if (received <= 0) return "awaiting_deposit";
  if (received < required) return "partially_funded";
  return "fully_funded";
}

function mapFundingStatusLabel(
  status: DownPaymentStatus,
  received: number,
  required: number,
  phase?: FundingPhase,
  displayOverride?: string,
): FundingStatusLabel {
  if (phase === "escrow_pending") {
    return "Transfer Pending";
  }
  if (phase === "admin_requested" && displayOverride) {
    return "Amount Required";
  }
  if (status === "verified") return "Verified";
  if (status === "pending_verification") return "Pending";
  if (received <= 0) return "Awaiting Deposit";
  if (received < required) return "Partially Funded";
  return "Fully Funded";
}

export function buildClosingFundsView(input: {
  purchasePrice: number;
  pathwardBalance: number;
  pathwardLinked: boolean;
  mortgageApproved: boolean;
  mortgageCredited: number;
  downPaymentVerified: boolean;
  applicationStatus?: ApplicationStatus;
  escrowTransfer?: ReturnType<typeof parseEscrowTransferMeta>;
}): ClosingFundsView {
  const workflow = resolveMortgageFundingWorkflow({
    applicationStatus: input.applicationStatus,
    purchasePrice: input.purchasePrice,
    pathwardBalance: input.pathwardBalance,
    pathwardLinked: input.pathwardLinked,
    mortgageApproved: input.mortgageApproved,
    mortgageCredited: input.mortgageCredited,
    escrowTransfer: input.escrowTransfer,
  });

  return {
    totalClosingAmount: workflow.totalClosingAmount,
    availableBalance: workflow.availableBalance,
    pendingBalance: workflow.pendingBalance,
    status: workflow.closingFundsStatus,
    statusLabel: workflow.closingFundsStatusLabel,
    actionLabel: workflow.closingFundsActionLabel,
    mortgageApproved: input.mortgageApproved,
    downPaymentVerified: input.downPaymentVerified,
    canTransferToEscrow: workflow.canTransferToEscrow,
    escrowTransfer: input.escrowTransfer,
  };
}

export function isApplicationApprovedForFunding(
  status?: ApplicationStatus,
): boolean {
  if (!status) return false;
  return FUNDING_PHASE_STATUSES.has(status);
}

export function isMortgageApprovedStatus(status?: ApplicationStatus): boolean {
  if (!status) return false;
  return CLOSING_READY_STATUSES.has(status);
}

export function canLinkPathwardAccount(status?: ApplicationStatus): boolean {
  if (!status) return false;
  return CLOSING_READY_STATUSES.has(status);
}

export function formatDashboardStatusLabel(status?: ApplicationStatus): string {
  if (!status) return "Not Started";
  if (status === "pre_qualified") return "Eligible";
  if (status === "submitted") return "Submitted";
  if (UNDERWRITING_STATUSES.has(status)) return "Under Review";
  if (status === "offer_sent") return "Offer Pending";
  if (status === "offer_accepted") return "Offer Accepted";
  if (status === "pending_finance_approval") return "Pending Approval";
  if (status === "approved") return "Application Approved";
  if (status === "funded") return "Funds Deposited";
  if (status === "active") return "Active";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolvePreQualificationFromApplication(input: {
  personalInfo?: Record<string, unknown>;
  requestedAmount?: number | null;
  approvedAmount?: number | null;
}): PreQualificationResult | null {
  const stored = extractPreQualification(input.personalInfo);
  if (stored) {
    return stored;
  }

  const meta = parseOnboardingMeta(input.personalInfo);
  if (!meta) {
    return null;
  }

  return computePreQualification({
    homeFound: meta.homeFound,
    targetHomePrice: meta.targetLocation ? undefined : undefined,
    purchasePrice: meta.purchasePrice,
    propertyUse: meta.propertyUse as PropertyUse | undefined,
    employment: {
      employerName: "",
      employmentType: "full_time",
      position: "",
      yearsEmployed: "",
      annualIncome: Number(input.approvedAmount ?? input.requestedAmount ?? 0) * 0.15,
    },
  });
}

export function formatPropertyAddress(
  address?: { street: string; city: string; state: string; zip: string },
): string | undefined {
  if (!address?.street) return undefined;
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}
