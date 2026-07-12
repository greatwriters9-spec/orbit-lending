"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileText,
  Search,
  Wallet,
} from "lucide-react";

import { TransactionDetailsDrawer } from "@/components/transactions/transaction-details-drawer";
import {
  TransactionStatusBadge,
  TransactionTypeLabel,
} from "@/components/transactions/transaction-badges";
import { StatCard } from "@/components/ui-kit/stat-card";
import { useCompany } from "@/components/providers/company-provider";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import {
  exportTransactionsCsvAction,
  generateAccountStatementAction,
} from "@/lib/transactions/actions";
import {
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/transactions/constants";
import type {
  PlatformTransaction,
  PlatformTransactionStatus,
  PlatformTransactionType,
  TransactionSummary,
} from "@/types/transactions";

type ClientTransactionCenterProps = {
  transactions: PlatformTransaction[];
  summary: TransactionSummary;
};

export function ClientTransactionCenter({
  transactions: initialTransactions,
  summary,
}: ClientTransactionCenterProps) {
  const { branding } = useCompany();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selected, setSelected] = useState<PlatformTransaction | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [referenceFilter, setReferenceFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.transactionType !== typeFilter) return false;
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (referenceFilter && !tx.referenceNumber.toLowerCase().includes(referenceFilter.toLowerCase())) {
        return false;
      }
      if (amountMin && tx.amount < Number(amountMin)) return false;
      if (amountMax && tx.amount > Number(amountMax)) return false;
      if (
        search &&
        ![
          tx.description,
          tx.transactionNumber,
          tx.referenceNumber,
          tx.loanNumber ?? "",
        ].some((value) => value.toLowerCase().includes(search.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, typeFilter, statusFilter, referenceFilter, amountMin, amountMax, search]);

  const handleExportCsv = () => {
    startTransition(async () => {
      const result = await exportTransactionsCsvAction({
        search: search || undefined,
        referenceNumber: referenceFilter || undefined,
        amountMin: amountMin ? Number(amountMin) : undefined,
        amountMax: amountMax ? Number(amountMax) : undefined,
        types:
          typeFilter !== "all"
            ? [typeFilter as PlatformTransactionType]
            : undefined,
        statuses:
          statusFilter !== "all"
            ? [statusFilter as PlatformTransactionStatus]
            : undefined,
      });
      if (result.csv) {
        downloadFile(result.csv, `${branding.institutionName.toLowerCase().replace(/\s+/g, "-")}-transactions.csv`, "text/csv");
      }
    });
  };

  const handleStatement = () => {
    startTransition(async () => {
      const result = await generateAccountStatementAction();
      if (result.html) {
        downloadFile(result.html, `${branding.institutionName.toLowerCase().replace(/\s+/g, "-")}-statement.html`, "text/html");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="heading-primary text-3xl">Transactions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete financial activity ledger for your {branding.institutionName} account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={isPending} onClick={handleExportCsv}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          <Button variant="outline" disabled={isPending} onClick={handleStatement}>
            <FileText className="mr-2 size-4" />
            Account Statement
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={String(summary.totalTransactions)}
          description="All recorded activity"
          icon={FileText}
        />
        <StatCard
          title="Money Received"
          value={formatCurrency(summary.moneyReceived)}
          description="Credits to your account"
          icon={ArrowDownLeft}
          trendTone="positive"
        />
        <StatCard
          title="Money Paid"
          value={formatCurrency(summary.moneyPaid)}
          description="Debits from your account"
          icon={ArrowUpRight}
        />
        <StatCard
          title="Available Balance"
          value={formatCurrency(summary.walletBalance)}
          description={`${summary.recentActivityCount} events in last 30 days`}
          icon={Wallet}
          variant="featured"
        />
      </div>

      <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search keyword"
              className="h-10 pl-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-10 rounded-lg border border-brand-border px-3 text-sm"
          >
            <option value="all">All types</option>
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-brand-border px-3 text-sm"
          >
            <option value="all">All statuses</option>
            {Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Input
            value={referenceFilter}
            onChange={(event) => setReferenceFilter(event.target.value)}
            placeholder="Reference number"
            className="h-10"
          />
          <Input
            value={amountMin}
            onChange={(event) => setAmountMin(event.target.value)}
            placeholder="Min amount"
            type="number"
            className="h-10"
          />
          <Input
            value={amountMax}
            onChange={(event) => setAmountMax(event.target.value)}
            placeholder="Max amount"
            type="number"
            className="h-10"
          />
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-background/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-t border-brand-border/70">
                  <td className="px-6 py-4">{formatApplicationDate(tx.createdAt)}</td>
                  <td className="px-6 py-4 font-mono text-xs">{tx.transactionNumber}</td>
                  <td className="px-6 py-4">
                    <TransactionTypeLabel type={tx.transactionType} />
                  </td>
                  <td className="max-w-xs px-6 py-4 text-muted-foreground">
                    {tx.description}
                  </td>
                  <td
                    className={`px-6 py-4 font-semibold tabular-nums ${tx.direction === "credit" ? "text-brand-success" : "text-brand-navy"}`}
                  >
                    {tx.direction === "credit" ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <TransactionStatusBadge status={tx.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{tx.referenceNumber}</td>
                  <td className="px-6 py-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(tx)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            {transactions.length
              ? "No transactions match your filters."
              : "No transactions yet. Activity will appear here after mortgage funding, repayments, or funding account movements."}
          </div>
        ) : null}
      </div>

      <TransactionDetailsDrawer
        transaction={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

