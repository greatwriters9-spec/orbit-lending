"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import { MORTGAGE_APPLICATION_ROUTES } from "@/types/mortgage-full-application";
import type { MortgageDashboardView } from "@/types/mortgage-dashboard";

const JOURNEY_STAGES = [
  "Pre-Qualification",
  "Mortgage Application",
  "Document Verification",
  "Underwriting",
  "Clear to Close",
  "Closing",
] as const;

type PreQualifiedDashboardProps = {
  firstName: string;
  view: MortgageDashboardView;
  applicationId: string;
};

export function PreQualifiedDashboard({
  firstName,
  view,
  applicationId,
}: PreQualifiedDashboardProps) {
  const preQual = view.summary;
  const termYears = Math.round(view.details.termYears);

  const buyingPowerRows = [
    {
      label: "Estimated Loan Amount",
      value: formatCurrency(preQual.approvedMortgageAmount),
    },
    {
      label: "Estimated Home Price",
      value: formatCurrency(preQual.maximumHomePrice),
    },
    {
      label: "Estimated Monthly Payment",
      value: formatCurrency(preQual.estimatedMonthlyPayment),
    },
    {
      label: "Estimated Down Payment",
      value: formatCurrency(preQual.requiredDownPayment),
    },
    {
      label: "Estimated Interest Rate",
      value: `${view.details.interestRate.toFixed(2)}%`,
    },
    {
      label: "Loan Term",
      value: `${termYears} Years`,
    },
  ];

  return (
    <div className="space-y-8 md:space-y-10">
      <div>
        <h1 className="heading-primary text-2xl md:text-3xl">
          Welcome back, {firstName}.
        </h1>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-success/25 bg-brand-success/10 px-3 py-1.5 text-sm font-semibold text-brand-success">
          <span aria-hidden className="size-2 rounded-full bg-brand-success" />
          Pre-Qualified
        </span>
      </div>

      <section className="dashboard-card px-6 py-8 md:px-10 md:py-10">
        <h2 className="text-lg font-semibold text-brand-navy md:text-xl">
          Buying Power
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {buyingPowerRows.map((row) => (
            <div key={row.label}>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {row.label}
              </p>
              <p className="mt-1.5 text-xl font-bold tabular-nums text-brand-navy">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-card px-6 py-8 md:px-10">
        <h2 className="text-lg font-semibold text-brand-navy md:text-xl">
          Your Mortgage Journey
        </h2>
        <ol className="mt-6 space-y-4">
          {JOURNEY_STAGES.map((stage, index) => {
            const completed = index === 0;
            const isCurrent = index === 1;

            return (
              <li key={stage} className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                    completed
                      ? "border-brand-blue bg-brand-blue text-white"
                      : isCurrent
                        ? "border-brand-blue bg-white"
                        : "border-brand-border bg-white",
                  )}
                >
                  {completed ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <span
                      className={cn(
                        "rounded-full",
                        isCurrent ? "size-2.5 bg-brand-blue" : "size-2 bg-brand-border",
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm md:text-base",
                    completed
                      ? "font-semibold text-brand-navy"
                      : isCurrent
                        ? "font-medium text-brand-blue"
                        : "text-muted-foreground",
                  )}
                >
                  {stage}
                  {completed ? " (Completed)" : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="dashboard-card px-6 py-8 md:px-10 md:py-12">
        <h2 className="text-xl font-semibold text-brand-navy md:text-2xl">
          Complete Your Mortgage Application
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          You&apos;re pre-qualified based on the information you&apos;ve provided.
          The next step is to complete your full mortgage application so our team
          can verify your information and determine your final loan eligibility.
        </p>
        <Link
          href={MORTGAGE_APPLICATION_ROUTES.intro(applicationId)}
          className="mt-8 inline-flex h-14 items-center justify-center rounded-xl bg-brand-blue px-8 text-base font-semibold text-white transition-colors hover:bg-brand-blue/90"
        >
          Start Mortgage Application
        </Link>
      </section>
    </div>
  );
}
