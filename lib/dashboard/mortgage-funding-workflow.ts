import { isEscrowTransferPending } from "@/lib/dashboard/closing-funds-meta";
import type { ApplicationStatus } from "@/types/application-details";
import type {
  ClosingFundsStatus,
  EscrowTransferMeta,
} from "@/types/mortgage-dashboard";

const UNDERWRITING_STATUSES = new Set<ApplicationStatus>([
  "submitted",
  "under_review",
  "information_required",
]);

const DECLINED_STATUSES = new Set<ApplicationStatus>([
  "rejected",
  "offer_declined",
]);

const APPROVED_MORTGAGE_STATUSES = new Set<ApplicationStatus>([
  "approved",
  "funded",
  "active",
  "completed",
]);

export type MortgageFundingStage =
  | "application_submitted"
  | "application_approved"
  | "loan_funded"
  | "partially_funded"
  | "fully_funded"
  | "escrow_transfer_initiated"
  | "escrow_transfer_complete";

export type FundingAccountStatusLabel =
  | "Pending Setup"
  | "Awaiting Deposit"
  | "Active"
  | "Transferred";

export type ClosingFundsStatusLabel =
  | "N/A"
  | "Waiting Funding"
  | "Awaiting Down Payment"
  | "Partially Funded"
  | "Ready For Transfer"
  | "Transferred"
  | "Pending Approval";

export type MortgageFundingWorkflowInput = {
  applicationStatus?: ApplicationStatus;
  purchasePrice: number;
  approvedMortgageAmount: number;
  pathwardBalance: number;
  pathwardLinked: boolean;
  mortgageApproved: boolean;
  mortgageCredited: number;
  escrowTransfer?: EscrowTransferMeta | null;
  /** Client-side deposit still owed (down payment or admin-requested amount). */
  outstandingDepositAmount?: number;
};

/** Amount still needed in the funding account before closing (excludes escrow). */
export function resolveClosingPendingBalance(input: {
  escrowActive: boolean;
  approvedMortgageAmount: number;
  mortgageCredited: number;
  outstandingDepositAmount: number;
}): number {
  if (input.escrowActive) {
    return 0;
  }

  const outstandingMortgage = Math.max(
    0,
    input.approvedMortgageAmount - input.mortgageCredited,
  );

  return Math.max(0, input.outstandingDepositAmount + outstandingMortgage);
}

export type MortgageFundingWorkflow = {
  stage: MortgageFundingStage;
  totalClosingAmount: number;
  availableBalance: number;
  pendingBalance: number;
  fundingProgressPercent: number;
  fundingAccountStatus: FundingAccountStatusLabel;
  fundingAccountBalance: number;
  fundingActionLabel: string;
  closingFundsStatus: ClosingFundsStatus;
  closingFundsStatusLabel: ClosingFundsStatusLabel;
  closingFundsActionLabel: string;
  canTransferToEscrow: boolean;
  loanFunded: boolean;
};

export function isMortgageApprovedForWorkflow(
  applicationStatus?: ApplicationStatus,
  mortgageApproved?: boolean,
): boolean {
  if (mortgageApproved) return true;
  if (!applicationStatus) return false;
  return APPROVED_MORTGAGE_STATUSES.has(applicationStatus);
}

export function isLoanFundedForWorkflow(input: {
  applicationStatus?: ApplicationStatus;
  mortgageCredited: number;
  mortgageApproved: boolean;
  pathwardBalance: number;
}): boolean {
  if (input.mortgageCredited > 0) return true;
  if (
    input.applicationStatus === "funded" ||
    input.applicationStatus === "active" ||
    input.applicationStatus === "completed"
  ) {
    return true;
  }
  return false;
}

