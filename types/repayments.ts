export type LoanRepaymentStatus =
  | "upcoming"
  | "due_today"
  | "pending_verification"
  | "paid"
  | "rejected"
  | "late"
  | "overdue"
  | "waived";

export type RepaymentPaymentMethod =
  | "bank_transfer"
  | "ach_transfer"
  | "wire_transfer"
  | "wallet_balance";

export type PaymentSubmissionStatus = "pending" | "approved" | "rejected";

export type LoanHealthRating = "excellent" | "good" | "warning" | "critical";

export type RepaymentActivityAction =
  | "repayment_created"
  | "payment_submitted"
  | "payment_approved"
  | "payment_rejected"
  | "repayment_waived"
  | "due_date_extended"
  | "repayment_completed"
  | "loan_completed"
  | "status_overridden"
  | "manual_payment_applied";

export type LoanRepayment = {
  id: string;
  loan_id: string;
  borrower_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  installment_amount: number;
  remaining_balance_before: number;
  remaining_balance_after: number;
  status: LoanRepaymentStatus;
  created_at: string;
  updated_at: string;
};

export type PaymentSubmission = {
  id: string;
  repayment_id: string;
  borrower_id: string;
  payment_method: RepaymentPaymentMethod;
  amount: number;
  reference_number: string;
  proof_document_url: string | null;
  notes: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  status: PaymentSubmissionStatus;
  created_at: string;
  updated_at: string;
};

export type RepaymentActivityLog = {
  id: string;
  loan_id: string;
  repayment_id: string | null;
  actor_id: string | null;
  actor_role: string | null;
  action: RepaymentActivityAction;
  details: Record<string, unknown>;
  created_at: string;
};

export type LoanRepaymentSummary = {
  loanId: string;
  loanNumber: string;
  applicationId: string;
  outstandingBalance: number;
  totalPaid: number;
  nextPayment: LoanRepayment | null;
  remainingInstallments: number;
  repaymentProgressPercent: number;
  loanHealthRating: LoanHealthRating;
  loanHealthScore: number;
  schedule: LoanRepayment[];
  pendingSubmissions: PaymentSubmission[];
};

export type FinanceRepaymentQueueItem = {
  submission: PaymentSubmission;
  repayment: LoanRepayment;
  loanNumber: string;
  borrowerName: string;
  borrowerEmail: string;
  installmentNumber: number;
  dueDate: string;
};

export type RepaymentActionState = {
  error?: string;
  success?: string;
};
