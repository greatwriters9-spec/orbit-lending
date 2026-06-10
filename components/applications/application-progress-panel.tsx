import { ProgressTracker } from "@/components/ui-kit/progress-tracker";
import { cn } from "@/lib/utils";
import type { ProgressStep } from "@/types/dashboard";

type ApplicationProgressPanelProps = {
  steps: ProgressStep[];
  className?: string;
};

export function ApplicationProgressPanel({
  steps,
  className,
}: ApplicationProgressPanelProps) {
  return (
    <section className={cn("card-surface p-6 md:p-8", className)}>
      <div className="mb-6">
        <h2 className="heading-secondary text-lg">
          Application Progress
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your application through each stage of the lending lifecycle.
        </p>
      </div>
      <ProgressTracker steps={steps} />
    </section>
  );
}
