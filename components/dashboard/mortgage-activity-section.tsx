import Link from "next/link";
import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DashboardTransaction } from "@/types/dashboard";
import type { MortgageActivityItem } from "@/types/mortgage-dashboard";

type MortgageActivitySectionProps = {
  activities: MortgageActivityItem[];
  transactions: DashboardTransaction[];
  className?: string;
};

export function MortgageActivitySection({
  activities,
  transactions,
  className,
}: MortgageActivitySectionProps) {
  const timelineItems = activities.length
    ? activities
    : transactions.slice(0, 5).map((tx) => ({
        id: tx.id,
        title: tx.description,
        date: tx.date,
        description: tx.type,
      }));

  return (
    <section className={cn("dashboard-card flex h-full flex-col overflow-hidden", className)}>
      <div className="border-b border-brand-border px-6 py-6 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
              <Activity className="size-5 text-brand-blue" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Recent Activity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your mortgage application progress.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/transactions"
            className="text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue/80"
          >
            View all
          </Link>
        </div>
      </div>

      {timelineItems.length ? (
        <div className="divide-y divide-brand-border">
          {timelineItems.map((item) => (
            <div key={item.id} className="relative px-6 py-5 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-navy">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-xs font-medium text-muted-foreground">
                  {item.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground md:px-8">
          Mortgage activity will appear here as your application progresses.
        </div>
      )}
    </section>
  );
}
