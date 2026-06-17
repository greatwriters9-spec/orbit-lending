import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";
import type { DashboardHero as DashboardHeroData } from "@/types/dashboard";

type DashboardHeroProps = DashboardHeroData & {
  className?: string;
  nextActionHref?: string;
  showLoanDetails?: boolean;
};

export function DashboardHero({
  greeting,
  userName = "there",
  standing,
  paymentReminder,
  nextAction,
  nextActionHref = "/get-started",
  showLoanDetails = false,
  className,
}: DashboardHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 md:px-8 md:py-8",
        "shadow-[var(--shadow-elevated)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 size-52 rounded-full bg-brand-blue/8"
      />

      <div className="relative max-w-2xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-white/55">
          <ShieldCheck className="size-3.5" strokeWidth={1.75} />
          <span>Account in good standing</span>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-white/50 uppercase">
            {greeting}
          </p>
          <h1 className="heading-primary-light mt-1.5 text-2xl md:text-[28px]">
            Welcome back, {userName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-[15px]">
            {standing}
          </p>
          <p className="mt-1 text-sm font-medium text-white/80 md:text-[15px]">
            {paymentReminder}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            size="default"
            className="h-10 gap-2 bg-brand-blue px-4 text-white shadow-[var(--shadow-sidebar-active)] hover:bg-brand-blue/90"
            render={<Link href={nextActionHref} />}
          >
            {nextAction}
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Button>
          {showLoanDetails ? (
            <Button
              size="default"
              variant="outline"
              className="h-10 border-white/15 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white"
              render={<Link href="/dashboard/loans" />}
            >
              View mortgage details
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
