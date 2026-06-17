"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import {
  approveWithdrawalAction,
  rejectWithdrawalAction,
} from "@/lib/wallet/actions";
import { Button } from "@/components/ui-kit/button";
import type { EscrowTransferMeta } from "@/types/mortgage-dashboard";

type EscrowTransferReviewPanelProps = {
  applicationId: string;
  escrowTransfer: EscrowTransferMeta;
};

export function EscrowTransferReviewPanel({
  applicationId,
  escrowTransfer,
}: EscrowTransferReviewPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (escrowTransfer.status !== "pending") {
    return (
      <section className="card-surface p-6">
        <h3 className="text-sm font-semibold text-brand-navy">Escrow Transfer</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {escrowTransfer.status === "approved"
            ? `Transfer of ${formatCurrency(escrowTransfer.amount)} approved on ${escrowTransfer.approvedAt ? formatApplicationDate(escrowTransfer.approvedAt) : "—"}.`
            : `Transfer rejected${escrowTransfer.rejectedReason ? `: ${escrowTransfer.rejectedReason}` : "."}`}
        </p>
      </section>
    );
  }

  function handleApprove() {
    startTransition(async () => {
      const result = await approveWithdrawalAction(
        escrowTransfer.withdrawalRequestId,
        "Escrow transfer to seller approved.",
      );
      setFeedback(result.success ?? result.error ?? null);
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectWithdrawalAction(
        escrowTransfer.withdrawalRequestId,
        rejectReason,
      );
      setFeedback(result.success ?? result.error ?? null);
      setShowReject(false);
      router.refresh();
    });
  }

  return (
    <section className="card-surface space-y-4 p-6">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">Escrow Transfer Review</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The client initiated a transfer to the seller. Funding and closing balances
          are $0.00 while this transfer is pending your approval.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoRow label="Transfer Amount" value={formatCurrency(escrowTransfer.amount)} />
        <InfoRow
          label="Initiated"
          value={formatApplicationDate(escrowTransfer.initiatedAt)}
        />
      </div>

      {escrowTransfer.sellerDestination ? (
        <div className="rounded-xl border border-brand-border bg-brand-background/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Seller Account Details
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <InfoRow
              label="Account Holder"
              value={escrowTransfer.sellerDestination.accountName}
            />
            <InfoRow label="Bank" value={escrowTransfer.sellerDestination.bankName} />
            <InfoRow
              label="Routing Number"
              value={escrowTransfer.sellerDestination.routingNumber}
            />
            <InfoRow
              label="Account Number"
              value={`••••${escrowTransfer.sellerDestination.accountNumber.slice(-4)}`}
            />
          </div>
          {escrowTransfer.sellerDestination.notes ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Note: {escrowTransfer.sellerDestination.notes}
            </p>
          ) : null}
        </div>
      ) : null}

      {feedback ? (
        <p className="rounded-lg border border-brand-border bg-brand-background px-3 py-2 text-sm text-brand-navy">
          {feedback}
        </p>
      ) : null}

      {!showReject ? (
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isPending}
            onClick={handleApprove}
            className="h-10 bg-brand-success text-white hover:bg-brand-success/90"
          >
            Approve Escrow Transfer
          </Button>
          <Button
            disabled={isPending}
            variant="outline"
            onClick={() => setShowReject(true)}
            className="h-10"
          >
            Reject Transfer
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason..."
            className="w-full rounded-lg border border-brand-border bg-brand-background px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <Button
              disabled={isPending || rejectReason.length < 3}
              onClick={handleReject}
              className="h-10 bg-red-600 text-white hover:bg-red-700"
            >
              Confirm Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReject(false)}
              className="h-10"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Application reference: {applicationId.slice(0, 8).toUpperCase()}
      </p>
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
