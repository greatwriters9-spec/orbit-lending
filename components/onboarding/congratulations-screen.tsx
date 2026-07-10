"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui-kit/button";
import { OrbitLogo } from "@/components/brand/orbit-logo";
import { formatCurrency } from "@/lib/loans/queries";
import { ONBOARDING_ROUTES } from "@/types/mortgage-onboarding";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";

const NEXT_STEPS = [
  "Create Your Secure Account",
  "Complete Mortgage Application",
  "Upload Documents",
  "Underwriting Review",
  "Closing",
] as const;

type CongratulationsScreenProps = {
  preQual: PreQualificationResult;
  isLoggedIn?: boolean;
  onContinueLoggedIn?: () => void;
  isContinuing?: boolean;
};

export function CongratulationsScreen({
  preQual,
  isLoggedIn = false,
  onContinueLoggedIn,
  isContinuing = false,
}: CongratulationsScreenProps) {
  const termYears = Math.round(preQual.loanTermMonths / 12);

  const summaryRows = [
    { label: "Estimated Loan Amount", value: formatCurrency(preQual.estimatedMortgageAmount) },
    { label: "Estimated Home Price", value: formatCurrency(preQual.maximumHomePrice) },
    { label: "Estimated Monthly Payment", value: formatCurrency(preQual.estimatedMonthlyPayment) },
    { label: "Estimated Down Payment", value: formatCurrency(preQual.estimatedDownPayment) },
    { label: "Estimated Interest Rate", value: `${preQual.interestRate.toFixed(2)}%` },
    { label: "Loan Term", value: `${termYears} Years` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-[72px] max-w-3xl items-center px-4 md:px-6">
          <OrbitLogo href="/" size="sm" aria-label="Orbit Mortgage home" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6 md:py-14">
        <div className="card-surface px-6 py-10 text-center md:px-10 md:py-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-success/10">
            <CheckCircle2 className="size-9 text-brand-success" strokeWidth={1.75} />
          </div>

          <h1 className="heading-primary mt-6 text-3xl md:text-4xl">Congratulations!</h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Based on the information you provided, you&apos;re pre-qualified for up to
          </p>
          <p className="mt-3 text-[2rem] font-bold tabular-nums text-brand-navy md:text-[2.5rem]">
            {formatCurrency(preQual.estimatedMortgageAmount)}
          </p>

          <div className="mt-8 rounded-2xl border border-brand-border bg-brand-background/50 p-5 text-left md:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {summaryRows.map((row) => (
                <div key={row.label}>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {row.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-brand-navy">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-left text-sm leading-relaxed text-muted-foreground">
            This is an estimated pre-qualification based on the information you provided.
            Final loan approval is subject to verification of your income, assets,
            employment, credit, property information, and underwriting review.
          </p>

          <div className="mt-8 rounded-2xl border border-brand-border px-5 py-5 text-left">
            <p className="text-sm font-semibold text-brand-navy">What Happens Next</p>
            <ol className="mt-4 space-y-3">
              {NEXT_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm text-brand-navy">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-success/15 text-[11px] font-bold text-brand-success">
                    {index === 0 ? "✓" : "○"}
                  </span>
                  <span className={index === 0 ? "font-semibold" : "text-muted-foreground"}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {isLoggedIn ? (
            <Button
              type="button"
              disabled={isContinuing}
              onClick={onContinueLoggedIn}
              className="mt-8 h-14 w-full rounded-xl bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue/90"
            >
              {isContinuing ? "Saving..." : "Continue"}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          ) : (
            <Link
              href={ONBOARDING_ROUTES.createAccount}
              className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-xl bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue/90"
            >
              Continue
              <ArrowRight className="ml-2 size-4" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export function CongratulationsRedirect({ to }: { to: string }) {
  const router = useRouter();
  router.replace(to);
  return null;
}