export function resolveMortgageCardStatusLabel(
  status?: ApplicationStatus,
): string {
  if (!status) return "Not Started";
  if (DECLINED_STATUSES.has(status)) return "Declined";
  if (APPROVED_MORTGAGE_STATUSES.has(status)) return "Approved";
  if (status === "pre_qualified") return "Eligible";
  if (UNDERWRITING_STATUSES.has(status) || status === "submitted") {
    return "Under Review";
  }
  if (status === "draft") return "Not Started";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveMortgageFundingWorkflow(
  input: MortgageFundingWorkflowInput,
): MortgageFundingWorkflow {
  const mortgageApproved = isMortgageApprovedForWorkflow(
    input.applicationStatus,
    input.mortgageApproved,
  );
  const escrowPending = isEscrowTransferPending(input.escrowTransfer);
  const escrowApproved = input.escrowTransfer?.status === "approved";
  const escrowActive = escrowPending || escrowApproved;

  const totalClosingAmount = mortgageApproved
    ? Math.max(0, input.purchasePrice)
    : 0;

  const effectiveApprovedMortgage = mortgageApproved
    ? Math.max(0, input.approvedMortgageAmount)
    : 0;
  const effectiveOutstandingDeposit = mortgageApproved
    ? Math.max(0, input.outstandingDepositAmount ?? 0)
    : 0;

  const fundingAccountBalance = escrowActive ? 0 : Math.max(0, input.pathwardBalance);
  const availableBalance = mortgageApproved ? fundingAccountBalance : 0;
  const outstandingDepositAmount = effectiveOutstandingDeposit;
  const pendingBalance = resolveClosingPendingBalance({
    escrowActive,
    approvedMortgageAmount: effectiveApprovedMortgage,
    mortgageCredited: input.mortgageCredited,
    outstandingDepositAmount,
  });

  const fundingProgressPercent =
    totalClosingAmount > 0
      ? Math.min(
          100,
          Math.round((availableBalance / totalClosingAmount) * 100),
        )
      : 0;

  const loanFunded = isLoanFundedForWorkflow({
    applicationStatus: input.applicationStatus,
    mortgageCredited: input.mortgageCredited,
    mortgageApproved,
    pathwardBalance: input.pathwardBalance,
  });

  const stage = resolveFundingStage({
    mortgageApproved,
    loanFunded,
    totalClosingAmount,
    availableBalance,
    escrowPending,
    escrowApproved,
    applicationStatus: input.applicationStatus,
  });

  const fundingAccountStatus = resolveFundingAccountStatus({
    pathwardLinked: input.pathwardLinked,
    mortgageApproved,
    loanFunded,
    fundingAccountBalance,
    escrowActive,
  });

  const { closingFundsStatus, closingFundsStatusLabel, closingFundsActionLabel } =
    resolveClosingFundsPresentation({
      mortgageApproved,
      loanFunded,
      mortgageCredited: input.mortgageCredited,
      totalClosingAmount,
      availableBalance,
      pendingBalance,
      escrowPending,
      escrowApproved,
    });

  const canTransferToEscrow =
    mortgageApproved &&
    totalClosingAmount > 0 &&
    availableBalance >= totalClosingAmount &&
    !escrowActive;

  const fundingActionLabel = resolveFundingActionLabel({
    pathwardLinked: input.pathwardLinked,
    mortgageApproved,
    fundingAccountStatus,
    escrowActive,
    pendingBalance,
    totalClosingAmount,
  });

  return {
    stage,
    totalClosingAmount,
    availableBalance,
    pendingBalance,
    fundingProgressPercent,
    fundingAccountStatus,
    fundingAccountBalance,
    fundingActionLabel,
    closingFundsStatus,
    closingFundsStatusLabel,
    closingFundsActionLabel,
    canTransferToEscrow,
    loanFunded,
  };
}

function resolveFundingStage(input: {
  mortgageApproved: boolean;
  loanFunded: boolean;
  totalClosingAmount: number;
  availableBalance: number;
  escrowPending: boolean;
  escrowApproved: boolean;
  applicationStatus?: ApplicationStatus;
}): MortgageFundingStage {
  if (input.escrowApproved) {
    return "escrow_transfer_complete";
  }
  if (input.escrowPending) {
    return "escrow_transfer_initiated";
  }
  if (
    input.mortgageApproved &&
    input.totalClosingAmount > 0 &&
    input.availableBalance >= input.totalClosingAmount
  ) {
    return "fully_funded";
  }
  if (input.mortgageApproved && input.availableBalance > 0) {
    return input.loanFunded ? "partially_funded" : "loan_funded";
  }
  if (input.mortgageApproved && input.loanFunded) {
    return "loan_funded";
  }
  if (input.mortgageApproved) {
    return "application_approved";
  }
  if (
    input.applicationStatus &&
    input.applicationStatus !== "draft" &&
    input.applicationStatus !== "pre_qualified"
  ) {
    return "application_submitted";
  }
  return "application_submitted";
}

function resolveFundingAccountStatus(input: {
  pathwardLinked: boolean;
  mortgageApproved: boolean;
  loanFunded: boolean;
  fundingAccountBalance: number;
  escrowActive: boolean;
}): FundingAccountStatusLabel {
  if (input.escrowActive) {
    return "Transferred";
  }
  if (!input.mortgageApproved || !input.pathwardLinked) {
    return "Pending Setup";
  }
  if (input.fundingAccountBalance > 0 || input.loanFunded) {
    return "Active";
  }
  return "Awaiting Deposit";
}

function resolveClosingFundsPresentation(input: {
  mortgageApproved: boolean;
  loanFunded: boolean;
  mortgageCredited: number;
  totalClosingAmount: number;
  availableBalance: number;
  pendingBalance: number;
  escrowPending: boolean;
  escrowApproved: boolean;
}): {
  closingFundsStatus: ClosingFundsStatus;
  closingFundsStatusLabel: ClosingFundsStatusLabel;
  closingFundsActionLabel: string;
} {
  if (!input.mortgageApproved) {
    return {
      closingFundsStatus: "locked",
      closingFundsStatusLabel: "N/A",
      closingFundsActionLabel: "N/A",
    };
  }

  if (input.escrowApproved) {
    return {
      closingFundsStatus: "transferred",
      closingFundsStatusLabel: "Transferred",
      closingFundsActionLabel: "Transfer Complete",
    };
  }

  if (input.escrowPending) {
    return {
      closingFundsStatus: "transfer_pending",
      closingFundsStatusLabel: "Pending Approval",
      closingFundsActionLabel: "Awaiting Approval",
    };
  }

  if (
    input.totalClosingAmount > 0 &&
    input.availableBalance >= input.totalClosingAmount
  ) {
    return {
      closingFundsStatus: "available",
      closingFundsStatusLabel: "Ready For Transfer",
      closingFundsActionLabel: "Transfer to Seller",
    };
  }

  if (input.loanFunded && input.pendingBalance > 0) {
    const awaitingDownPaymentOnly =
      input.mortgageCredited > 0 &&
      input.availableBalance <= input.mortgageCredited;

    return {
      closingFundsStatus: "ready_for_closing",
      closingFundsStatusLabel: awaitingDownPaymentOnly
        ? "Awaiting Down Payment"
        : "Partially Funded",
      closingFundsActionLabel: "Awaiting Down Payment",
    };
  }

  if (input.availableBalance > 0 && input.pendingBalance > 0) {
    return {
      closingFundsStatus: "ready_for_closing",
      closingFundsStatusLabel: "Partially Funded",
      closingFundsActionLabel: "Awaiting Down Payment",
    };
  }

  if (input.mortgageApproved && input.availableBalance === 0) {
    return {
      closingFundsStatus: "locked",
      closingFundsStatusLabel: "Waiting Funding",
      closingFundsActionLabel: "Awaiting Funding",
    };
  }

  return {
    closingFundsStatus: "locked",
    closingFundsStatusLabel: "Partially Funded",
    closingFundsActionLabel: "Awaiting Down Payment",
  };
}

function resolveFundingActionLabel(input: {
  pathwardLinked: boolean;
  mortgageApproved: boolean;
  fundingAccountStatus: FundingAccountStatusLabel;
  escrowActive: boolean;
  pendingBalance: number;
  totalClosingAmount: number;
}): string {
  if (input.escrowActive) {
    return "Transfer Complete";
  }
  if (!input.mortgageApproved) {
    return "Awaiting Mortgage Approval";
  }
  if (!input.pathwardLinked) {
    return "Account Setup";
  }
  if (input.fundingAccountStatus === "Awaiting Deposit") {
    return "Awaiting Deposit";
  }
  if (
    input.totalClosingAmount > 0 &&
    input.pendingBalance > 0 &&
    input.fundingAccountStatus === "Active"
  ) {
    return "Make Payment";
  }
  if (
    input.totalClosingAmount > 0 &&
    input.pendingBalance <= 0
  ) {
    return "Funding Complete";
  }
  return "Awaiting Funding";
}
