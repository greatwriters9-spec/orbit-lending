import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

import { formatCurrency } from "@/lib/loans/queries";
import type { PropertyAddress } from "@/types/mortgage-onboarding";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";

type PropertyDetailsPanelProps = {
  propertyAddress?: PropertyAddress;
  purchasePrice?: number;
  preQualification: PreQualificationResult;
  applicationId?: string;
};

export function PropertyDetailsPanel({
  propertyAddress,
  purchasePrice,
  preQualification,
  applicationId,
}: PropertyDetailsPanelProps) {
  const detailsHref = applicationId
    ? `/dashboard/loans/${applicationId}`
    : "/dashboard/loans";

  return (
    <section className="card-surface overflow-hidden">
      <div className="border-b border-brand-border bg-brand-success/[0.05] px-6 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-success/10 text-brand-success">
            <Home className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight text-brand-navy">Property Details</h2>
            <p className="text-sm text-muted-foreground">
              Your selected property is ready for the next underwriting steps.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
        <Metric
          label="Property"
          value={
            propertyAddress
              ? `${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state}`
              : "Address on file"
          }
        />
        <Metric
          label="Purchase Price"
          value={formatCurrency(purchasePrice ?? preQualification.maximumHomePrice)}
        />
        <Metric
          label="Mortgage Request"
          value={formatCurrency(preQualification.estimatedMortgageAmount)}
        />
      </div>

      <div className="border-t border-brand-border px-6 py-5 md:px-8">
        <Link
          href={detailsHref}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
        >
          Continue to Underwriting
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-border px-4 py-4">
      <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-navy">{value}</p>
    </div>
  );
}
