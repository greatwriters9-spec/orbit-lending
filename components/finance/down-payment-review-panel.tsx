"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reviewDownPaymentVerificationAction } from "@/lib/dashboard/down-payment-actions";
import { parseDownPaymentMeta } from "@/lib/dashboard/mortgage-journey";
import { formatCurrency } from "@/lib/loans/queries";
import { Button } from "@/components/ui-kit/button";
import type { DownPaymentMeta } from "@/types/mortgage-dashboard";

type DownPaymentReviewPanelProps = {
  applicationId: string;
  personalInfo: Record<string, unknown>;
  pathwardBalance?: number;
};

export function DownPaymentReviewPanel({
  applicationId,
  personalInfo,
  pathwardBalance = 0,
}: DownPaymentReviewPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const downPayment = parseDownPaymentMeta(personalInfo) as DownPaymentMeta | null;
  const status = downPayment?.status ?? "awaiting_deposit";
  const requiredAmount = downPayment?.requiredAmount ?? 0;

  const canReview = status === "pending_verification";

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

  return (
    <section className="card-surface p-6">
      <h3 className="text-sm font-semibold text-brand-navy">Down Payment Review</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Confirm the Pathward deposit, then verify. The verified down payment is credited
        to Pathward closing funds together with the mortgage amount.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoRow label="Pathward Balance" value={formatCurrency(pathwardBalance)} />
        <InfoRow label="Required Deposit" value={formatCurrency(requiredAmount)} />
        <InfoRow
          label="Verification Status"
          value={formatStatusLabel(status)}
        />
        <InfoRow
          label="Requested At"
          value={
            downPayment?.verificationRequestedAt
              ? new Date(downPayment.verificationRequestedAt).toLocaleString()
              : "—"
          }
        />
      </div>

      {feedback ? (
        <p className="mt-4 rounded-lg border border-brand-border bg-brand-background px-3 py-2 text-sm text-brand-navy">
          {feedback}
        </p>
      ) : null}

      {canReview ? (
        <div className="mt-4 space-y-3">
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
        <p className="mt-4 text-sm text-muted-foreground">
          {status === "verified"
            ? "Down payment verified. Release closing funds from the client profile when ready."
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
