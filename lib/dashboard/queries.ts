import { APPLICATION_STATUS_LABELS, formatApplicationDate } from "@/lib/applications/status-utils";
import {
  fetchCriticalAlerts,
  fetchPriorityActions,
  fetchUserNotifications,
  mapNotificationToDashboard,
} from "@/lib/notifications/queries";
import { getLoanProductBySlug } from "@/lib/loans/mock-data";
import { formatCurrency } from "@/lib/loans/queries";
import { getOrCreateWallet } from "@/lib/wallet/ledger";
import { fetchPathwardLinkedAccount, isMortgageApprovedForWithdrawal } from "@/lib/wallet/pathward-account";
import { parseOnboardingMeta } from "@/lib/onboarding/parse-application";
import { fetchSupportSummary } from "@/lib/support/queries";
import { createClient } from "@/lib/supabase/server";
import {
  buildClosingFundsView,
  buildDownPaymentView,
  buildMortgageDetails,
  buildMortgageSummary,
  buildPathwardFundingView,
  formatPropertyAddress,
  isApplicationApprovedForFunding,
  parseDownPaymentMeta,
  resolveJourneyStage,
  resolveMortgageDashboardState,
  resolvePreQualificationFromApplication,
} from "@/lib/dashboard/mortgage-journey";
import { isClosingDownPaymentComplete, normalizeDownPaymentMeta } from "@/lib/dashboard/funding-requirements";
import { parseClosingFundsMeta, parseEscrowTransferMeta } from "@/lib/dashboard/closing-funds-meta";
import type { ApplicationStatus } from "@/types/application-details";
import type {
  DashboardNotification,
  DashboardTransaction,
  PortfolioSummary,
  ProgressStep,
} from "@/types/dashboard";
import type {
  DocumentCenterItem,
  MortgageActivityItem,
  MortgageDashboardView,
  MortgageMessageItem,
  NextActionView,
  PropertyDetailsView,
} from "@/types/mortgage-dashboard";
import type { ClientNotification, PriorityAction } from "@/types/notifications";
import type { SupportSummary } from "@/types/support";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";
import type { PathwardLinkedAccount } from "@/types/wallet";

export type ClientDashboardData = {
  mortgageView: MortgageDashboardView | null;
  activeMortgage: {
    value: string;
    description: string;
    trend?: string;
    trendTone?: "positive" | "neutral" | "warning";
    status?: ApplicationStatus;
    statusLabel: string;
    applicationNumber?: string;
    productName?: string;
  };
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
  linkedAccount: PathwardLinkedAccount | null;
  withdrawableBalance: number;
  mortgageApprovedForWithdrawal: boolean;
  withdrawableReleased: boolean;
  preQualification: PreQualificationResult | null;
  isPreQualified: boolean;
  homeFound: boolean | null;
  onboardingApplicationId?: string;
  targetLocation?: { city: string; state: string; zip: string };
  propertyAddress?: { street: string; city: string; state: string; zip: string };
  purchasePrice?: number;
};

const EMPTY_PROGRESS: ProgressStep[] = [
  { id: "submitted", label: "Submitted", status: "upcoming" },
  { id: "under-review", label: "Under Review", status: "upcoming" },
  { id: "pre-approved", label: "Pre-Approved", status: "upcoming" },
  { id: "approved", label: "Approved", status: "upcoming" },
  { id: "funded", label: "Funded", status: "upcoming" },
];

function mapTransactionStatus(status: string): DashboardTransaction["status"] {
  if (status === "completed" || status === "approved") return "success";
  if (status === "failed" || status === "rejected" || status === "cancelled") {
    return "danger";
  }
  return "pending";
}

