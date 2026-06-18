import { parseEscrowTransferMeta } from "@/lib/dashboard/closing-funds-meta";
import {
  isClosingDownPaymentComplete,
  normalizeDownPaymentMeta,
  resolveBaseDownPaymentAmount,
  resolveVerifiedDownPaymentForClosing,
} from "@/lib/dashboard/funding-requirements";
import { parseDownPaymentMeta } from "@/lib/dashboard/mortgage-journey";
import { extractPreQualification } from "@/lib/onboarding/parse-application";
import type { DownPaymentMeta } from "@/types/mortgage-dashboard";

export type FundingAccountAudit = {
  userId: string;
  email: string;
  applicationId: string;
  applicationStatus: string;
  pathwardBalance: number;
  mortgageCredited: number;
  verifiedDownPayment: number;
  expectedPathwardBalance: number;
  purchasePrice: number;
  balanceDelta: number;
  downPaymentVerified: boolean;
  escrowApproved: boolean;
  needsBalanceRepair: boolean;
  needsMetaRepair: boolean;
  issues: string[];
};

export function computeExpectedPathwardBalance(input: {
  mortgageCredited: number;
  verifiedDownPayment: number;
  escrowApproved: boolean;
  currentBalance: number;
}): number {
  if (input.escrowApproved) {
    return input.currentBalance;
  }

  return Math.max(0, input.mortgageCredited + input.verifiedDownPayment);
}

export function auditFundingAccount(input: {
  userId: string;
  email: string;
  applicationId: string;
  applicationStatus: string;
  pathwardBalance: number;
  personalInfo: Record<string, unknown>;
  approvedAmount: number;
  purchasePrice: number;
  fallbackDownPayment: number;
}): FundingAccountAudit {
  const escrowTransfer = parseEscrowTransferMeta(input.personalInfo);
  const closingMeta = input.personalInfo.closingFunds as
    | { mortgageCreditedToPathward?: number }
    | undefined;
  const rawMeta = parseDownPaymentMeta(input.personalInfo);
  const normalizedMeta = normalizeDownPaymentMeta(
    rawMeta,
    input.fallbackDownPayment,
    escrowTransfer,
  );

  const mortgageCredited = Number(closingMeta?.mortgageCreditedToPathward ?? 0);
  const verifiedDownPayment = resolveVerifiedDownPaymentForClosing(
    normalizedMeta,
    input.fallbackDownPayment,
  );
  const escrowApproved = escrowTransfer?.status === "approved";
  const downPaymentVerified = isClosingDownPaymentComplete(normalizedMeta);
  const expectedPathwardBalance = computeExpectedPathwardBalance({
    mortgageCredited,
    verifiedDownPayment,
    escrowApproved,
    currentBalance: input.pathwardBalance,
  });

  const issues: string[] = [];
  const needsMetaRepair = Boolean(
    rawMeta &&
      JSON.stringify(rawMeta) !== JSON.stringify(normalizedMeta),
  );

  if (
    downPaymentVerified &&
    !escrowApproved &&
    verifiedDownPayment > 0 &&
    Math.abs(input.pathwardBalance - expectedPathwardBalance) > 0.009
  ) {
    issues.push(
      `Pathward balance ${input.pathwardBalance} should be ${expectedPathwardBalance} (mortgage ${mortgageCredited} + down payment ${verifiedDownPayment}).`,
    );
  }

  if (
    downPaymentVerified &&
    !escrowApproved &&
    purchasePriceMismatch(
      input.purchasePrice,
      mortgageCredited + verifiedDownPayment,
    )
  ) {
    issues.push(
      `Closing total ${mortgageCredited + verifiedDownPayment} does not match purchase price ${input.purchasePrice}.`,
    );
  }

  if (
    ["approved", "funded", "active"].includes(input.applicationStatus) &&
    mortgageCredited > 0 &&
    input.approvedAmount > 0 &&
    Math.abs(mortgageCredited - input.approvedAmount) > 0.009
  ) {
    issues.push(
      `Mortgage credited ${mortgageCredited} does not match approved amount ${input.approvedAmount}.`,
    );
  }

  const needsBalanceRepair =
    downPaymentVerified &&
    !escrowApproved &&
    verifiedDownPayment > 0 &&
    Math.abs(input.pathwardBalance - expectedPathwardBalance) > 0.009;

  return {
    userId: input.userId,
    email: input.email,
    applicationId: input.applicationId,
    applicationStatus: input.applicationStatus,
    pathwardBalance: input.pathwardBalance,
    mortgageCredited,
    verifiedDownPayment,
    expectedPathwardBalance,
    purchasePrice: input.purchasePrice,
    balanceDelta: expectedPathwardBalance - input.pathwardBalance,
    downPaymentVerified,
    escrowApproved,
    needsBalanceRepair,
    needsMetaRepair,
    issues,
  };
}

function purchasePriceMismatch(purchasePrice: number, closingTotal: number): boolean {
  if (purchasePrice <= 0) return false;
  return Math.abs(purchasePrice - closingTotal) > 0.009;
}

export function buildNormalizedDownPaymentMeta(
  personalInfo: Record<string, unknown>,
): DownPaymentMeta | null {
  const preQual = extractPreQualification(personalInfo);
  const fallbackDownPayment = preQual?.estimatedDownPayment ?? 0;
  const escrowTransfer = parseEscrowTransferMeta(personalInfo);
  return normalizeDownPaymentMeta(
    parseDownPaymentMeta(personalInfo),
    fallbackDownPayment,
    escrowTransfer,
  );
}
