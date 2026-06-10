"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  TransactionStatusBadge,
  TransactionTypeLabel,
} from "@/components/transactions/transaction-badges";
import { Button } from "@/components/ui-kit/button";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import type {
  PlatformTransaction,
  TransactionTimelineEvent,
} from "@/types/transactions";

type TransactionDetailsDrawerProps = {
  transaction: PlatformTransaction | null;
  open: boolean;
  onClose: () => void;
};

export function TransactionDetailsDrawer({
  transaction,
  open,
  onClose,
}: TransactionDetailsDrawerProps) {
  const [timeline, setTimeline] = useState<TransactionTimelineEvent[]>([]);

  useEffect(() => {
    if (!transaction || !open) {
      return;
    }

    void fetch(`/api/transactions/${transaction.id}/timeline`)
      .then((response) => response.json())
      .then((data: { timeline?: TransactionTimelineEvent[] }) => {
        setTimeline(data.timeline ?? []);
      })
      .catch(() => setTimeline([]));
  }, [transaction, open]);

  if (!open || !transaction) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Transaction Details
            </p>
            <h2 className="heading-tertiary mt-1 text-lg">
              {transaction.transactionNumber}
            </h2>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Date" value={formatApplicationDate(transaction.createdAt)} />
            <Detail
              label="Amount"
              value={`${transaction.direction === "credit" ? "+" : "−"}${formatCurrency(transaction.amount)}`}
            />
            <Detail label="Status" value={<TransactionStatusBadge status={transaction.status} />} />
            <Detail label="Type" value={<TransactionTypeLabel type={transaction.transactionType} />} />
            <Detail label="Reference" value={transaction.referenceNumber} />
            <Detail label="Loan" value={transaction.loanNumber ?? "—"} />
          </div>

          <Detail label="Description" value={transaction.description} />

          <section>
            <h3 className="text-sm font-semibold text-brand-navy">Activity Timeline</h3>
            <div className="mt-4 space-y-4">
              {timeline.length ? (
                timeline.map((event, index) => (
                  <div key={event.id} className="relative pl-6">
                    {index < timeline.length - 1 ? (
                      <span className="absolute top-5 left-[7px] h-full w-px bg-brand-border" />
                    ) : null}
                    <span className="absolute top-1.5 left-0 size-3.5 rounded-full border-2 border-brand-blue bg-white" />
                    <p className="text-sm font-medium text-brand-navy">{event.title}</p>
                    {event.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatApplicationDate(event.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No timeline events recorded.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm text-brand-navy">{value}</div>
    </div>
  );
}
