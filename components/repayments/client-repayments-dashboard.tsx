"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CalendarClock, CheckCircle2, CircleDollarSign, Receipt } from "lucide-react";

import { PaymentSubmissionForm } from "@/components/repayments/payment-submission-form";
import {
  LoanHealthBadge,
  RepaymentStatusBadge,
} from "@/components/repayments/repayment-status-badge";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui-kit/button";
import {
  daysUntilDue,
  formatRepaymentCurrency,
} from "@/lib/repayments/format";
import type { LoanRepaymentSummary } from "@/types/repayments";

type ClientRepaymentsDashboardProps = {
  summary: LoanRepaymentSummary | null;
};

export function ClientRepaymentsDashboard({
  summary,
}: ClientRepaymentsDashboardProps) {
  const [selectedRepaymentId, setSelectedRepaymentId] = useState<string | null>(
    null,
  );
  const [, startRefresh] = useTransition();

  if (!summary) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="heading-primary text-3xl">Repayments</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your installment schedule, submit payments, and monitor loan health.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Outstanding Balance"
            value="—"
            description="No active loan"
            icon={CircleDollarSign}
            variant="featured"
          />
          <StatCard
            title="Next Payment"
            value="—"
            description="No upcoming installment"
            icon={CalendarClock}
          />
          <StatCard
            title="Total Paid"
            value="—"
            description="No repayment history yet"
            icon={CheckCircle2}
          />
          <StatCard
            title="Remaining Installments"
            value="0"
            description="Schedule not generated"
            icon={Receipt}
          />
        </div>

        <section className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-[var(--shadow-card)]">
          <p className="text-sm text-muted-foreground">
            You do not have an active funded loan with a repayment schedule yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Once your loan is funded, your installment schedule will appear here automatically.
          </p>
          <Link
            href="/loans"
            className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-brand-blue px-4 text-sm font-medium text-white hover:bg-brand-blue/90"
          >
            Browse Loan Products
          </Link>
        </section>
      </div>
    );
  }

  const selectedRepayment =
    summary.schedule.find((item) => item.id === selectedRepaymentId) ??
    summary.nextPayment;

  const daysRemaining = summary.nextPayment
    ? daysUntilDue(summary.nextPayment.due_date)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-primary text-3xl">Repayments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track your installment schedule, submit payments, and monitor loan health.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Outstanding Balance"
          value={formatRepaymentCurrency(summary.outstandingBalance)}
          description={`Loan ${summary.loanNumber}`}
          icon={CircleDollarSign}
          variant="featured"
        />
        <StatCard
          title="Next Payment"
          value={
            summary.nextPayment
              ? formatRepaymentCurrency(summary.nextPayment.installment_amount)
              : "—"
          }
          description={
            summary.nextPayment
              ? `Due ${summary.nextPayment.due_date}`
              : "No upcoming installment"
          }
          icon={CalendarClock}
          trendTone="neutral"
        />
        <StatCard
          title="Total Paid"
          value={formatRepaymentCurrency(summary.totalPaid)}
          description={`${summary.repaymentProgressPercent}% repaid`}
          icon={CheckCircle2}
          trendTone="positive"
        />
        <StatCard
          title="Remaining Installments"
          value={String(summary.remainingInstallments)}
          description="Open schedule items"
          icon={Receipt}
        />
      </div>

      {summary.nextPayment ? (
        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Upcoming Payment
              </p>
              <h2 className="heading-secondary mt-2 text-xl">
                Installment #{summary.nextPayment.installment_number}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatRepaymentCurrency(summary.nextPayment.installment_amount)} due on{" "}
                {summary.nextPayment.due_date}
                {daysRemaining !== null
                  ? ` · ${daysRemaining === 0 ? "Due today" : `${daysRemaining} days remaining`}`
                  : null}
              </p>
            </div>
            <LoanHealthBadge
              rating={summary.loanHealthRating}
              score={summary.loanHealthScore}
            />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-background">
            <div
              className="h-full rounded-full bg-brand-blue transition-all"
              style={{ width: `${summary.repaymentProgressPercent}%` }}
            />
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-brand-border bg-white shadow-[var(--shadow-card)]">
          <div className="border-b border-brand-border px-6 py-4">
            <h2 className="heading-tertiary text-lg">Repayment Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-background/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.schedule.map((item) => {
                  const canPay = ["upcoming", "due_today", "late", "overdue"].includes(
                    item.status,
                  );

                  return (
                    <tr key={item.id} className="border-t border-brand-border/70">
                      <td className="px-6 py-4 font-medium">{item.installment_number}</td>
                      <td className="px-6 py-4">{item.due_date}</td>
                      <td className="px-6 py-4">
                        {formatRepaymentCurrency(item.installment_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <RepaymentStatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        {canPay ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRepaymentId(item.id)}
                          >
                            Pay now
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)]">
          <h2 className="heading-tertiary text-lg">Submit Payment</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Payments are reviewed by our finance team before being applied to your loan.
          </p>
          {selectedRepayment ? (
            <div className="mt-6">
              <PaymentSubmissionForm
                repayment={selectedRepayment}
                loanNumber={summary.loanNumber}
                onSuccess={() =>
                  startRefresh(() => {
                    window.location.reload();
                  })
                }
              />
            </div>
          ) : (
            <p className="mt-6 rounded-lg border border-dashed border-brand-border px-4 py-8 text-center text-sm text-muted-foreground">
              Select an installment from the schedule to submit a payment.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
