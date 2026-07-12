"use client";

import { ArrowRight, Clock3 } from "lucide-react";

import { CompanyLogo } from "@/components/company/company-logo";

type AssessmentIntroProps = {
  onStart: () => void;
};

export function AssessmentIntro({ onStart }: AssessmentIntroProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-[72px] max-w-3xl items-center px-4 md:px-6">
          <CompanyLogo href="/" size="sm" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12 md:px-6 md:py-16">
        <div className="card-surface px-6 py-10 md:px-12 md:py-14">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-brand-blue uppercase">
            Buying Power Assessment
          </p>
          <h1 className="heading-primary mt-4 text-3xl md:text-4xl lg:text-[2.75rem]">
            Find Out How Much Home You Can Afford
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Answer a few quick questions to estimate your home buying power. This
            assessment does not affect your credit score and is not a final loan
            approval.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-brand-border bg-brand-background/60 px-4 py-3">
            <Clock3 className="size-5 text-brand-blue" />
            <div className="text-left">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Estimated Time
              </p>
              <p className="text-sm font-semibold text-brand-navy">3–5 Minutes</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            className="mt-10 inline-flex h-14 w-full items-center justify-center rounded-xl bg-brand-blue px-10 text-base font-semibold text-white transition-colors hover:opacity-90 md:w-auto"
          >
            Start Assessment
            <ArrowRight className="ml-2 size-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
