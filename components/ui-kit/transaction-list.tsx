import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardTransaction } from "@/types/dashboard";

import { StatusBadge } from "./status-badge";

type TransactionListProps = {
  transactions: DashboardTransaction[];
  className?: string;
  variant?: "default" | "statement";
};

export function TransactionList({
  transactions,
  className,
  variant = "statement",
}: TransactionListProps) {
  if (variant === "default") {
    return (
      <div className={cn("divide-y divide-brand-border", className)}>
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="hidden border-b border-brand-border bg-brand-background/60 px-5 py-3.5 sm:grid sm:grid-cols-[minmax(0,1fr)_120px_120px_100px_100px] sm:gap-4">
        <span className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Description
        </span>
        <span className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Reference
        </span>
        <span className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Date
        </span>
        <span className="text-right text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Amount
        </span>
        <span className="text-right text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Status
        </span>
      </div>

      <div className="divide-y divide-brand-border">
        {transactions.map((transaction, index) => (
          <StatementRow
            key={transaction.id}
            transaction={transaction}
            isFirst={index === 0}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-brand-border bg-brand-background/40 px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Showing {transactions.length} recent transactions
        </p>
        <p className="text-xs font-medium text-muted-foreground">
          Statement period: Feb – Mar 2026
        </p>
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: DashboardTransaction;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-navy">
          {transaction.description}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {transaction.date}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            transaction.type === "credit"
              ? "text-brand-success"
              : "text-brand-navy",
          )}
        >
          {transaction.type === "credit" ? "+" : "-"}
          {transaction.amount}
        </p>
        <StatusBadge status={transaction.status} />
      </div>
    </div>
  );
}

function StatementRow({
  transaction,
  isFirst,
}: {
  transaction: DashboardTransaction;
  isFirst: boolean;
}) {
  const isCredit = transaction.type === "credit";

  return (
    <div
      className={cn(
        "group px-5 py-5 transition-colors hover:bg-brand-background/50 sm:grid sm:grid-cols-[minmax(0,1fr)_120px_120px_100px_100px] sm:items-center sm:gap-4",
        isFirst && "bg-brand-background/20",
      )}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            isCredit
              ? "bg-brand-success/10 text-brand-success"
              : "bg-brand-background text-muted-foreground",
          )}
        >
          {isCredit ? (
            <ArrowDownLeft className="size-4" strokeWidth={2} />
          ) : (
            <ArrowUpRight className="size-4" strokeWidth={2} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-navy">
            {transaction.description}
          </p>
          {transaction.balance ? (
            <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
              Balance: {transaction.balance}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-2 truncate font-mono text-xs text-muted-foreground sm:mt-0">
        {transaction.reference ?? "—"}
      </p>

      <p className="mt-1 text-sm text-muted-foreground sm:mt-0">
        {transaction.date}
      </p>

      <p
        className={cn(
          "mt-2 text-right text-sm font-bold tabular-nums sm:mt-0",
          isCredit ? "text-brand-success" : "text-brand-navy",
        )}
      >
        {isCredit ? "+" : "−"}
        {transaction.amount}
      </p>

      <div className="mt-2 flex justify-end sm:mt-0">
        <StatusBadge status={transaction.status} />
      </div>
    </div>
  );
}
