import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const DISPLAY_STAGES = [
  "Pre-Qualified",
  "Property Search",
  "Underwriting",
  "Funding",
  "Closing",
] as const;

type MortgageJourneyTrackerProps = {
  currentStage?: number;
  className?: string;
};

function mapToDisplayStage(journeyStage: number): number {
  if (journeyStage >= 7) {
    return 5;
  }
  if (journeyStage >= 6) {
    return 4;
  }
  if (journeyStage >= 3) {
    return 3;
  }
  if (journeyStage >= 2) {
    return 2;
  }
  return 1;
}

export function MortgageJourneyTracker({
  currentStage = 1,
  className,
}: MortgageJourneyTrackerProps) {
  const activeDisplayStage = mapToDisplayStage(currentStage);

  return (
    <section className={cn("dashboard-card px-6 py-8 md:px-10", className)}>
      <ol className="mx-auto flex w-full max-w-5xl">
        {DISPLAY_STAGES.map((label, index) => {
          const stageNumber = index + 1;
          const completed = stageNumber < activeDisplayStage;
          const current = stageNumber === activeDisplayStage;
          const isFirst = index === 0;
          const isLast = index === DISPLAY_STAGES.length - 1;

          return (
            <li key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  aria-hidden
                  className={cn(
                    "h-0.5 flex-1",
                    isFirst
                      ? "bg-transparent"
                      : activeDisplayStage >= stageNumber
                        ? "bg-brand-blue"
                        : "bg-brand-border",
                  )}
                />

                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    completed || current
                      ? "size-9 border-brand-blue bg-brand-blue text-white md:size-10"
                      : "size-9 border-brand-border bg-white md:size-10",
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  {completed ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <span
                      className={cn(
                        "rounded-full",
                        current ? "size-2.5 bg-white" : "size-2 bg-brand-border",
                      )}
                    />
                  )}
                </div>

                <div
                  aria-hidden
                  className={cn(
                    "h-0.5 flex-1",
                    isLast
                      ? "bg-transparent"
                      : activeDisplayStage > stageNumber
                        ? "bg-brand-blue"
                        : "bg-brand-border",
                  )}
                />
              </div>

              <p
                className={cn(
                  "mt-4 max-w-[5rem] text-center text-sm font-medium md:max-w-none",
                  current
                    ? "font-semibold text-brand-blue"
                    : completed
                      ? "text-brand-navy"
                      : "text-muted-foreground",
                )}
              >
                {label}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
