"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { calculateLoanPayment } from "@/lib/loans/calculator";
import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";

import { SectionHeading, SectionShell } from "./shared/section-shell";

const DEFAULT_AMOUNT = 25000;
const DEFAULT_APR = 9.49;
const DEFAULT_TERM = 36;
const MIN_AMOUNT = 5000;
const MAX_AMOUNT = 250000;
const TERM_OPTIONS = [12, 24, 36, 48, 60, 72, 84];

export function LoanCalculator() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [apr, setApr] = useState(DEFAULT_APR);
  const [termMonths, setTermMonths] = useState(DEFAULT_TERM);

  const result = useMemo(
    () =>
      calculateLoanPayment({
        principal: amount,
        annualInterestRate: apr,
        repaymentPeriod: termMonths,
        repaymentFrequency: "Monthly",
      }),
    [amount, apr, termMonths],
  );

  return (
    <SectionShell
      id="calculator"
      tone="muted"
      className="scroll-mt-24 pt-8 pb-20 md:pt-10 md:pb-28"
    >
      <SectionHeading
        className="max-w-3xl"
        eyebrow="Mortgage Calculator"
        title="Estimate Your Monthly Mortgage Payment"
        subtitle="Adjust mortgage amount, term, and rate to explore your estimated monthly payment before you apply."
        align="left"
      />

      <div
        className={cn(
          "calculator-panel oak-card mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-brand-border bg-white md:mt-12",
        )}
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 border-b border-brand-border p-6 md:p-8 lg:border-b-0 lg:border-r">
            <SliderField
              label="Mortgage Amount"
              value={amount}
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step={500}
              format={formatCurrency}
              onChange={setAmount}
            />

            <SliderField
              label="Mortgage Rate"
              value={apr}
              min={3}
              max={24}
              step={0.1}
              format={(v) => `${v.toFixed(2)}%`}
              onChange={setApr}
            />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-brand-navy">Mortgage Term</span>
                <span className="text-sm font-semibold tabular-nums text-brand-blue">
                  {termMonths} months
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TERM_OPTIONS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setTermMonths(term)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      termMonths === term
                        ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                        : "border-brand-border bg-white text-brand-navy hover:border-brand-blue/30"
                    }`}
                  >
                    {term} mo
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="calculator-result-panel flex flex-col justify-between bg-gradient-to-br from-brand-navy to-brand-navy/90 p-6 text-white md:p-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-white/60">Estimated Monthly Mortgage Payment</p>
                <p className="heading-primary-light mt-2 text-4xl tabular-nums md:text-5xl">
                  {result ? formatCurrency(result.installmentAmount) : "—"}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <OutputMetric
                  label="Total Repayment"
                  value={result ? formatCurrency(result.totalRepayment) : "—"}
                />
                <OutputMetric
                  label="Total Interest"
                  value={result ? formatCurrency(result.totalInterest) : "—"}
                />
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/get-started"
                className="oak-btn-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-brand-blue text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
              >
                Get Pre-Qualified with This Estimate
                <ArrowRight className="size-4" />
              </Link>
              <p className="text-center text-xs leading-relaxed text-white/50">
                Estimates are for illustrative purposes only. Final terms are
                determined after application review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="calculator-slider-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-brand-navy">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-brand-blue">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-brand-border accent-brand-blue"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function OutputMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
      <p className="text-xs text-white/55">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
