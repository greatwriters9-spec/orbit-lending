import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import { StatusBadge } from "@/components/ui-kit/status-badge";
import type { LoanStatus } from "@/types/dashboard";
import {
  TRANSACTION_TYPE_LABELS,
  type WalletTransaction,
} from "@/types/wallet";

type WalletTransactionTableProps = {
  transactions: WalletTransaction[];
  title?: string;
  emptyMessage?: string;
};

export function WalletTransactionTable({
  transactions,
  title = "Recent Transactions",
  emptyMessage = "No transactions yet.",
}: WalletTransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-brand-border px-6 py-4">
        <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-background/60">
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Reference
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {transactions.map((tx) => {
              const isCredit = [
                "loan_funding",
                "repayment_received",
                "system_credit",
                "withdrawal_rejected",
              ].includes(tx.transactionType);

              return (
                <tr key={tx.id} className="hover:bg-brand-background/40">
                  <td className="px-6 py-4">
                    <p className="font-medium text-brand-navy">
                      {TRANSACTION_TYPE_LABELS[tx.transactionType]}
                    </p>
                    <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                      {tx.description}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    {tx.referenceNumber}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatApplicationDate(tx.createdAt)}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-semibold tabular-nums ${isCredit ? "text-brand-success" : "text-brand-navy"}`}
                  >
                    {isCredit ? "+" : "−"}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={mapTxStatus(tx.status)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function mapTxStatus(status: WalletTransaction["status"]): LoanStatus {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
    case "cancelled":
      return "danger";
    default:
      return "pending";
  }
}
