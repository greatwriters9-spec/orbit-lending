export const REPAYMENT_GRACE_PERIOD_DAYS = 3;
export const REPAYMENT_OVERDUE_THRESHOLD_DAYS = 7;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  ach_transfer: "ACH Transfer",
  wire_transfer: "Wire Transfer",
  wallet_balance: "Account Balance",
};

export const REPAYMENT_STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  due_today: "Due Today",
  pending_verification: "Pending Verification",
  paid: "Paid",
  rejected: "Rejected",
  late: "Late",
  overdue: "Overdue",
  waived: "Waived",
};

export const LOAN_HEALTH_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  warning: "Warning",
  critical: "Critical",
};

export const REMINDER_TYPES = [
  "7_days_before",
  "3_days_before",
  "due_today",
  "1_day_late",
  "7_days_late",
] as const;

export type ReminderType = (typeof REMINDER_TYPES)[number];
