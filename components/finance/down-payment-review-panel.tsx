"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addFundingRequirementFeeAction,
  removeFundingRequirementFeeAction,
  reviewDownPaymentVerificationAction,
} from "@/lib/dashboard/down-payment-actions";
import { parseEscrowTransferMeta } from "@/lib/dashboard/closing-funds-meta";
import {
  buildCurrentFundingBreakdown,
  resolveCurrentRequiredAmount,
} from "@/lib/dashboard/funding-requirements";
import { parseDownPaymentMeta } from "@/lib/dashboard/mortgage-journey";
import { formatCurrency } from "@/lib/loans/queries";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import type { DownPaymentMeta } from "@/types/mortgage-dashboard";

const FEE_PRESETS = [
  "Escrow Amount",
  "Escrow Fee",
  "Title Insurance",
  "HOA Transfer Fee",
  "Recording Fee",
  "Homeowners Insurance",
];

type DownPaymentReviewPanelProps = {
  applicationId: string;
  personalInfo: Record<string, unknown>;
  pathwardBalance?: number;
  fallbackDownPayment?: number;
};

export function DownPaymentReviewPanel({
  applicationId,
  personalInfo,
  pathwardBalance = 0,
  fallbackDownPayment = 0,
}: DownPaymentReviewPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feeLabel, setFeeLabel] = useState(FEE_PRESETS[0]);
  const [customFeeLabel, setCustomFeeLabel] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  const downPayment = parseDownPaymentMeta(personalInfo) as DownPaymentMeta | null;
  const escrowTransfer = parseEscrowTransferMeta(personalInfo);
  const status = downPayment?.status ?? "awaiting_deposit";
  const phase = downPayment?.fundingPhase ?? "down_payment";
  const breakdown = buildCurrentFundingBreakdown(
    downPayment,
    fallbackDownPayment,
    escrowTransfer,
  );
  const requiredAmount = resolveCurrentRequiredAmount(
    downPayment,
    fallbackDownPayment,
    escrowTransfer,
  );
  const activeRequest = downPayment?.activeRequest;
  const escrowPending = escrowTransfer?.status === "pending";
  const canReview = status === "pending_verification";
  const canRequestDeposit = escrowPending && phase !== "admin_requested";

  function runReview(decision: "approve" | "reject" | "request_proof") {
    startTransition(async () => {
      const result = await reviewDownPaymentVerificationAction({
        applicationId,
        decision,
        reason: reason.trim() || undefined,
      });
      setFeedback(result.error ?? result.success ?? null);
      router.refresh();
    });
  }

  function handleAddFee() {
    const label = feeLabel === "Custom" ? customFeeLabel.trim() : feeLabel;
    const amount = Number(feeAmount);

    startTransition(async () => {
      const result = await addFundingRequirementFeeAction({
        applicationId,
        label,
        amount,
      });
      setFeedback(result.error ?? result.success ?? null);
      if (!result.error) {
        setFeeAmount("");
        setCustomFeeLabel("");
      }
      router.refresh();
    });
  }

  function handleRemoveFee() {
    if (!activeRequest) return;
    startTransition(async () => {
      const result = await removeFundingRequirementFeeAction({
        applicationId,
        feeId: activeRequest.id,
      });
      setFeedback(result.error ?? result.success ?? null);
      router.refresh();
    });
  }

  return (
    <section className="card-surface space-y-6 p-6">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">Funding Requirements</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Only one deposit is shown to the client at a time. After escrow transfer is
          pending, you may request a single additional amount if more funds are needed.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoRow label="Pathward Balance" value={formatCurrency(pathwardBalance)} />
        <InfoRow
          label={phase === "admin_requested" ? "Amount Requested" : "Required Deposit"}
          value={formatCurrency(requiredAmount)}
        />
        <InfoRow label="Verification Status" value={formatStatusLabel(status)} />
        <InfoRow label="Funding Phase" value={formatStatusLabel(phase)} />
      </div>

      {breakdown.length > 0 ? (
        <div className="rounded-xl border border-brand-border bg-brand-background/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Active Client Request
          </p>
          <ul className="mt-3 space-y-2">
            {breakdown.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-brand-navy">{item.label}</span>
                <span className="font-semibold tabular-nums text-brand-navy">
                  {formatCurrency(item.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : escrowPending ? (
        <p className="rounded-xl border border-brand-border bg-brand-background/50 px-4 py-3 text-sm text-muted-foreground">
          Escrow transfer is pending. No deposit is required from the client unless you
          request an additional amount below.
        </p>
      ) : null}

      {canRequestDeposit ? (
        <div className="space-y-3 rounded-xl border border-dashed border-brand-border p-4">
          <p className="text-sm font-semibold text-brand-navy">Request Additional Deposit</p>
          <p className="text-xs text-muted-foreground">
            This replaces any prior request. The client will only see this single amount.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <select
              value={feeLabel}
              onChange={(e) => setFeeLabel(e.target.value)}
              className="h-10 rounded-lg border border-brand-border bg-transparent px-3 text-sm"
            >
              {FEE_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
              <option value="Custom">Custom</option>
            </select>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              placeholder="Amount (USD)"
              className="h-10"
            />
            <Button
              type="button"
              disabled={isPending || !feeAmount || Number(feeAmount) <= 0}
              onClick={handleAddFee}
              className="h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              Request Deposit
            </Button>
          </div>
          {feeLabel === "Custom" ? (
            <Input
              value={customFeeLabel}
              onChange={(e) => setCustomFeeLabel(e.target.value)}
              placeholder="Custom label"
              className="h-10"
            />
          ) : null}
        </div>
      ) : activeRequest ? (
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleRemoveFee}
          className="h-10"
        >
          Cancel Active Deposit Request
        </Button>
      ) : null}

      {feedback ? (
        <p className="rounded-lg border border-brand-border bg-brand-background px-3 py-2 text-sm text-brand-navy">
          {feedback}
        </p>
      ) : null}

      {canReview ? (
        <div className="space-y-3 border-t border-brand-border pt-4">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional note for the customer..."
            className="w-full rounded-lg border border-brand-border bg-brand-background px-3 py-2 text-sm"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <Button
              disabled={isPending}
              onClick={() => runReview("approve")}
              className="h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              Verify Deposit
            </Button>
            <Button
              disabled={isPending}
              variant="outline"
              onClick={() => runReview("request_proof")}
              className="h-10"
            >
              Request Proof
            </Button>
            <Button
              disabled={isPending}
              variant="outline"
              onClick={() => runReview("reject")}
              className="h-10 text-red-700 hover:text-red-700"
            >
              Reject
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {status === "verified" && phase === "down_payment"
            ? "Down payment verified. Release closing funds from the client profile when ready."
            : phase === "escrow_pending"
              ? "Escrow transfer pending. Request an additional deposit above if needed."
              : "Customer has not submitted a deposit for verification yet."}
        </p>
      )}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-background/50 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-brand-navy">{value}</p>
    </div>
  );
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
