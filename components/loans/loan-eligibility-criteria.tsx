import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type LoanEligibilityCriteriaProps = {
  summary: string;
  criteria: string[];
  className?: string;
};

export function LoanEligibilityCriteria({
  summary,
  criteria,
  className,
}: LoanEligibilityCriteriaProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {criteria.map((criterion) => (
          <li key={criterion} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-success/10 text-brand-success">
              <Check className="size-3" strokeWidth={2.5} />
            </span>
            <span className="text-brand-navy/85">{criterion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
