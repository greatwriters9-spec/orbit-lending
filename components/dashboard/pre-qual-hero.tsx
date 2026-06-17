import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";

type PreQualHeroProps = {
  greeting: string;
  userName: string;
  preQualification: PreQualificationResult;
  applicationId?: string;
  className?: string;
};

export function PreQualHero({
  greeting,
  userName,
  preQualification,
  applicationId,
  className,
}: PreQualHeroProps) {
  const detailsHref = applicationId
    ? `/dashboard/loans/${applicationId}`
    : "/dashboard/loans";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-8 md:px-10 md:py-10",
        "shadow-[var(--shadow-elevated)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 size-52 rounded-full bg-brand-blue/8"
      />

      <div className="relative max-w-3xl space-y-4">
        <p className="text-xs font-semibold tracking-[0.08em] text-white/50 uppercase">
          {greeting}, {userName}
        </p>
        <p className="text-base text-white/70 md:text-lg">
          You are pre-qualified for up to
        </p>
        <p className="text-4xl font-bold tracking-tight text-white tabular-nums md:text-5xl">
          {formatCurrency(preQualification.maximumHomePrice)}
        </p>
        <Link
          href={detailsHref}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
        >
          View Mortgage Details
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
