"use client";

import { ArrowRight, Clock3 } from "lucide-react";

import { CompanyLogo } from "@/components/company/company-logo";

const OUTLINE_ITEMS = [
  "Personal Information",
  "Employment",
  "Income",
  "Assets",
  "Debts",
  "Property Information",
  "Loan Preferences",
  "Review",
  "E-Signature",
  "Consent",
] as const;

type ApplicationIntroProps = {
  onBegin: () => void;
};

export function ApplicationIntro({ onBegin }: ApplicationIntroProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-[72px] max-w-4xl items-center px-4 md:px-8">
          <CompanyLogo href="/dashboard" size="sm" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-12 md:px-8 md:py-16">
        <div className="card-surface px-6 py-10 md:px-12 md:py-14">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-brand-blue uppercase">
            Mortgage Application
          </p>
          <h1 className="heading-primary mt-4 text-3xl md:text-4xl lg:text-[2.75rem]">
            Complete Your Mortgage Application
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            You&apos;re already pre-qualified. Now we&apos;ll verify your information
            so we can determine your final mortgage eligibility.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-brand-border bg-brand-background/60 px-4 py-3">
            <Clock3 className="size-5 text-brand-blue" />
            <div className="text-left">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Estimated completion time
              </p>
              <p className="text-sm font-semibold text-brand-navy">15–20 minutes</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-brand-border px-5 py-5">
            <p className="text-sm font-semibold text-brand-navy">What we&apos;ll cover</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {OUTLINE_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-brand-navy">
                  <span className="text-brand-success">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={onBegin}
            className="mt-10 inline-flex h-14 w-full items-center justify-center rounded-xl bg-brand-blue text-base font-semibold text-white transition-colors hover:bg-brand-blue/90 sm:w-auto sm:px-10"
          >
            Begin Application
            <ArrowRight className="ml-2 size-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
