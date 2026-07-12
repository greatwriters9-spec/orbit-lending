"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useCompany } from "@/components/providers/company-provider";
import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { MortgageDashboardView } from "@/types/mortgage-dashboard";

type MortgageCommandHeroProps = {
  greeting: string;
  userName: string;
  view: MortgageDashboardView;
  className?: string;
};

export function MortgageCommandHero({
  greeting: _greeting,
  userName: _userName,
  view,
  className,
}: MortgageCommandHeroProps) {
  const { branding } = useCompany();
  const detailsHref = view.applicationId
    ? `/dashboard/loans/${view.applicationId}`
    : "/dashboard/loans";

  const isActiveMortgage = view.state === "active_mortgage";
  const heroAmount = isActiveMortgage
    ? view.portfolio?.outstanding
    : formatCurrency(view.summary.maximumHomePrice);

  return (
    <section
      className={cn(
        "card-surface flex flex-col items-center px-6 py-14 text-center md:px-12 md:py-16",
        className,
      )}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {isActiveMortgage
            ? "Your Active Mortgage Balance"
            : "You Are Pre-Qualified For"}
        </p>

        {heroAmount ? (
          <p className="mt-3 text-[28px] font-bold leading-[1.1] tabular-nums text-brand-navy">
            {heroAmount}
          </p>
        ) : null}

        <p className="mt-4 max-w-md text-sm font-normal text-muted-foreground">
          {isActiveMortgage
            ? `Your mortgage is active and being serviced with ${branding.institutionName}.`
            : `Continue your mortgage journey with ${branding.institutionName}.`}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={view.nextAction.buttonHref}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
          >
            {isActiveMortgage ? "View Repayments" : "Continue Journey"}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={detailsHref}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-brand-border bg-white px-6 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-background"
          >
            View Application
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
