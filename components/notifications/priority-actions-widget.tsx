import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PriorityAction } from "@/types/notifications";

type PriorityActionsWidgetProps = {
  actions: PriorityAction[];
  className?: string;
};

const priorityStyles = {
  critical: "border-brand-danger/30 bg-brand-danger/5",
  high: "border-brand-warning/30 bg-brand-warning/5",
  normal: "border-brand-border bg-brand-background/50",
};

export function PriorityActionsWidget({
  actions,
  className,
}: PriorityActionsWidgetProps) {
  if (actions.length === 0) {
    return (
      <section className={cn("card-surface p-6 md:p-8", className)}>
        <h2 className="heading-secondary text-lg">Priority Actions</h2>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <CheckCircle2 className="size-5 text-brand-success" />
          You&apos;re all caught up — no actions required right now.
        </div>
      </section>
    );
  }

  return (
    <section className={cn("card-surface p-6 md:p-8", className)}>
      <h2 className="heading-secondary text-lg">Priority Actions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Items that need your attention to keep your application moving.
      </p>
      <ul className="mt-5 space-y-3">
        {actions.slice(0, 5).map((action) => (
          <li key={action.id}>
            <Link
              href={action.href}
              className={cn(
                "group flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors hover:border-brand-blue/40",
                priorityStyles[action.priority],
              )}
            >
              <AlertCircle
                className={cn(
                  "size-5 shrink-0",
                  action.priority === "critical"
                    ? "text-brand-danger"
                    : action.priority === "high"
                      ? "text-brand-warning"
                      : "text-brand-blue",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-navy">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-blue" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
