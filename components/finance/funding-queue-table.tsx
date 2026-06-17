"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui-kit/button";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import { fundLoanAction } from "@/lib/wallet/actions";
import type { FundingQueueItem } from "@/types/wallet";

type FundingQueueTableProps = {
  items: FundingQueueItem[];
};

export function FundingQueueTable({ items }: FundingQueueTableProps) {
  if (items.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No approved loans awaiting funding.
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-background/60">
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Application
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Applicant
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Approved Amount
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Approval Date
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {items.map((item) => (
              <FundingRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FundingRow({ item }: { item: FundingQueueItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFund() {
    setFeedback(null);
    setError(null);
    startTransition(async () => {
      const result = await fundLoanAction(item.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setFeedback(result.success ?? "Funded.");
      router.refresh();
    });
  }

  return (
    <tr className="hover:bg-brand-background/40">
      <td className="px-6 py-4 font-mono text-xs text-brand-navy">
        {item.applicationNumber}
      </td>
      <td className="px-6 py-4 font-medium text-brand-navy">
        {item.applicantName}
      </td>
      <td className="px-6 py-4 text-muted-foreground">{item.productName}</td>
      <td className="px-6 py-4 font-semibold tabular-nums text-brand-blue">
        {formatCurrency(item.approvedAmount)}
      </td>
      <td className="px-6 py-4 text-muted-foreground">
        {item.approvalDate
          ? formatApplicationDate(item.approvalDate)
          : "—"}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex flex-col items-end gap-1">
          <Button
            disabled={isPending}
            onClick={handleFund}
            className="h-9 bg-brand-success text-white hover:bg-brand-success/90"
          >
            {isPending ? "Funding..." : "Fund Mortgage"}
          </Button>
          {feedback ? (
            <span className="text-xs text-brand-success">{feedback}</span>
          ) : null}
          {error ? (
            <span className="max-w-[200px] text-right text-xs text-red-600">
              {error}
            </span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
