import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LoanProductRequirement } from "@/types/loans";

type LoanRequirementsListProps = {
  requirements: LoanProductRequirement[];
  className?: string;
};

export function LoanRequirementsList({
  requirements,
  className,
}: LoanRequirementsListProps) {
  return (
    <ul className={cn("space-y-4", className)}>
      {requirements.map((requirement) => (
        <li
          key={requirement.id}
          className="flex items-start gap-3 rounded-xl border border-brand-border bg-brand-background/60 px-4 py-3.5"
        >
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
              requirement.required
                ? "bg-brand-blue/10 text-brand-blue"
                : "bg-muted text-muted-foreground",
            )}
          >
            {requirement.required ? (
              <Check className="size-3" strokeWidth={2.5} />
            ) : (
              <Circle className="size-3" strokeWidth={2} />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-navy">
              {requirement.requirementName}
              {!requirement.required ? (
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  Optional
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {requirement.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
