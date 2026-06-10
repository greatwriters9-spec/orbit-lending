import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { formatShortDate } from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { FinanceApplicationSummary } from "@/types/finance";

type ApplicationsQueueTableProps = {
  applications: FinanceApplicationSummary[];
  className?: string;
};

export function ApplicationsQueueTable({
  applications,
  className,
}: ApplicationsQueueTableProps) {
  if (applications.length === 0) {
    return (
      <div className={cn("card-surface px-6 py-12 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          No applications match the current filter.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("card-surface overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-brand-border bg-brand-background/60">
            <tr>
              <th className="px-6 py-4 font-semibold text-brand-navy">Application</th>
              <th className="px-6 py-4 font-semibold text-brand-navy">Applicant</th>
              <th className="px-6 py-4 font-semibold text-brand-navy">Product</th>
              <th className="px-6 py-4 font-semibold text-brand-navy">Amount</th>
              <th className="px-6 py-4 font-semibold text-brand-navy">Status</th>
              <th className="px-6 py-4 font-semibold text-brand-navy">Updated</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-brand-background/40">
                <td className="px-6 py-4 font-medium text-brand-navy">
                  {app.applicationNumber}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{app.applicantName}</td>
                <td className="px-6 py-4 text-muted-foreground">{app.productName}</td>
                <td className="px-6 py-4 font-medium text-brand-navy">
                  {formatCurrency(app.requestedAmount)}
                </td>
                <td className="px-6 py-4">
                  <ApplicationStatusBadge status={app.status} />
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {formatShortDate(app.updatedAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/finance/applications/${app.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
                  >
                    Review
                    <ArrowRight className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
