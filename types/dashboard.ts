import type { LucideIcon } from "lucide-react";

export type LoanStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "active"
  | "completed"
  | "information-required";

export type ProgressStepStatus = "completed" | "current" | "upcoming";

export type ProgressStep = {
  id: string;
  label: string;
  status: ProgressStepStatus;
};

export type NotificationPriority = "default" | "warning" | "success";

export type TransactionType = "credit" | "debit";

export type DashboardStat = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendTone?: "positive" | "neutral" | "warning";
};

export type PaymentMethod = {
  bankName: string;
  accountLabel: string;
  accountType: string;
  accountLastFour: string;
  verified: boolean;
  autoPayEnabled: boolean;
};

export type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  priority?: NotificationPriority;
  unread?: boolean;
};

export type DashboardTransaction = {
  id: string;
  description: string;
  date: string;
  amount: string;
  type: TransactionType;
  status: LoanStatus;
  reference?: string;
  balance?: string;
};

export type PortfolioSummary = {
  loanId: string;
  productName: string;
  principal: string;
  outstanding: string;
  paidToDate: string;
  paidPercent: number;
  healthScore: number;
  healthLabel: string;
  apr: string;
  termMonths: number;
  paymentsMade: number;
  paymentsTotal: number;
};

export type DashboardHero = {
  greeting: string;
  userName?: string;
  standing: string;
  paymentReminder: string;
  nextAction: string;
};

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};
