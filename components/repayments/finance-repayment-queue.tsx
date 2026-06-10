"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";

import { RepaymentStatusBadge } from "@/components/repayments/repayment-status-badge";
import { Button } from "@/components/ui-kit/button";
import { PAYMENT_METHOD_LABELS } from "@/lib/repayments/constants";
import {
  approvePaymentAction,
  rejectPaymentAction,
} from "@/lib/repayments/actions";
import { formatRepaymentCurrency } from "@/lib/repayments/format";
import type { FinanceRepaymentQueueItem } from "@/types/repayments";

type FinanceRepaymentQueueProps = {
  items: FinanceRepaymentQueueItem[];
};

export function FinanceRepaymentQueue({ items }: FinanceRepaymentQueueProps) {
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleApprove = (submissionId: string) => {
    startTransition(async () => {
      const result = await approvePaymentAction(submissionId);
      setMessage(result.success ?? result.error);
      if (result.success) {
        window.location.reload();
      }
    });
  };

  const handleReject = (submissionId: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) {
      return;
    }

    startTransition(async () => {
      const result = await rejectPaymentAction(submissionId, reason);
      setMessage(result.success ?? result.error);
      if (result.success) {
        window.location.reload();
      }
    });
  };

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted-foreground">
          No pending payment submissions at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-lg border border-brand-border bg-brand-background px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      {items.map((item) => (
        <article
          key={item.submission.id}
          className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Pending Verification
              </p>
              <h3 className="heading-tertiary mt-2 text-lg">
                {item.borrowerName} · Loan {item.loanNumber}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.borrowerEmail}</p>
            </div>
            <RepaymentStatusBadge status={item.repayment.status} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Installment</p>
              <p className="mt-1 font-medium">#{item.installmentNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="mt-1 font-medium">
                {formatRepaymentCurrency(item.submission.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Method</p>
              <p className="mt-1 font-medium">
                {PAYMENT_METHOD_LABELS[item.submission.payment_method]}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reference</p>
              <p className="mt-1 font-medium">{item.submission.reference_number}</p>
            </div>
          </div>

          {item.submission.notes ? (
            <p className="mt-4 rounded-lg bg-brand-background px-4 py-3 text-sm text-muted-foreground">
              {item.submission.notes}
            </p>
          ) : null}

          {item.submission.proof_document_url ? (
            <a
              href={item.submission.proof_document_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-medium text-brand-blue hover:underline"
            >
              View proof of payment
            </a>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={isPending}
              className="bg-brand-success text-white hover:bg-brand-success/90"
              onClick={() => handleApprove(item.submission.id)}
            >
              <Check className="mr-2 size-4" />
              Approve
            </Button>
            <Button
              type="button"
              disabled={isPending}
              variant="outline"
              onClick={() => handleReject(item.submission.id)}
            >
              <X className="mr-2 size-4" />
              Reject
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
