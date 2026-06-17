"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui-kit/button";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import {
  approveWithdrawalAction,
  rejectWithdrawalAction,
} from "@/lib/wallet/actions";
import {
  WITHDRAWAL_METHOD_LABELS,
  type WithdrawalRequest,
} from "@/types/wallet";

type FinanceWithdrawalsTableProps = {
  requests: WithdrawalRequest[];
};

export function FinanceWithdrawalsTable({
  requests,
}: FinanceWithdrawalsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No pending withdrawal requests.
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-background/60">
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Applicant
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Method
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Destination
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Request Date
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {requests.map((request) => (
              <WithdrawalRow key={request.id} request={request} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WithdrawalRow({ request }: { request: WithdrawalRequest }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const destination = Object.entries(request.destinationDetails)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  function handleApprove() {
    startTransition(async () => {
      const result = await approveWithdrawalAction(request.id);
      setFeedback(result.success ?? result.error ?? null);
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectWithdrawalAction(request.id, rejectReason);
      setFeedback(result.success ?? result.error ?? null);
      setShowReject(false);
      router.refresh();
    });
  }

  return (
    <tr className="hover:bg-brand-background/40">
      <td className="px-6 py-4 font-medium text-brand-navy">
        {request.applicantName ?? "Client"}
      </td>
      <td className="px-6 py-4 font-semibold tabular-nums">
        {formatCurrency(request.amount)}
      </td>
      <td className="px-6 py-4 text-muted-foreground">
        {request.destinationDetails.transferType === "escrow_to_seller"
          ? "Escrow to Seller"
          : WITHDRAWAL_METHOD_LABELS[request.withdrawalMethod]}
      </td>
      <td className="max-w-[200px] truncate px-6 py-4 text-xs text-muted-foreground">
        {destination || "—"}
      </td>
      <td className="px-6 py-4 text-muted-foreground">
        {formatApplicationDate(request.createdAt)}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col items-end gap-2">
          {!showReject ? (
            <div className="flex gap-2">
              <Button
                disabled={isPending}
                onClick={handleApprove}
                className="h-8 bg-brand-success px-3 text-xs text-white hover:bg-brand-success/90"
              >
                Approve
              </Button>
              <Button
                disabled={isPending}
                onClick={() => setShowReject(true)}
                variant="outline"
                className="h-8 px-3 text-xs"
              >
                Reject
              </Button>
            </div>
          ) : (
            <div className="flex w-full max-w-xs flex-col gap-2">
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rejection reason..."
                className="h-8 rounded border border-brand-border px-2 text-xs"
              />
              <div className="flex gap-2">
                <Button
                  disabled={isPending || rejectReason.length < 3}
                  onClick={handleReject}
                  className="h-8 flex-1 bg-red-600 text-xs text-white hover:bg-red-700"
                >
                  Confirm Reject
                </Button>
                <Button
                  onClick={() => setShowReject(false)}
                  variant="outline"
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          {feedback ? (
            <span className="text-xs text-muted-foreground">{feedback}</span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
