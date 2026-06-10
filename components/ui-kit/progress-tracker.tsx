import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProgressStep } from "@/types/dashboard";

type ProgressTrackerProps = {
  steps: ProgressStep[];
  className?: string;
  showSummary?: boolean;
};

export function ProgressTracker({
  steps,
  className,
  showSummary = true,
}: ProgressTrackerProps) {
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const currentStep = steps.find((s) => s.status === "current");
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={cn("w-full space-y-7", className)}>
      {showSummary ? (
        <div className="flex flex-col gap-4 rounded-xl border border-brand-border bg-brand-background/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              Lifecycle Status
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-navy">
              {currentStep
                ? `Currently: ${currentStep.label}`
                : "Application complete"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {completedCount} of {steps.length} stages completed
            </p>
          </div>
          <div className="flex items-center gap-4 sm:min-w-[200px]">
            <div className="hidden h-2.5 flex-1 overflow-hidden rounded-full bg-brand-border sm:block">
              <div
                className="h-full rounded-full bg-brand-blue transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold tracking-tight text-brand-blue tabular-nums">
                {progressPercent}%
              </span>
              <p className="text-[11px] font-medium text-muted-foreground">
                Complete
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[780px] items-start justify-between px-1">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";

            return (
              <div
                key={step.id}
                className="relative flex flex-1 flex-col items-center"
              >
                {!isLast ? (
                  <div
                    aria-hidden
                    className={cn(
                      "absolute top-5 left-[calc(50%+20px)] h-0.5 w-[calc(100%-40px)]",
                      isCompleted ? "bg-brand-blue" : "bg-brand-border",
                    )}
                  />
                ) : null}

                <div
                  className={cn(
                    "relative z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted &&
                      "border-brand-blue bg-brand-blue text-white shadow-[var(--shadow-sidebar-active)]",
                    isCurrent &&
                      "size-11 border-brand-blue bg-white text-brand-blue shadow-[0_0_0_5px_rgba(37,99,235,0.1)]",
                    step.status === "upcoming" &&
                      "border-brand-border bg-white text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <span
                      className={cn(
                        "rounded-full",
                        isCurrent ? "size-2.5 bg-brand-blue" : "size-2 bg-brand-border",
                      )}
                    />
                  )}
                </div>

                <p
                  className={cn(
                    "mt-3.5 max-w-[92px] text-center text-[11px] leading-tight font-medium",
                    isCompleted || isCurrent
                      ? "text-brand-navy"
                      : "text-muted-foreground",
                    isCurrent && "font-semibold text-brand-blue",
                  )}
                >
                  {step.label}
                </p>

                {isCurrent ? (
                  <span className="mt-1 rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-brand-blue uppercase">
                    Current
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
