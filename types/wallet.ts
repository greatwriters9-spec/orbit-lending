export type WalletTransactionType =
  | "loan_funding"
  | "withdrawal_request"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "repayment_received"
  | "manual_adjustment"
  | "fee_adjustment"
  | "system_credit"
  | "system_debit";

export type WalletTransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export type WithdrawalMethod =
  | "bank_transfer"
  | "debit_card"
  | "credit_card"
  | "crypto"
  | "other";

export type WithdrawalRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export type NotificationType =
  | "loan_funded"
  | "withdrawal_requested"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "funding_failed"
  | "manual_adjustment"
  | "wallet_credit"
  | "wallet_debit"
  | "application_update"
  | "general";

export type Wallet = {
  id: string;
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  reservedBalance: number;
  totalFunded: number;
  totalWithdrawn: number;
  totalRepaid: number;
  currentLoanExposure: number;
  createdAt: string;
  updatedAt: string;
};

export type WalletTransaction = {
  id: string;
  walletId: string;
  transactionType: WalletTransactionType;
  amount: number;
  status: WalletTransactionStatus;
  description: string;
  referenceNumber: string;
  applicationId?: string;
  withdrawalRequestId?: string;
  createdBy?: string;
  createdAt: string;
};

export type WithdrawalRequest = {
  id: string;
  walletId: string;
  userId: string;
  amount: number;
  withdrawalMethod: WithdrawalMethod;
  destinationDetails: Record<string, string>;
  notes?: string;
  status: WithdrawalRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  applicantName?: string;
};

export type WalletDashboardData = {
  wallet: Wallet;
  linkedAccount: PathwardLinkedAccount | null;
  recentTransactions: WalletTransaction[];
  withdrawalRequests: WithdrawalRequest[];
  fundingHistory: WalletTransaction[];
};

export type PathwardLinkedAccount = {
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
  accountNumberLast4: string;
  accountBalance: number;
  linkedAt: string | null;
  withdrawableApprovedAt: string | null;
  /** Wire/deposit destination only — not used for platform partner branding. */
  fundingBankName: string;
};

export const DEFAULT_FUNDING_BANK_NAME = "Pathward National Bank";

export function getFundingBankName(name?: string | null): string {
  const trimmed = name?.trim();
  return trimmed || DEFAULT_FUNDING_BANK_NAME;
}

export type FundingQueueItem = {
  id: string;
  applicationNumber: string;
  applicantName: string;
  applicantId: string;
  productName: string;
  approvedAmount: number;
  approvalDate?: string;
  assignedOfficer?: string;
};

export type WalletActionState = {
  error?: string;
  success?: string;
};

export const WITHDRAWAL_METHOD_LABELS: Record<WithdrawalMethod, string> = {
  bank_transfer: "Bank Transfer",
  debit_card: "Debit Card",
  credit_card: "Credit Card",
  crypto: "Cryptocurrency",
  other: "Other",
};

export const TRANSACTION_TYPE_LABELS: Record<WalletTransactionType, string> = {
  loan_funding: "Loan Funding",
  withdrawal_request: "Withdrawal Request",
  withdrawal_approved: "Withdrawal Approved",
  withdrawal_rejected: "Withdrawal Rejected",
  repayment_received: "Repayment Received",
  manual_adjustment: "Balance adjustment",
  fee_adjustment: "Fee adjustment",
  system_credit: "Account credit",
  system_debit: "Account debit",
};

export const PATHWARD_BANK = {
  name: "Pathward National Bank",
  tagline: "Banking services provided through Pathward National Bank",
  infrastructure: "Banking Partner",
} as const;
