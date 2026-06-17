import { Home } from "lucide-react";

import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { PropertyDetailsView } from "@/types/mortgage-dashboard";

type PropertyDetailsSectionProps = {
  property: PropertyDetailsView;
  className?: string;
};

export function PropertyDetailsSection({
  property,
  className,
}: PropertyDetailsSectionProps) {
  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      <div className="border-b border-brand-border bg-brand-success/[0.05] px-6 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-success/10 text-brand-success">
            <Home className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight text-brand-navy">Property Details</h2>
            <p className="text-sm text-muted-foreground">
              Selected property and mortgage request information.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 md:px-8">
        <Detail label="Property Address" value={property.address} wide />
        <Detail label="Purchase Price" value={formatCurrency(property.purchasePrice)} />
        <Detail label="Property Type" value={property.propertyType} />
        <Detail label="Property Usage" value={property.propertyUsage} />
        <Detail label="Mortgage Amount" value={formatCurrency(property.mortgageAmount)} />
        <Detail label="Closing Date" value={property.closingDate ?? "To be scheduled"} />
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-navy">{value}</p>
    </div>
  );
}
