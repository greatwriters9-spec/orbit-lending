import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";

import { formatCurrency } from "@/lib/loans/queries";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";
import type { TargetLocation } from "@/types/mortgage-onboarding";

type HomeSearchNextActionProps = {
  preQualification: PreQualificationResult;
  targetLocation?: TargetLocation;
  applicationId?: string;
};

export function HomeSearchNextAction({
  preQualification,
  targetLocation,
  applicationId,
}: HomeSearchNextActionProps) {
  const submitHref = applicationId
    ? `/dashboard/loans/${applicationId}`
    : "/dashboard/loans";

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-brand-border bg-brand-blue/[0.04] px-6 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            <Search className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight text-brand-navy">Continue Your Home Search</h2>
            <p className="text-sm text-muted-foreground">
              Use your approved budget while you explore listings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
        <Metric label="Approved Budget" value={formatCurrency(preQualification.maximumHomePrice)} />
        <Metric
          label="Target Location"
          value={
            targetLocation
              ? `${targetLocation.city}, ${targetLocation.state}`
              : "Not specified"
          }
          icon={<MapPin className="size-3.5" />}
        />
        <Metric
          label="Estimated Monthly Payment"
          value={formatCurrency(preQualification.estimatedMonthlyPayment)}
        />
      </div>

      <div className="border-t border-brand-border px-6 py-5 md:px-8">
        <Link
          href={submitHref}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
        >
          Submit Property When Ready
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-border px-4 py-4">
      <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-lg font-bold text-brand-navy tabular-nums">
        {icon}
        {value}
      </p>
    </div>
  );
}
