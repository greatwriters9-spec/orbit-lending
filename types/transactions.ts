export type PlatformTransactionType =
  | "loan_disbursement"
  | "repayment_payment"
  | "wallet_credit"
  | "wallet_debit"
  | "withdrawal_request"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "refund"
  | "penalty_applied"
  | "penalty_reversed"
  | "credit_applied"
  | "adjustment"
  | "manual_correction"
  | "fee_charged"
  | "fee_waived"
  | "loan_closed"
  | "loan_write_off"
  | "administrative_action";

export type PlatformTransactionStatus =
  | "pending"
  | "processing"
  | "approved"
  | "completed"
  | "rejected"
  | "failed"
  | "reversed"
  | "cancelled";

export type PlatformTransactionCategory =
  | "disbursement"
  | "repayment"
  | "wallet"
  | "adjustment"
  | "fee"
  | "administrative"
  | "penalty"
  | "refund";

export type TransactionDirection = "credit" | "debit";

export type PlatformTransaction = {
  id: string;
  transactionNumber: string;
  borrowerId: string;
  loanId: string | null;
  repaymentId: string | null;
  walletTransactionId: string | null;
  createdBy: string | null;
  transactionType: PlatformTransactionType;
  category: PlatformTransactionCategory;
  amount: number;
  direction: TransactionDirection;
  previousBalance: number | null;
  newBalance: number | null;
  status: PlatformTransactionStatus;
  referenceNumber: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  loanNumber?: string | null;
};

export type TransactionTimelineEvent = {
  id: string;
  transactionId: string;
  eventType: string;
  title: string;
  description: string | null;
  actorId: string | null;
  createdAt: string;
};

export type TransactionFilters = {
  search?: string;
  types?: PlatformTransactionType[];
  statuses?: PlatformTransactionStatus[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  loanNumber?: string;
  referenceNumber?: string;
};

export type TransactionSummary = {
  totalTransactions: number;
  moneyReceived: number;
  moneyPaid: number;
  walletBalance: number;
  recentActivityCount: number;
};

export type TransactionActionState = {
  error?: string;
  success?: string;
};
