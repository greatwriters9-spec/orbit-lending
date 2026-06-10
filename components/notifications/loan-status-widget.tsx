import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ProgressTracker } from "@/components/ui-kit/progress-tracker";
import { buildProgressSteps } from "@/lib/applications/status-utils";
import { APPLICATION_STATUS_LABELS } from "@/lib/applications/status-utils";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/application-details";
import type { ProgressStep } from "@/types/dashboard";

type LoanStatusWidgetProps = {
  status?: ApplicationStatus;
  applicationNumber?: string;
  productName?: string;
  progressSteps?: ProgressStep[];
  className?: string;
};

export function LoanStatusWidget({
  status,
  applicationNumber,
  productName,
  progressSteps,
  className,
}: LoanStatusWidgetProps) {
  if (!status) {
    return (
      <section className={cn("card-surface p-6 md:p-8", className)}>
        <h2 className="heading-secondary text-lg">Loan Status</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          No active application. Browse loan products to get started.
        </p>
      </section>
    );
  }

  const steps = progressSteps ?? buildProgressSteps(status);

  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      <div className="border-b border-brand-border bg-brand-navy px-6 py-5 text-white md:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Current Loan Status
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">
            {APPLICATION_STATUS_LABELS[status]}
          </h2>
          <ApplicationStatusBadge status={status} />
        </div>
        {applicationNumber ? (
          <p className="mt-2 text-sm text-white/60">
            {applicationNumber}
            {productName ? ` · ${productName}` : ""}
          </p>
        ) : null}
      </div>
      <div className="p-6 md:p-8">
        <ProgressTracker steps={steps} />
      </div>
    </section>
  );
}
