"use client";

import {
  calculateLoanPayment,
  formatInstallmentLabel,
} from "@/lib/loans/calculator";
import { formatApr, formatCurrency, formatTermLabel } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { LoanProductTerm } from "@/types/loans";

type LoanCalculatorProps = {
  amount: number;
  term: LoanProductTerm | undefined;
  className?: string;
};

export function LoanCalculator({ amount, term, className }: LoanCalculatorProps) {
  if (!term) {
    return (
      <div className={cn("rounded-xl border border-brand-border bg-brand-background/60 p-5", className)}>
        <p className="text-sm text-muted-foreground">
          Select a repayment term to view your estimated payment schedule.
        </p>
      </div>
    );
  }

  const result = calculateLoanPayment({
    principal: amount,
    annualInterestRate: term.interestRate,
    repaymentPeriod: term.repaymentPeriod,
    repaymentFrequency: term.repaymentFrequency,
  });

  if (!result) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-brand-blue/20 bg-brand-blue/[0.03] p-5 md:p-6",
        className,
      )}
    >
      <p className="text-xs font-semibold tracking-[0.06em] text-brand-blue uppercase">
        Live Mortgage Calculator
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">
            {formatInstallmentLabel(term.repaymentFrequency)}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-brand-navy">
            {formatCurrency(result.installmentAmount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Estimated APR</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-brand-navy">
            {formatApr(result.apr)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Repayment</p>
          <p className="mt-1 text-lg font-semibold text-brand-navy">
            {formatCurrency(result.totalRepayment)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Interest</p>
          <p className="mt-1 text-lg font-semibold text-brand-navy">
            {formatCurrency(result.totalInterest)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Estimate based on {formatCurrency(amount)} over{" "}
        {formatTermLabel(term)} at {formatApr(term.interestRate)}. Final terms
        may vary after review.
      </p>
    </div>
  );
}
