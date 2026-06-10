import { calculateApplicationScores } from "@/lib/applications/engine/scoring";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { cn } from "@/lib/utils";
import type { ApplicationScores } from "@/types/application-details";

type ApplicationScoringPanelProps = {
  scores?: ApplicationScores;
  financialInfo: Record<string, unknown>;
  requestedAmount: number;
  className?: string;
};

function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "amber" | "navy";
}) {
  const toneClass = {
    blue: "bg-brand-blue",
    green: "bg-brand-success",
    amber: "bg-brand-warning",
    navy: "bg-brand-navy",
  }[tone];

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold text-brand-navy">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-brand-border/60">
        <div
          className={cn("h-full rounded-full transition-all", toneClass)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export function ApplicationScoringPanel({
  scores,
  financialInfo,
  requestedAmount,
  className,
}: ApplicationScoringPanelProps) {
  const computed =
    scores ??
    calculateApplicationScores({
      monthlyIncome: Number(financialInfo.monthlyIncome ?? 0),
      monthlyExpenses: Number(financialInfo.monthlyExpenses ?? 0),
      existingDebt: Number(financialInfo.existingDebt ?? 0),
      requestedAmount,
      employmentStatus: String(financialInfo.employmentStatus ?? ""),
    });

  const finalTone =
    computed.finalScore >= 75
      ? "green"
      : computed.finalScore >= 50
        ? "amber"
        : "blue";

  return (
    <section className={cn("card-surface p-6 md:p-8", className)}>
      <SectionHeader
        title="Application Scoring"
        description="Automated risk assessment based on income, employment, and debt profile."
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <ScoreBar label="Risk Score" value={computed.riskScore} tone="amber" />
        <ScoreBar label="Income Score" value={computed.incomeScore} tone="blue" />
        <ScoreBar
          label="Employment Score"
          value={computed.employmentScore}
          tone="navy"
        />
        <ScoreBar label="Final Score" value={computed.finalScore} tone={finalTone} />
      </div>
      {scores?.scoredAt ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Last scored {new Date(scores.scoredAt).toLocaleString()}
        </p>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          Preview scores — recalculate after submission to persist.
        </p>
      )}
    </section>
  );
}
