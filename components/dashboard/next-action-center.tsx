import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MortgageDashboardView } from "@/types/mortgage-dashboard";

type NextActionCenterProps = {
  view: MortgageDashboardView;
  className?: string;
};

export function NextActionCenter({ view, className }: NextActionCenterProps) {
  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      <div className="border-b border-brand-border bg-brand-blue/[0.04] px-6 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            <Compass className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight text-brand-navy">Next Action Center</h2>
            <p className="text-sm text-muted-foreground">
              Your most important step based on your current mortgage stage.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 py-6 md:px-8">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Next Step
          </p>
          <h3 className="mt-2 text-xl font-bold text-brand-navy">{view.nextAction.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {view.nextAction.message}
          </p>
        </div>

        {view.nextAction.checklist?.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {view.nextAction.checklist.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-brand-border px-3 py-2.5 text-sm font-medium text-brand-navy"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          href={view.nextAction.buttonHref}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
        >
          {view.nextAction.buttonLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
