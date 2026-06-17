import { CreditCard } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/application-details";

type ActiveMortgageStatCardProps = {
  value: string;
  description: string;
  trend?: string;
  trendTone?: "positive" | "neutral" | "warning";
  status?: ApplicationStatus;
  statusLabel: string;
  applicationNumber?: string;
  productName?: string;
  className?: string;
};

export function ActiveMortgageStatCard({
  value,
  description,
  trend,
  trendTone = "neutral",
  status,
  statusLabel,
  applicationNumber,
  productName,
  className,
}: ActiveMortgageStatCardProps) {
  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-brand-success/20 bg-brand-success/[0.03] p-6 shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] md:p-7",
        className,
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Active Mortgage
          </p>
          <p className="mt-3 text-[28px] font-bold leading-[1.1] tabular-nums text-brand-navy">{value}</p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-success/10 text-brand-success ring-1 ring-brand-success/15">
          <CreditCard className="size-5" strokeWidth={1.75} />
        </div>
      </div>

      <p className="type-body mt-4 text-muted-foreground">{description}</p>

      <div className="relative mt-4 flex-1 rounded-xl border border-brand-border bg-white px-3.5 py-3">
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Mortgage Status
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold text-brand-navy">{statusLabel}</p>
          {status ? <ApplicationStatusBadge status={status} /> : null}
        </div>
        {applicationNumber ? (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            {applicationNumber}
            {productName ? ` · ${productName}` : ""}
          </p>
        ) : null}
      </div>

      {trend ? (
        <p
          className={cn(
            "relative mt-3 text-xs font-semibold",
            trendTone === "positive"
              ? "text-brand-success"
              : trendTone === "warning"
                ? "text-brand-warning"
                : "text-brand-blue",
          )}
        >
          {trend}
        </p>
      ) : null}
    </div>
  );
}
