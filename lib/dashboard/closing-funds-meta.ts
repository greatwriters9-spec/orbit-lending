import type { ClosingFundsMeta, EscrowTransferMeta } from "@/types/mortgage-dashboard";

export function parseClosingFundsMeta(
  personalInfo: Record<string, unknown> | null | undefined,
): ClosingFundsMeta | null {
  if (!personalInfo?.closingFunds || typeof personalInfo.closingFunds !== "object") {
    return null;
  }
  return personalInfo.closingFunds as ClosingFundsMeta;
}

export function parseEscrowTransferMeta(
  personalInfo: Record<string, unknown> | null | undefined,
): EscrowTransferMeta | null {
  return parseClosingFundsMeta(personalInfo)?.escrowTransfer ?? null;
}

export function isEscrowTransferActive(
  transfer: EscrowTransferMeta | null | undefined,
): boolean {
  return transfer?.status === "pending" || transfer?.status === "approved";
}

export function isEscrowTransferPending(
  transfer: EscrowTransferMeta | null | undefined,
): boolean {
  return transfer?.status === "pending";
}
