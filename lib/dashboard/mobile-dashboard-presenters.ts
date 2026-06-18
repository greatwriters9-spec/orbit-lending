import { formatCurrency } from "@/lib/loans/queries";
import type { MortgageDashboardView } from "@/types/mortgage-dashboard";

export const MOBILE_JOURNEY_STAGES = [
  "Pre-Qualified",
  "Property Search",
  "Underwriting",
  "Funding",
  "Closing",
] as const;

export const MOBILE_JOURNEY_SHORT_LABELS: Record<
  (typeof MOBILE_JOURNEY_STAGES)[number],
  string
> = {
  "Pre-Qualified": "Pre-Qual",
  "Property Search": "Property",
  Underwriting: "Underwrite",
  Funding: "Funding",
  Closing: "Closing",
};

export function mapToMobileDisplayStage(journeyStage: number): number {
  if (journeyStage >= 7) return 5;
  if (journeyStage >= 6) return 4;
  if (journeyStage >= 3) return 3;
  if (journeyStage >= 2) return 2;
  return 1;
}

export function resolveMobileJourneyCompletionPercent(view: MortgageDashboardView): number {
  const { closingFunds, journeyStage } = view;
  if (closingFunds.totalClosingAmount > 0) {
    return Math.min(
      100,
      Math.round(
        (closingFunds.availableBalance / closingFunds.totalClosingAmount) * 100,
      ),
    );
  }
  const displayStage = mapToMobileDisplayStage(journeyStage);
  return Math.round((displayStage / MOBILE_JOURNEY_STAGES.length) * 100);
}

export function resolveMobileCurrentStageLabel(journeyStage: number): string {
  return MOBILE_JOURNEY_STAGES[mapToMobileDisplayStage(journeyStage) - 1];
}

export function resolveMobileCurrentStatusLabel(view: MortgageDashboardView): string {
  if (view.closingFunds.statusLabel && view.closingFunds.statusLabel !== "N/A") {
    return view.closingFunds.statusLabel;
  }
  return view.pathwardFunding.fundingStatusDisplay || view.summary.statusLabel;
}

export type MobileActionTone = "blue" | "green" | "amber" | "red";

export type MobileActionPresentation = {
  title: string;
  subtitle?: string;
  remainingLabel?: string;
  remainingAmount?: string;
  buttonLabel?: string;
  tone: MobileActionTone;
  showButton: boolean;
  showSticky: boolean;
  kind: "deposit" | "additional" | "transfer" | "pending" | "complete" | "info";
};

export function resolveMobileActionPresentation(
  view: MortgageDashboardView,
): MobileActionPresentation {
  const funds = view.closingFunds;
  const funding = view.pathwardFunding;
  const dp = view.downPayment;

  if (funds.status === "transfer_pending") {
    return {
      kind: "pending",
      title: "Transfer Request Submitted",
      subtitle: "Awaiting Orbit Approval",
      tone: "blue",
      showButton: false,
      showSticky: false,
    };
  }

  if (funds.status === "transferred") {
    return {
      kind: "complete",
      title: "Transfer Approved",
      subtitle: "Processing",
      tone: "green",
      showButton: false,
      showSticky: false,
    };
  }

  if (funds.canTransferToEscrow) {
    return {
      kind: "transfer",
      title: "Ready For Transfer",
      subtitle: "Your closing funds are fully funded",
      buttonLabel: "Transfer To Seller Via Escrow",
      tone: "green",
      showButton: true,
      showSticky: true,
    };
  }

  if (dp.fundingPhase === "admin_requested" && dp.remainingAmount > 0) {
    return {
      kind: "additional",
      title: "Additional Funding Required",
      remainingLabel: "Remaining",
      remainingAmount: formatCurrency(dp.remainingAmount),
      buttonLabel: "Deposit Additional Funds",
      tone: "amber",
      showButton: true,
      showSticky: true,
    };
  }

  const canDeposit =
    funding.showFundingActions &&
    funding.showDepositUI &&
    dp.status !== "pending_verification" &&
    !(dp.status === "verified" && dp.fundingPhase === "down_payment");

  if (canDeposit && dp.remainingAmount > 0) {
    return {
      kind: "deposit",
      title: "Required Down Payment",
      remainingLabel: "Remaining",
      remainingAmount: formatCurrency(dp.remainingAmount),
      buttonLabel: "Deposit Funds",
      tone: "amber",
      showButton: true,
      showSticky: true,
    };
  }

  if (dp.status === "pending_verification") {
    return {
      kind: "pending",
      title: "Deposit Submitted",
      subtitle: "Awaiting Orbit verification",
      tone: "blue",
      showButton: false,
      showSticky: false,
    };
  }

  const statusLabel = view.summary.statusLabel.toLowerCase();
  if (statusLabel.includes("declined") || statusLabel.includes("rejected")) {
    return {
      kind: "info",
      title: view.summary.statusLabel,
      subtitle: view.nextAction.message,
      tone: "red",
      showButton: Boolean(view.nextAction.buttonHref),
      showSticky: false,
      buttonLabel: view.nextAction.buttonLabel,
    };
  }

  return {
    kind: "info",
    title: view.nextAction.title,
    subtitle: view.nextAction.message,
    buttonLabel: view.nextAction.buttonLabel,
    tone: "blue",
    showButton: Boolean(view.nextAction.buttonHref),
    showSticky: false,
  };
}

export function resolveMobileFundingPercent(view: MortgageDashboardView): number {
  const { totalClosingAmount, availableBalance } = view.closingFunds;
  if (totalClosingAmount > 0) {
    return Math.min(
      100,
      Math.round((availableBalance / totalClosingAmount) * 100),
    );
  }
  return view.pathwardFunding.fundingPercent;
}

export function resolveMobileClosingFundedPercent(view: MortgageDashboardView): number {
  const { totalClosingAmount, availableBalance } = view.closingFunds;
  if (totalClosingAmount <= 0) return 0;
  return Math.min(100, Math.round((availableBalance / totalClosingAmount) * 100));
}
