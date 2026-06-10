import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/lib/loans/wizard-config";

type WizardProgressProps = {
  currentStep: number;
  className?: string;
};

export function WizardProgress({ currentStep, className }: WizardProgressProps) {
  const completedCount = Math.max(0, currentStep - 1);
  const progressPercent = Math.round((completedCount / WIZARD_STEPS.length) * 100);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Application Progress
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-navy">
            Step {currentStep} of {WIZARD_STEPS.length}:{" "}
            {WIZARD_STEPS[currentStep - 1]?.label}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:min-w-[180px]">
          <div className="hidden h-2 flex-1 overflow-hidden rounded-full bg-brand-border sm:block">
            <div
              className="h-full rounded-full bg-brand-blue transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-brand-blue tabular-nums">
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-[680px] gap-2">
          {WIZARD_STEPS.map((step) => {
            const isComplete = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <li
                key={step.id}
                className={cn(
                  "flex flex-1 flex-col items-center rounded-xl border px-2 py-3 text-center transition-colors",
                  isComplete && "border-brand-blue/20 bg-brand-blue/5",
                  isCurrent && "border-brand-blue bg-white shadow-[var(--shadow-card)]",
                  !isComplete && !isCurrent && "border-brand-border bg-brand-background/50",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                    isComplete && "bg-brand-blue text-white",
                    isCurrent && "bg-brand-blue/10 text-brand-blue",
                    !isComplete && !isCurrent && "bg-brand-border text-muted-foreground",
                  )}
                >
                  {step.id}
                </span>
                <span
                  className={cn(
                    "mt-2 text-[10px] leading-tight font-medium sm:text-[11px]",
                    isCurrent ? "text-brand-blue" : "text-muted-foreground",
                  )}
                >
                  {step.shortLabel}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
