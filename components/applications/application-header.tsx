import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { formatShortDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { ApplicationDetail } from "@/types/application-details";

type ApplicationHeaderProps = {
  application: ApplicationDetail;
  className?: string;
};

export function ApplicationHeader({
  application,
  className,
}: ApplicationHeaderProps) {
  return (
    <section
      className={cn(
        "card-surface overflow-hidden border-brand-border",
        className,
      )}
    >
      <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
              {application.applicationNumber}
            </p>
            <h1 className="heading-primary-light mt-2 text-2xl md:text-3xl">
              {application.productName}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Submitted{" "}
              {application.submittedAt
                ? formatShortDate(application.submittedAt)
                : formatShortDate(application.updatedAt)}
            </p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-3 md:p-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Requested Amount
          </p>
          <p className="mt-2 text-xl font-bold text-brand-navy">
            {formatCurrency(application.requestedAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Product
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-navy">
            {application.productName}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Purpose
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {application.purpose ?? "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
