import {
  ArrowUpRight,
  CreditCard,
  Wallet,
} from "lucide-react";

import { formatApplicationDate } from "@/lib/applications/status-utils";
import {
  fetchCriticalAlerts,
  fetchPriorityActions,
  fetchUserNotifications,
  mapNotificationToDashboard,
} from "@/lib/notifications/queries";
import { getLoanProductBySlug } from "@/lib/loans/mock-data";
import { formatCurrency } from "@/lib/loans/queries";
import { getOrCreateWallet } from "@/lib/wallet/ledger";
import { fetchSupportSummary } from "@/lib/support/queries";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/application-details";
import type {
  DashboardNotification,
  DashboardStat,
  DashboardTransaction,
  PortfolioSummary,
  ProgressStep,
} from "@/types/dashboard";
import type { ClientNotification, PriorityAction } from "@/types/notifications";
import type { SupportSummary } from "@/types/support";

export type ClientDashboardData = {
  stats: DashboardStat[];
  portfolio: PortfolioSummary | null;
  progressSteps: ProgressStep[];
  transactions: DashboardTransaction[];
  notifications: DashboardNotification[];
  criticalAlerts: ClientNotification[];
  priorityActions: PriorityAction[];
  loanStatus: {
    status?: ApplicationStatus;
    applicationNumber?: string;
    productName?: string;
  };
  hero: {
    standing: string;
    paymentReminder: string;
    nextAction: string;
    nextActionHref: string;
    showLoanDetails: boolean;
  };
  hasWalletActivity: boolean;
  supportSummary: SupportSummary;
};

const EMPTY_PROGRESS: ProgressStep[] = [
  { id: "submitted", label: "Submitted", status: "upcoming" },
  { id: "under-review", label: "Under Review", status: "upcoming" },
  { id: "pre-approved", label: "Pre-Approved", status: "upcoming" },
  { id: "approved", label: "Approved", status: "upcoming" },
  { id: "funded", label: "Funded", status: "upcoming" },
];

function mapTransactionStatus(
  status: string,
): DashboardTransaction["status"] {
  if (status === "completed") return "completed";
  if (status === "pending") return "pending";
  if (status === "approved") return "approved";
  return "pending";
}

