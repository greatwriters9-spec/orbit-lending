"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Search } from "lucide-react";

import { TransactionDetailsDrawer } from "@/components/transactions/transaction-details-drawer";
import {
  TransactionStatusBadge,
  TransactionTypeLabel,
} from "@/components/transactions/transaction-badges";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import { exportFinanceTransactionsCsvAction } from "@/lib/transactions/actions";
import type { PlatformTransaction } from "@/types/transactions";

type FinanceTransactionCenterProps = {
  transactions: PlatformTransaction[];
  summary: {
    totalTransactions: number;
    pendingReview: number;
    completedVolume: number;
  };
};

export function FinanceTransactionCenter({
  transactions,
  summary,
}: FinanceTransactionCenterProps) {
  const [selected, setSelected] = useState<PlatformTransaction | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!search) return transactions;
    return transactions.filter((tx) =>
      [
        tx.description,
        tx.transactionNumber,
        tx.referenceNumber,
        tx.borrowerId,
        tx.loanNumber ?? "",
      ].some((value) => value.toLowerCase().includes(search.toLowerCase())),
    );
  }, [transactions, search]);

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportFinanceTransactionsCsvAction(
        search ? { search } : undefined,
      );
      if (result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "orbit-platform-transactions.csv";
        anchor.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="heading-primary text-3xl">Transaction Center</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Global platform ledger with audit-friendly search, review, and export tools.
          </p>
        </div>
        <Button variant="outline" disabled={isPending} onClick={handleExport}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Platform Transactions"
          value={String(summary.totalTransactions)}
          description="All recorded ledger entries"
          icon={Search}
        />
        <StatCard
          title="Pending Review"
          value={String(summary.pendingReview)}
          description="Pending or processing"
          icon={Search}
          trendTone="warning"
        />
        <StatCard
          title="Completed Volume"
          value={formatCurrency(summary.completedVolume)}
          description="Completed transaction volume"
          icon={Search}
          variant="featured"
        />
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Global search by ID, reference, description, borrower..."
          className="h-11 pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-background/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Borrower</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-t border-brand-border/70">
                  <td className="px-6 py-4">{formatApplicationDate(tx.createdAt)}</td>
                  <td className="px-6 py-4 font-mono text-xs">{tx.transactionNumber}</td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {tx.borrowerId.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <TransactionTypeLabel type={tx.transactionType} />
                  </td>
                  <td className="px-6 py-4 font-semibold tabular-nums">
                    {tx.direction === "credit" ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <TransactionStatusBadge status={tx.status} />
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(tx)}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionDetailsDrawer
        transaction={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
