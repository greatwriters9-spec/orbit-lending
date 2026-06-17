import type {
  PlatformTransactionCategory,
  PlatformTransactionStatus,
  PlatformTransactionType,
  TransactionDirection,
} from "@/types/transactions";

export const TRANSACTION_TYPE_LABELS: Record<PlatformTransactionType, string> = {
  loan_disbursement: "Mortgage Disbursement",
  repayment_payment: "Repayment Payment",
  wallet_credit: "Funding Account Credit",
  wallet_debit: "Funding Account Debit",
  withdrawal_request: "Withdrawal Request",
  withdrawal_approved: "Withdrawal Approved",
  withdrawal_rejected: "Withdrawal Rejected",
  refund: "Refund",
  penalty_applied: "Penalty Applied",
  penalty_reversed: "Penalty Reversed",
  credit_applied: "Credit Applied",
  adjustment: "Adjustment",
  manual_correction: "Manual Correction",
  fee_charged: "Fee Charged",
  fee_waived: "Fee Waived",
  loan_closed: "Mortgage Closed",
  loan_write_off: "Mortgage Write-Off",
  administrative_action: "Administrative Action",
};

export const TRANSACTION_STATUS_LABELS: Record<PlatformTransactionStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  failed: "Failed",
  reversed: "Reversed",
  cancelled: "Cancelled",
};

export const STATUS_BADGE_TONE: Record<
  PlatformTransactionStatus,
  "success" | "info" | "warning" | "danger" | "neutral"
> = {
  completed: "success",
  processing: "info",
  approved: "info",
  pending: "warning",
  failed: "danger",
  rejected: "danger",
  reversed: "neutral",
  cancelled: "neutral",
};

export function isCreditDirection(direction: TransactionDirection): boolean {
  return direction === "credit";
}

export function mapWalletTypeToPlatformType(
  walletType: string,
  isCredit?: boolean,
): PlatformTransactionType {
  switch (walletType) {
    case "loan_funding":
      return "loan_disbursement";
    case "repayment_received":
      return "repayment_payment";
    case "withdrawal_request":
      return "withdrawal_request";
    case "withdrawal_approved":
      return "withdrawal_approved";
    case "withdrawal_rejected":
      return "withdrawal_rejected";
    case "fee_adjustment":
      return "fee_charged";
    case "system_credit":
      return "wallet_credit";
    case "system_debit":
      return "wallet_debit";
    case "manual_adjustment":
      return isCredit ? "credit_applied" : "adjustment";
    default:
      return "administrative_action";
  }
}

export function mapWalletTypeToCategory(
  walletType: string,
): PlatformTransactionCategory {
  switch (walletType) {
    case "loan_funding":
      return "disbursement";
    case "repayment_received":
      return "repayment";
    case "withdrawal_request":
    case "withdrawal_approved":
    case "withdrawal_rejected":
    case "system_credit":
    case "system_debit":
      return "wallet";
    case "fee_adjustment":
      return "fee";
    case "manual_adjustment":
      return "adjustment";
    default:
      return "administrative";
  }
}

export function mapWalletStatusToPlatformStatus(
  status: string,
): PlatformTransactionStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
    default:
      return "processing";
  }
}