export async function fetchClientDashboardData(
  userId: string,
): Promise<ClientDashboardData> {
  const supabase = await createClient();
  const wallet = await getOrCreateWallet(userId);

  const [transactionsRes, loanRes, applicationRes, priorityActions, criticalAlerts, supportSummary] =
    await Promise.all([
      supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("loans")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("loan_applications")
        .select("id, status, loan_product_slug, application_number")
        .eq("user_id", userId)
        .neq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      fetchPriorityActions(userId),
      fetchCriticalAlerts(userId),
      fetchSupportSummary(userId),
    ]);

  const transactions = (transactionsRes.data ?? []).map((tx) => ({
    id: tx.id,
    reference: tx.reference_number,
    description: tx.description,
    date: formatApplicationDate(tx.created_at),
    amount: formatCurrency(Number(tx.amount)),
    type: ["loan_funding", "repayment_received", "withdrawal_rejected"].includes(
      tx.transaction_type,
    )
      ? ("credit" as const)
      : ("debit" as const),
    status: mapTransactionStatus(tx.status),
  }));

  const notificationRows = await fetchUserNotifications(userId, { limit: 5 });
  const notifications = notificationRows.map(mapNotificationToDashboard);

  const activeLoan = loanRes.data;
  const latestApplication = applicationRes.data;

  const stats: DashboardStat[] = [
    {
      title: "Active Loan",
      value: activeLoan
        ? formatCurrency(Number(activeLoan.principal_amount))
        : "$0.00",
      description: activeLoan
        ? `Active loan · ${activeLoan.repayment_frequency}`
        : "No active loan on your account",
      icon: CreditCard,
      trend: activeLoan ? "Loan in repayment" : "Apply for a loan to get started",
      trendTone: activeLoan ? "positive" : "neutral",
    },
    {
      title: "Wallet Balance",
      value: formatCurrency(wallet.availableBalance),
      description: "Available for withdrawal",
      icon: Wallet,
      trend:
        wallet.availableBalance > 0
          ? `${formatCurrency(wallet.pendingBalance)} pending`
          : "No funds credited yet",
      trendTone: wallet.availableBalance > 0 ? "positive" : "neutral",
    },
    {
      title: "Loan Status",
      value: activeLoan ? "Active" : latestApplication?.status?.replace(/_/g, " ") ?? "None",
      description: activeLoan
        ? "Funded and in repayment"
        : latestApplication
          ? "Application in progress"
          : "No applications submitted",
      icon: ArrowUpRight,
      trend: activeLoan
        ? "Currently in active servicing"
        : "Browse loan products to apply",
      trendTone: "neutral",
    },
  ];

  let portfolio: PortfolioSummary | null = null;
  if (activeLoan) {
    const principal = Number(activeLoan.principal_amount);
    const remaining = Number(activeLoan.remaining_balance);
    const paid = Number(activeLoan.total_paid_amount ?? Math.max(principal - remaining, 0));
    const paidPercent = Number(activeLoan.repayment_progress_percent ?? 0) ||
      (principal > 0 ? Math.round((paid / principal) * 100) : 0);

    const { count: paymentsMade } = await supabase
      .from("loan_repayments")
      .select("id", { count: "exact", head: true })
      .eq("loan_id", activeLoan.id)
      .eq("status", "paid");

    portfolio = {
      loanId: activeLoan.loan_number ?? activeLoan.application_id.slice(0, 8).toUpperCase(),
      productName: "Active Loan",
      principal: formatCurrency(principal),
      outstanding: formatCurrency(remaining),
      paidToDate: formatCurrency(Math.max(paid, 0)),
      paidPercent,
      healthScore: Number(activeLoan.loan_health_score ?? 100),
      healthLabel:
        (activeLoan.loan_health_rating as PortfolioSummary["healthLabel"]) ?? "Good",
      apr: `${activeLoan.interest_rate}%`,
      termMonths: activeLoan.repayment_period,
      paymentsMade: paymentsMade ?? 0,
      paymentsTotal: activeLoan.repayment_period,
    };
  }

  const progressSteps = latestApplication
    ? buildProgressFromStatus(latestApplication.status)
    : EMPTY_PROGRESS;

  const hero = activeLoan
    ? {
        standing: "Your loan is active and being serviced.",
        paymentReminder: `${formatCurrency(Number(activeLoan.remaining_balance))} remaining balance.`,
        nextAction: "View repayments",
        nextActionHref: "/dashboard/repayments",
        showLoanDetails: true,
      }
    : latestApplication
      ? {
          standing: "Your application is being processed.",
          paymentReminder: `Status: ${latestApplication.status.replace(/_/g, " ")}`,
          nextAction: "View application",
          nextActionHref: `/dashboard/loans/${latestApplication.id}`,
          showLoanDetails: true,
        }
      : {
          standing: "Welcome to Orbit Lending. Your account is ready.",
          paymentReminder: "Browse loan products and submit your first application.",
          nextAction: "Browse loans",
          nextActionHref: "/loans",
          showLoanDetails: false,
        };

  return {
    stats,
    portfolio,
    progressSteps,
    transactions,
    notifications,
    criticalAlerts,
    priorityActions,
    loanStatus: {
      status: (activeLoan ? "active" : latestApplication?.status) as ApplicationStatus | undefined,
      applicationNumber: latestApplication?.application_number ?? undefined,
      productName: latestApplication
        ? getLoanProductBySlug(latestApplication.loan_product_slug)?.name
        : undefined,
    },
    hero,
    hasWalletActivity: transactions.length > 0,
    supportSummary,
  };
}

function buildProgressFromStatus(status: string): ProgressStep[] {
  const steps = [
    { id: "submitted", label: "Submitted", key: "submitted" },
    { id: "under-review", label: "Under Review", key: "under_review" },
    { id: "pre-approved", label: "Pre-Approved", key: "pre_approved" },
    { id: "approved", label: "Approved", key: "approved" },
    { id: "funded", label: "Funded", key: "funded" },
    { id: "active", label: "Active", key: "active" },
  ];

  const order = steps.map((s) => s.key);
  const currentIndex = order.indexOf(status);

  return steps.map((step, index) => ({
    id: step.id,
    label: step.label,
    status:
      currentIndex === -1
        ? "upcoming"
        : index < currentIndex
          ? "completed"
          : index === currentIndex
            ? "current"
            : "upcoming",
  }));
}
