import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { formatShortDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { ApplicationSummary } from "@/types/application-details";

type ApplicationListCardProps = {
  application: ApplicationSummary;
  className?: string;
};

export function ApplicationListCard({
  application,
  className,
}: ApplicationListCardProps) {
  return (
    <Link
      href={`/dashboard/loans/${application.id}`}
      className={cn(
        "group card-surface flex flex-col gap-5 p-6 transition-all hover:border-brand-blue/30 hover:shadow-[var(--shadow-card-hover)] md:p-7",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {application.applicationNumber}
          </p>
          <h3 className="heading-tertiary mt-1 text-lg transition-colors group-hover:text-brand-blue">
            {application.productName}
          </h3>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Requested Amount</p>
          <p className="mt-1 font-semibold text-brand-navy">
            {formatCurrency(application.requestedAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last Updated</p>
          <p className="mt-1 font-semibold text-brand-navy">
            {formatShortDate(application.updatedAt)}
          </p>
        </div>
      </div>

      {application.purpose ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {application.purpose}
        </p>
      ) : null}

      <p className="text-sm font-semibold text-brand-blue">
        View application details
        <ArrowRight className="ml-1 inline size-4 transition-transform group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}
