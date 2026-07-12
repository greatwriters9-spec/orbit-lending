"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { useCompany } from "@/components/providers/company-provider";

import { formatCurrency } from "@/lib/loans/queries";
import {
  hasSeenQualificationResult,
  markQualificationResultSeen,
} from "@/lib/qualification/result-storage";
import { cn } from "@/lib/utils";
import type { MortgageDashboardView } from "@/types/mortgage-dashboard";

type QualificationResultScreenProps = {
  userId: string;
  view: MortgageDashboardView;
  className?: string;
};

export function QualificationResultScreen({
  userId,
  view,
  className,
}: QualificationResultScreenProps) {
  const router = useRouter();
  const { company } = useCompany();
  const detailsHref = view.applicationId
    ? `/dashboard/loans/${view.applicationId}`
    : "/dashboard/loans";

  useEffect(() => {
    if (hasSeenQualificationResult(userId)) {
      router.replace("/dashboard");
    }
  }, [router, userId]);

  const handleContinueJourney = () => {
    markQualificationResultSeen(userId);
    router.push("/dashboard");
  };

  const handleViewDetails = () => {
    markQualificationResultSeen(userId);
  };

  return (
    <section
      className={cn(
        "card-surface flex flex-col items-center px-6 py-14 text-center md:px-12 md:py-16",
        className,
      )}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          You Are Pre-Qualified For
        </p>

        <p className="mt-3 text-[28px] font-bold leading-[1.1] tabular-nums text-brand-navy">
          {formatCurrency(view.summary.maximumHomePrice)}
        </p>

        <p className="mt-4 max-w-md text-sm font-normal text-muted-foreground">
          Continue your mortgage journey with {company.companyName}.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleContinueJourney}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
          >
            Continue Journey
            <ArrowRight className="size-4" />
          </button>
          <Link
            href={detailsHref}
            onClick={handleViewDetails}
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