export async function fetchClientDashboardData(
  userId: string,
): Promise<ClientDashboardData> {
  const supabase = await createClient();
  const wallet = await getOrCreateWallet(userId);
  const linkedAccount = await fetchPathwardLinkedAccount(userId);
  const mortgageApprovedForWithdrawal =
    await isMortgageApprovedForWithdrawal(userId);
  const withdrawableReleased = Boolean(
    linkedAccount?.withdrawableApprovedAt &&
      linkedAccount.withdrawableApprovedAt.length > 0,
  );

  const [transactionsRes, loanRes, applicationRes, priorityActions, criticalAlerts, supportSummary] =
    await Promise.all([
      supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("loans")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("loan_applications")
        .select("*")
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
  const personalInfo = latestApplication?.personal_info as
    | Record<string, unknown>
    | undefined;
  const onboardingMeta = parseOnboardingMeta(personalInfo);
  const escrowTransferEarly = parseEscrowTransferMeta(personalInfo);
  const rawDownPaymentMeta = parseDownPaymentMeta(personalInfo);
  const preQualification = latestApplication
    ? resolvePreQualificationFromApplication({
        personalInfo,
        requestedAmount: latestApplication.requested_amount,
        approvedAmount: latestApplication.approved_amount,
      })
    : null;
  const downPaymentMeta = normalizeDownPaymentMeta(
    rawDownPaymentMeta,
    preQualification?.estimatedDownPayment ?? 0,
    escrowTransferEarly,
  );

  const applicationStatus = latestApplication?.status as ApplicationStatus | undefined;
  const hasProperty = Boolean(onboardingMeta?.propertyAddress?.street);
  const downPaymentVerified = isClosingDownPaymentComplete(downPaymentMeta);
  const applicationApprovedForFunding = isApplicationApprovedForFunding(
    applicationStatus,
  );
  const mortgageApproved =
    applicationApprovedForFunding || mortgageApprovedForWithdrawal;

  const isPreQualified =
    !activeLoan &&
    applicationStatus === "pre_qualified" &&
    Boolean(preQualification);

  const isUnderReview =
    Boolean(applicationStatus) &&
    (applicationStatus === "submitted" ||
      applicationStatus === "under_review" ||
      applicationStatus === "information_required");

  const showPreQualEstimate =
    Boolean(preQualification) &&
    !applicationApprovedForFunding &&
    !isUnderReview &&
    (applicationStatus === "pre_qualified" || !latestApplication);

  const mortgageStatus = (activeLoan
    ? "active"
    : applicationStatus) as ApplicationStatus | undefined;
  const mortgageStatusLabel = mortgageStatus
    ? APPLICATION_STATUS_LABELS[mortgageStatus] ??
      mortgageStatus.replace(/_/g, " ")
    : "None";

  const activeMortgage = {
    value: activeLoan
      ? formatCurrency(Number(activeLoan.principal_amount))
      : applicationApprovedForFunding && latestApplication?.approved_amount
        ? formatCurrency(Number(latestApplication.approved_amount))
        : showPreQualEstimate && preQualification
          ? formatCurrency(preQualification.estimatedMortgageAmount)
          : "$0.00",
    description: activeLoan
      ? `Active mortgage · ${activeLoan.repayment_frequency}`
      : applicationApprovedForFunding
        ? "Approved mortgage amount"
        : isUnderReview
          ? "Mortgage application under review"
          : showPreQualEstimate && preQualification
            ? "Pre-qualified mortgage estimate"
            : "No active mortgage on your account",
    trend: activeLoan
      ? "Mortgage in repayment"
      : applicationApprovedForFunding
        ? "Approved"
        : isUnderReview
          ? "Under Review"
          : showPreQualEstimate && preQualification
            ? "Pre-qualified"
            : "Get pre-qualified to get started",
    trendTone:
      activeLoan || applicationApprovedForFunding || showPreQualEstimate
        ? ("positive" as const)
        : ("neutral" as const),
    status: mortgageStatus,
    statusLabel: mortgageStatusLabel,
    applicationNumber: latestApplication?.application_number ?? undefined,
    productName: latestApplication
      ? getLoanProductBySlug(latestApplication.loan_product_slug)?.name
      : undefined,
  };

  let portfolio: PortfolioSummary | null = null;
  if (activeLoan) {
    const principal = Number(activeLoan.principal_amount);
    const remaining = Number(activeLoan.remaining_balance);
    const paid = Number(activeLoan.total_paid_amount ?? Math.max(principal - remaining, 0));
    const paidPercent =
      Number(activeLoan.repayment_progress_percent ?? 0) ||
      (principal > 0 ? Math.round((paid / principal) * 100) : 0);

    const { count: paymentsMade } = await supabase
      .from("loan_repayments")
      .select("id", { count: "exact", head: true })
      .eq("loan_id", activeLoan.id)
      .eq("status", "paid");

    portfolio = {
      loanId:
        activeLoan.loan_number ??
        activeLoan.application_id.slice(0, 8).toUpperCase(),
      productName: "Active Mortgage",
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

  const mortgageView = preQualification
    ? await buildMortgageDashboardView({
        userId,
        preQualification,
        application: latestApplication,
        onboardingMeta,
        downPaymentMeta,
        linkedAccount,
        withdrawableBalance: wallet.availableBalance,
        withdrawableReleased,
        mortgageApproved,
        downPaymentVerified,
        hasProperty,
        portfolio,
        applicationStatus,
      })
    : null;

  const hero = activeLoan
    ? {
        standing: "Your mortgage is active and being serviced.",
        paymentReminder: `${formatCurrency(Number(activeLoan.remaining_balance))} remaining mortgage balance.`,
        nextAction: "View repayments",
        nextActionHref: "/dashboard/repayments",
        showLoanDetails: true,
      }
    : mortgageView
      ? {
          standing: mortgageView.summary.isEligibleAmount
            ? "You are eligible for up to"
            : "Your approved mortgage amount is",
          paymentReminder: formatCurrency(mortgageView.summary.approvedMortgageAmount),
          nextAction: mortgageView.nextAction.buttonLabel,
          nextActionHref: mortgageView.nextAction.buttonHref,
          showLoanDetails: true,
        }
      : {
          standing: "Welcome to Orbit Mortgage. Your account is ready.",
          paymentReminder: "Start your mortgage journey to see your buying power.",
          nextAction: "Get Pre-Qualified",
          nextActionHref: "/get-started",
          showLoanDetails: false,
        };

  return {
    mortgageView,
    activeMortgage,
    portfolio,
    progressSteps,
    transactions,
    notifications,
    criticalAlerts,
    priorityActions,
    loanStatus: {
      status: mortgageStatus,
      applicationNumber: latestApplication?.application_number ?? undefined,
      productName: latestApplication
        ? getLoanProductBySlug(latestApplication.loan_product_slug)?.name
        : undefined,
    },
    hero,
    hasWalletActivity: transactions.length > 0,
    supportSummary,
    linkedAccount,
    withdrawableBalance: wallet.availableBalance,
    mortgageApprovedForWithdrawal,
    withdrawableReleased,
    preQualification: preQualification ?? null,
    isPreQualified,
    homeFound: onboardingMeta?.homeFound ?? null,
    onboardingApplicationId: latestApplication?.id,
    targetLocation: onboardingMeta?.targetLocation,
    propertyAddress: onboardingMeta?.propertyAddress,
    purchasePrice: onboardingMeta?.purchasePrice,
  };
}

async function buildMortgageDashboardView(input: {
  userId: string;
  preQualification: PreQualificationResult;
  application: Record<string, unknown> | null;
  onboardingMeta: ReturnType<typeof parseOnboardingMeta>;
  downPaymentMeta: ReturnType<typeof parseDownPaymentMeta>;
  linkedAccount: PathwardLinkedAccount | null;
  withdrawableBalance: number;
  withdrawableReleased: boolean;
  mortgageApproved: boolean;
  downPaymentVerified: boolean;
  hasProperty: boolean;
  portfolio: PortfolioSummary | null;
  applicationStatus?: ApplicationStatus;
}): Promise<MortgageDashboardView> {
  const supabase = await createClient();
  const applicationId = input.application?.id as string | undefined;
  const purchasePrice =
    input.onboardingMeta?.purchasePrice ?? input.preQualification.maximumHomePrice;
  const applicationApprovedForFunding = isApplicationApprovedForFunding(
    input.applicationStatus,
  );
  const personalInfo = input.application?.personal_info as
    | Record<string, unknown>
    | undefined;
  const escrowTransfer = parseEscrowTransferMeta(personalInfo);

  const dashboardState = resolveMortgageDashboardState({
    hasActiveLoan: Boolean(input.portfolio),
    applicationStatus: input.applicationStatus,
    downPaymentVerified: input.downPaymentVerified,
    mortgageApproved: input.mortgageApproved,
    hasProperty: input.hasProperty,
    withdrawableReleased: input.withdrawableReleased,
  });

  const journeyStage = resolveJourneyStage({
    applicationStatus: input.applicationStatus,
    dashboardState,
    hasProperty: input.hasProperty,
    downPaymentVerified: input.downPaymentVerified,
  });

  const summary = buildMortgageSummary({
    preQual: input.preQualification,
    applicationStatus: input.applicationStatus,
    approvedAmount: Number(input.application?.approved_amount ?? 0) || undefined,
  });

  const details = buildMortgageDetails({
    preQual: input.preQualification,
    purchasePrice,
    propertyType: input.onboardingMeta?.propertyType,
    propertyUse: input.onboardingMeta?.propertyUse,
  });

  const closingMeta = parseClosingFundsMeta(personalInfo);
  const mortgageCredited = Number(closingMeta?.mortgageCreditedToPathward ?? 0);

  const downPayment = buildDownPaymentView({
    requiredAmount: summary.requiredDownPayment,
    pathwardBalance: input.linkedAccount?.accountBalance ?? 0,
    mortgageCredited,
    meta: input.downPaymentMeta,
    escrowTransfer,
    applicationApprovedForFunding,
  });

  const pathwardFunding = buildPathwardFundingView({
    linkedAccount: input.linkedAccount,
    requiredDeposit: downPayment.requiredAmount,
    downPaymentStatus: downPayment.status,
    applicationApprovedForFunding: applicationApprovedForFunding,
    downPaymentMeta: input.downPaymentMeta,
    escrowTransfer,
    purchasePrice,
    approvedMortgageAmount: summary.approvedMortgageAmount,
    mortgageApproved: input.mortgageApproved,
    mortgageCredited,
    applicationStatus: input.applicationStatus,
  });

  const closingFunds = buildClosingFundsView({
    purchasePrice,
    approvedMortgageAmount: input.mortgageApproved ? summary.approvedMortgageAmount : 0,
    pathwardBalance: input.linkedAccount?.accountBalance ?? 0,
    pathwardLinked: Boolean(input.linkedAccount),
    mortgageApproved: input.mortgageApproved,
    mortgageCredited,
    downPaymentVerified: input.downPaymentVerified,
    outstandingDepositAmount: applicationApprovedForFunding
      ? downPayment.remainingAmount
      : 0,
    applicationStatus: input.applicationStatus,
    escrowTransfer,
  });

  const nextAction = buildNextAction({
    dashboardState,
    applicationId,
    hasProperty: input.hasProperty,
    applicationStatus: input.applicationStatus,
    summary,
  });

  const [documents, activities, messages] = applicationId
    ? await Promise.all([
        fetchDocumentCenter(applicationId),
        fetchMortgageActivities(applicationId),
        fetchMortgageMessages(applicationId),
      ])
    : [[], [], []];

  const propertyDetails: PropertyDetailsView | null = input.hasProperty
    ? {
        address:
          formatPropertyAddress(input.onboardingMeta?.propertyAddress) ?? "—",
        purchasePrice,
        propertyType: details.propertyType,
        propertyUsage: details.propertyUsage,
        mortgageAmount: summary.approvedMortgageAmount,
      }
    : input.onboardingMeta?.targetLocation
      ? {
          address: `${input.onboardingMeta.targetLocation.city}, ${input.onboardingMeta.targetLocation.state}`,
          purchasePrice: input.preQualification.maximumHomePrice,
          propertyType: details.propertyType,
          propertyUsage: details.propertyUsage,
          mortgageAmount: summary.approvedMortgageAmount,
        }
      : null;

  return {
    state: dashboardState,
    journeyStage,
    applicationId,
    applicationNumber: input.application?.application_number as string | undefined,
    applicationStatus: input.applicationStatus,
    summary,
    details,
    pathwardFunding,
    downPayment,
    closingFunds,
    nextAction,
    documents,
    propertyDetails,
    activities,
    messages,
    portfolio: input.portfolio,
    linkedAccount: input.linkedAccount,
    propertyAddressLine: formatPropertyAddress(input.onboardingMeta?.propertyAddress),
  };
}

function buildNextAction(input: {
  dashboardState: MortgageDashboardView["state"];
  applicationId?: string;
  hasProperty: boolean;
  applicationStatus?: ApplicationStatus;
  summary: MortgageDashboardView["summary"];
}): NextActionView {
  const appHref = input.applicationId
    ? `/dashboard/loans/${input.applicationId}`
    : "/get-started";

  switch (input.dashboardState) {
    case "pre_qualified":
      return {
        title: "Continue Your Application",
        message: `You are eligible for up to ${formatCurrency(input.summary.approvedMortgageAmount)}. Complete your mortgage application to move toward approval and funding.`,
        buttonLabel: "Continue Application",
        buttonHref: appHref,
      };
    case "property_submitted":
      return {
        title: "Application In Progress",
        message:
          "Your mortgage application is being reviewed. We will notify you by email when there is an update.",
        buttonLabel: "View Application",
        buttonHref: appHref,
        checklist: [
          "Income Verification",
          "Asset Verification",
          "Property Review",
          "Appraisal",
          "Insurance Review",
        ],
      };
    case "approved":
      return {
        title: "Deposit Your Down Payment",
        message:
          "Your application is approved. Deposit your required down payment into your Funding Account. Orbit Mortgage will verify your deposit before closing funds are released.",
        buttonLabel: "View Deposit Instructions",
        buttonHref: "/dashboard#down-payment",
      };
    case "closing":
      return {
        title: "Transfer Closing Funds",
        message:
          "Your down payment is verified and closing funds are available. Transfer to the seller via escrow to complete your purchase.",
        buttonLabel: "Transfer to Seller via Escrow",
        buttonHref: "/dashboard#closing-funds",
      };
    case "active_mortgage":
      return {
        title: "Manage Your Mortgage",
        message: "Your mortgage is active. View payments, statements, and account activity.",
        buttonLabel: "View Repayments",
        buttonHref: "/dashboard/repayments",
      };
    default:
      return {
        title: "Start Your Mortgage Journey",
        message: "Get pre-qualified to see your buying power and next steps.",
        buttonLabel: "Get Pre-Qualified",
        buttonHref: "/get-started",
      };
  }
}

async function fetchDocumentCenter(
  applicationId: string,
): Promise<DocumentCenterItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("application_document_requests")
    .select("id, document_name, fulfilled, due_date")
    .eq("application_id", applicationId)
    .order("requested_at", { ascending: true });

  if (!data?.length) {
    return [];
  }

  return data.map((doc) => ({
    id: doc.id,
    name: doc.document_name,
    status: doc.fulfilled ? "approved" : "required",
  }));
}

async function fetchMortgageActivities(
  applicationId: string,
): Promise<MortgageActivityItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("application_status_history")
    .select("id, status, note, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []).map((entry) => ({
    id: entry.id,
    title: mapActivityTitle(entry.status, entry.note),
    date: formatApplicationDate(entry.created_at),
    description: entry.note ?? undefined,
  }));
}

function mapActivityTitle(status: string, note?: string | null): string {
  if (note?.toLowerCase().includes("down payment")) {
    if (note.toLowerCase().includes("verified")) return "Deposit Verified";
    if (note.toLowerCase().includes("submitted")) return "Deposit Received";
    return "Down Payment Update";
  }

  const map: Record<string, string> = {
    pre_qualified: "Pre-Qualification Issued",
    submitted: "Application Submitted",
    under_review: "Application Under Review",
    approved: "Approval Granted",
    funded: "Funding Released",
    active: "Mortgage Active",
  };

  return map[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchMortgageMessages(
  applicationId: string,
): Promise<MortgageMessageItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("application_messages")
    .select("id, sender_name, sender_role, message, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (data ?? []).map((msg) => ({
    id: msg.id,
    senderName: msg.sender_name,
    senderRole: msg.sender_role,
    message: msg.message,
    timestamp: formatApplicationDate(msg.created_at),
    category: mapMessageCategory(msg.sender_role),
  }));
}

function mapMessageCategory(
  role: string,
): MortgageMessageItem["category"] {
  if (role === "finance") return "underwriting";
  if (role === "officer") return "advisor";
  if (role === "system") return "system";
  return "support";
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
