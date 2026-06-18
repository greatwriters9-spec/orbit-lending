import type {
  DownPaymentMeta,
  FundingPhase,
  FundingRequirementFee,
} from "@/types/mortgage-dashboard";
import { isEscrowTransferPending } from "@/lib/dashboard/closing-funds-meta";
import type { EscrowTransferMeta } from "@/types/mortgage-dashboard";

export const DEFAULT_DOWN_PAYMENT_LABEL = "Down Payment";

export function createFeeId(): string {
  return `fee_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveBaseDownPaymentAmount(
  meta: DownPaymentMeta | null,
  fallbackAmount: number,
): number {
  if (meta?.verifiedDownPaymentAmount && meta.verifiedDownPaymentAmount > 0) {
    return meta.verifiedDownPaymentAmount;
  }
  if (meta?.baseDownPaymentAmount && meta.baseDownPaymentAmount > 0) {
    return meta.baseDownPaymentAmount;
  }
  if (meta?.requiredAmount && meta.requiredAmount > 0 && !meta.activeRequest) {
    return meta.requiredAmount;
  }
  return fallbackAmount;
}

export function resolveFundingPhase(
  meta: DownPaymentMeta | null,
  escrowTransfer?: EscrowTransferMeta | null,
): FundingPhase {
  if (meta?.fundingPhase) {
    return meta.fundingPhase;
  }
  if (isEscrowTransferPending(escrowTransfer)) {
    return "escrow_pending";
  }
  if (meta?.activeRequest) {
    return "admin_requested";
  }
  if (meta?.status === "verified") {
    return "down_payment";
  }
  return "down_payment";
}

/** Only the single amount the client must pay right now — never stacked bills. */
export function resolveCurrentRequiredAmount(
  meta: DownPaymentMeta | null,
  fallbackDownPayment: number,
  escrowTransfer?: EscrowTransferMeta | null,
): number {
  const phase = resolveFundingPhase(meta, escrowTransfer);

  if (phase === "escrow_pending" || phase === "complete") {
    return 0;
  }

  if (phase === "admin_requested" && meta?.activeRequest) {
    return meta.activeRequest.amount;
  }

  return resolveBaseDownPaymentAmount(meta, fallbackDownPayment);
}

export function resolveCurrentRequestLabel(
  meta: DownPaymentMeta | null,
  escrowTransfer?: EscrowTransferMeta | null,
): string {
  const phase = resolveFundingPhase(meta, escrowTransfer);

  if (phase === "admin_requested" && meta?.activeRequest) {
    return meta.activeRequest.label;
  }

  if (phase === "escrow_pending") {
    return "Escrow Transfer";
  }

  return meta?.requestLabel ?? DEFAULT_DOWN_PAYMENT_LABEL;
}

export function shouldShowDepositUI(
  meta: DownPaymentMeta | null,
  escrowTransfer?: EscrowTransferMeta | null,
): boolean {
  const phase = resolveFundingPhase(meta, escrowTransfer);
  return phase === "down_payment" || phase === "admin_requested";
}

export function shouldShowFundingSection(
  meta: DownPaymentMeta | null,
  escrowTransfer?: EscrowTransferMeta | null,
): boolean {
  return shouldShowDepositUI(meta, escrowTransfer);
}

export function resolveFundingStatusDisplay(
  meta: DownPaymentMeta | null,
  escrowTransfer?: EscrowTransferMeta | null,
): string {
  const phase = resolveFundingPhase(meta, escrowTransfer);

  if (phase === "escrow_pending") {
    return "Transfer Pending";
  }

  if (phase === "admin_requested") {
    const label = meta?.activeRequest?.label ?? "Additional Amount";
    return `${label} Required`;
  }

  if (meta?.status === "verified") {
    return "Verified";
  }

  if (meta?.status === "pending_verification") {
    return "Pending";
  }

  return "Awaiting Deposit";
}

export function buildCurrentFundingBreakdown(
  meta: DownPaymentMeta | null,
  fallbackDownPayment: number,
  escrowTransfer?: EscrowTransferMeta | null,
): Array<{ id: string; label: string; amount: number; isDefault: boolean }> {
  const phase = resolveFundingPhase(meta, escrowTransfer);

  if (phase === "escrow_pending" || phase === "complete") {
    return [];
  }

  if (phase === "admin_requested" && meta?.activeRequest) {
    return [
      {
        id: meta.activeRequest.id,
        label: meta.activeRequest.label,
        amount: meta.activeRequest.amount,
        isDefault: false,
      },
    ];
  }

  const amount = resolveBaseDownPaymentAmount(meta, fallbackDownPayment);
  return [
    {
      id: "down_payment",
      label: DEFAULT_DOWN_PAYMENT_LABEL,
      amount,
      isDefault: true,
    },
  ];
}

export function resolveVerifiedDownPaymentForClosing(
  meta: DownPaymentMeta | null,
  fallbackDownPayment: number,
): number {
  if (meta?.verifiedDownPaymentAmount && meta.verifiedDownPaymentAmount > 0) {
    return meta.verifiedDownPaymentAmount;
  }
  if (meta?.status === "verified") {
    return resolveBaseDownPaymentAmount(meta, fallbackDownPayment);
  }
  return 0;
}

/** Down payment counts as complete for closing even while admin fees are outstanding. */
export function isClosingDownPaymentComplete(meta: DownPaymentMeta | null): boolean {
  if (!meta) return false;
  if (meta.status === "verified") return true;
  if (meta.verifiedDownPaymentAmount && meta.verifiedDownPaymentAmount > 0) {
    return true;
  }
  if (
    meta.fundingPhase === "escrow_pending" ||
    meta.fundingPhase === "admin_requested"
  ) {
    return Boolean(meta.verifiedDownPaymentAmount);
  }
  return false;
}

/** Backfill legacy down-payment meta so old accounts follow the current workflow. */
export function normalizeDownPaymentMeta(
  meta: DownPaymentMeta | null,
  fallbackDownPayment: number,
  escrowTransfer?: EscrowTransferMeta | null,
): DownPaymentMeta | null {
  if (!meta) return null;

  const baseDownPaymentAmount = resolveBaseDownPaymentAmount(meta, fallbackDownPayment);
  const verifiedDownPaymentAmount =
    meta.verifiedDownPaymentAmount && meta.verifiedDownPaymentAmount > 0
      ? meta.verifiedDownPaymentAmount
      : meta.status === "verified"
        ? baseDownPaymentAmount
        : undefined;
  const fundingPhase = resolveFundingPhase(meta, escrowTransfer);
  const pathwardCreditApplied =
    meta.pathwardCreditApplied && meta.pathwardCreditApplied > 0
      ? meta.pathwardCreditApplied
      : meta.status === "verified" && verifiedDownPaymentAmount
        ? verifiedDownPaymentAmount
        : meta.pathwardCreditApplied;

  return {
    ...meta,
    baseDownPaymentAmount,
    verifiedDownPaymentAmount,
    fundingPhase,
    pathwardCreditApplied,
  };
}

export function buildAdminRequestedDepositMeta(input: {
  existing: DownPaymentMeta | null;
  fallbackDownPayment: number;
  label: string;
  amount: number;
  addedBy: string;
}): DownPaymentMeta {
  const base = resolveBaseDownPaymentAmount(input.existing, input.fallbackDownPayment);
  const verifiedAmount =
    input.existing?.verifiedDownPaymentAmount ??
    (input.existing?.status === "verified" ? base : undefined);

  const activeRequest: FundingRequirementFee = {
    id: createFeeId(),
    label: input.label.trim(),
    amount: Math.round(input.amount * 100) / 100,
    addedAt: new Date().toISOString(),
    addedBy: input.addedBy,
  };

  return {
    status: "awaiting_deposit",
    requiredAmount: activeRequest.amount,
    baseDownPaymentAmount: base,
    verifiedDownPaymentAmount: verifiedAmount,
    fundingPhase: "admin_requested",
    activeRequest,
    requestLabel: activeRequest.label,
    verificationRequestedAt: undefined,
    verifiedAt: undefined,
    verifiedBy: undefined,
    rejectedReason: undefined,
    pathwardCreditApplied: input.existing?.pathwardCreditApplied,
  };
}

export function buildEscrowPendingFundingMeta(
  existing: DownPaymentMeta | null,
  fallbackDownPayment: number,
): DownPaymentMeta {
  const base = resolveBaseDownPaymentAmount(existing, fallbackDownPayment);

  return {
    ...existing,
    status: existing?.status === "verified" ? "verified" : (existing?.status ?? "verified"),
    requiredAmount: 0,
    baseDownPaymentAmount: base,
    verifiedDownPaymentAmount: base,
    fundingPhase: "escrow_pending",
    activeRequest: undefined,
    requestLabel: undefined,
    verificationRequestedAt: existing?.verificationRequestedAt,
    verifiedAt: existing?.verifiedAt,
    verifiedBy: existing?.verifiedBy,
    pathwardCreditApplied: existing?.pathwardCreditApplied,
  };
}

export function buildPostAdminDepositVerifiedMeta(
  existing: DownPaymentMeta | null,
  fallbackDownPayment: number,
  creditedAmount: number,
): DownPaymentMeta {
  const base = resolveBaseDownPaymentAmount(existing, fallbackDownPayment);

  return {
    status: "verified",
    requiredAmount: 0,
    baseDownPaymentAmount: base,
    verifiedDownPaymentAmount: base,
    fundingPhase: "escrow_pending",
    activeRequest: undefined,
    requestLabel: undefined,
    verifiedAt: new Date().toISOString(),
    verifiedBy: existing?.verifiedBy,
    pathwardCreditApplied:
      Number(existing?.pathwardCreditApplied ?? 0) + creditedAmount,
  };
}

// Legacy helpers kept for compatibility during migration
export function resolveAdditionalFees(meta: DownPaymentMeta | null): FundingRequirementFee[] {
  return meta?.activeRequest ? [meta.activeRequest] : meta?.additionalFees ?? [];
}

export function computeTotalRequiredFunding(
  meta: DownPaymentMeta | null,
  fallbackDownPayment: number,
  escrowTransfer?: EscrowTransferMeta | null,
): number {
  return resolveCurrentRequiredAmount(meta, fallbackDownPayment, escrowTransfer);
}

export function buildFundingBreakdown(
  meta: DownPaymentMeta | null,
  fallbackDownPayment: number,
  escrowTransfer?: EscrowTransferMeta | null,
) {
  return buildCurrentFundingBreakdown(meta, fallbackDownPayment, escrowTransfer);
}
