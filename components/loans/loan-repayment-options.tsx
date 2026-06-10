import { CalendarClock, Percent } from "lucide-react";

import { Badge } from "@/components/ui-kit/badge";
import { formatApr, formatTermLabel } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { LoanProductTerm } from "@/types/loans";

type LoanRepaymentOptionsProps = {
  terms: LoanProductTerm[];
  className?: string;
};

export function LoanRepaymentOptions({
  terms,
  className,
}: LoanRepaymentOptionsProps) {
  const activeTerms = terms.filter((term) => term.active);

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {activeTerms.map((term) => (
        <div
          key={term.id}
          className="rounded-xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                Repayment Plan
              </p>
              <p className="mt-2 text-lg font-bold tracking-tight text-brand-navy">
                {formatTermLabel(term)}
              </p>
            </div>
            <Badge className="border-brand-blue/20 bg-brand-blue/10 text-brand-blue">
              {term.repaymentFrequency}
            </Badge>
          </div>

          <div className="mt-5 space-y-3 border-t border-brand-border pt-4">
            <div className="flex items-center gap-2.5 text-sm">
              <Percent className="size-4 text-brand-blue" strokeWidth={1.75} />
              <span className="text-muted-foreground">Interest Rate</span>
              <span className="ml-auto font-semibold text-brand-navy">
                {formatApr(term.interestRate)}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <CalendarClock
                className="size-4 text-brand-blue"
                strokeWidth={1.75}
              />
              <span className="text-muted-foreground">Frequency</span>
              <span className="ml-auto font-semibold text-brand-navy">
                {term.repaymentFrequency}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
