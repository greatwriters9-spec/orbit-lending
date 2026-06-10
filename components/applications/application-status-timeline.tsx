import { Check } from "lucide-react";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import {
  APPLICATION_STATUS_LABELS,
  formatApplicationDate,
} from "@/lib/applications/status-utils";
import { cn } from "@/lib/utils";
import type { ApplicationStatusEntry } from "@/types/application-details";

type ApplicationStatusTimelineProps = {
  entries: ApplicationStatusEntry[];
  className?: string;
};

export function ApplicationStatusTimeline({
  entries,
  className,
}: ApplicationStatusTimelineProps) {
  return (
    <section className={cn("card-surface p-6 md:p-8", className)}>
      <div className="mb-6">
        <h2 className="heading-secondary text-lg">Status History</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor status changes and updates throughout your application review.
        </p>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute top-3 bottom-3 left-[15px] w-px bg-brand-border"
        />
        <ul className="space-y-6">
          {entries.map((entry, index) => {
            const isLast = index === entries.length - 1;

            return (
              <li key={entry.id} className="relative flex gap-4 pl-0">
                <div
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                    isLast
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-brand-blue/30 bg-white text-brand-blue",
                  )}
                >
                  <Check className="size-3.5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ApplicationStatusBadge status={entry.status} />
                    <time className="text-xs text-muted-foreground">
                      {formatApplicationDate(entry.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 text-sm font-medium text-brand-navy">
                    {APPLICATION_STATUS_LABELS[entry.status]}
                  </p>
                  {entry.note ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {entry.note}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
