import Link from "next/link";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import { StatusBadge } from "@/components/ui-kit/status-badge";
import type { LoanStatus } from "@/types/dashboard";
import {
  WITHDRAWAL_METHOD_LABELS,
  type WithdrawalRequest,
} from "@/types/wallet";

type WithdrawalRequestsListProps = {
  requests: WithdrawalRequest[];
};

export function WithdrawalRequestsList({ requests }: WithdrawalRequestsListProps) {
  if (requests.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-sm text-muted-foreground">No withdrawal requests yet.</p>
        <Link
          href="/wallet/withdraw"
          className="mt-3 inline-block text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
        >
          Request a withdrawal →
        </Link>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-brand-border px-6 py-4">
        <h3 className="text-sm font-semibold text-brand-navy">Withdrawal Requests</h3>
      </div>
      <div className="divide-y divide-brand-border">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-brand-navy">
                {formatCurrency(request.amount)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {WITHDRAWAL_METHOD_LABELS[request.withdrawalMethod]} ·{" "}
                {formatApplicationDate(request.createdAt)}
              </p>
              {request.rejectionReason ? (
                <p className="mt-1 text-xs text-red-600">
                  Rejected: {request.rejectionReason}
                </p>
              ) : null}
            </div>
            <StatusBadge status={mapWithdrawalStatus(request.status)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function mapWithdrawalStatus(
  status: WithdrawalRequest["status"],
): LoanStatus {
  if (status === "approved" || status === "completed") return "approved";
  if (status === "rejected") return "rejected";
  return "pending";
}
