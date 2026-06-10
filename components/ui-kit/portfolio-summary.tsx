import { Activity, CircleDollarSign } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PortfolioSummary as PortfolioSummaryData } from "@/types/dashboard";

import { StatusBadge } from "./status-badge";

type PortfolioSummaryProps = PortfolioSummaryData & {
  className?: string;
};

type MetricProps = {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
  detailClassName?: string;
};

function Metric({
  label,
  value,
  detail,
  valueClassName,
  detailClassName,
}: MetricProps) {
  return (
    <div className="px-5 py-4 md:px-6 md:py-5">
      <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "financial-value mt-2 text-2xl md:text-[28px]",
          valueClassName,
        )}
      >
        {value}
      </p>
      <p className={cn("mt-1 text-xs text-muted-foreground", detailClassName)}>
        {detail}
      </p>
    </div>
  );
}

function HealthScore({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center px-5 py-4 md:px-6 md:py-5">
      <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        Loan Health Score
      </p>
      <div className="relative mt-3 size-20">
        <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-brand-border"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-brand-success"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tracking-tight text-brand-navy tabular-nums">
            {score}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs font-semibold text-brand-success">{label}</p>
    </div>
  );
}

export function PortfolioSummary({
  loanId,
  productName,
  principal,
  outstanding,
  paidToDate,
  paidPercent,
  healthScore,
  healthLabel,
  apr,
  termMonths,
  paymentsMade,
  paymentsTotal,
  className,
}: PortfolioSummaryProps) {
  const remainingPercent = 100 - paidPercent;

  return (
    <section className={cn("card-surface p-6 md:p-8", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/10">
            <CircleDollarSign className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="heading-secondary text-lg tracking-tight">
              Loan Health
            </h2>
            <p className="text-sm text-muted-foreground">
              {productName} · {loanId}
            </p>
          </div>
        </div>
        <StatusBadge status="active" />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-brand-border bg-brand-background/50">
        <div className="grid divide-y divide-brand-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <Metric
            label="Outstanding Balance"
            value={outstanding}
            detail="Remaining principal owed"
          />
          <Metric
            label="Paid to Date"
            value={paidToDate}
            detail={`${paidPercent}% of loan repaid`}
            valueClassName="text-brand-success"
            detailClassName="text-brand-success/80"
          />
          <Metric
            label="Original Loan Amount"
            value={principal}
            detail={`${apr} APR · ${termMonths}-month term`}
          />
          <HealthScore score={healthScore} label={healthLabel} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-border bg-white px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              Completion Percentage
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-brand-blue tabular-nums md:text-4xl">
                {paidPercent}%
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                complete
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {paymentsMade} of {paymentsTotal} installments paid ·{" "}
              {remainingPercent}% remaining
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Activity className="size-3.5 text-brand-blue" strokeWidth={2} />
              Repayment on schedule
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-brand-navy">Repayment progress</span>
            <span className="text-muted-foreground tabular-nums">
              {paymentsMade}/{paymentsTotal} payments
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-brand-background ring-1 ring-brand-border/60">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand-blue transition-all duration-700"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>$0</span>
            <span className="text-brand-blue">{paidPercent}% repaid</span>
            <span>{principal}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
