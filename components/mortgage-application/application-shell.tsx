import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Clock3 } from "lucide-react";

import { CompanyLogo } from "@/components/company/company-logo";
import { cn } from "@/lib/utils";
import {
  calculateApplicationProgress,
  formatEstimatedTime,
} from "@/lib/mortgage-application/progress";
import type { ApplicationProgress } from "@/types/mortgage-full-application";

type ApplicationShellProps = {
  children: ReactNode;
  progress: ApplicationProgress;
  onBack?: () => void;
  showBack?: boolean;
  saveState?: "idle" | "saving" | "saved" | "error";
  className?: string;
};

export function ApplicationShell({
  children,
  progress,
  onBack,
  showBack = true,
  saveState = "idle",
  className,
}: ApplicationShellProps) {
  const { percent, estimatedMinutesRemaining } =
    calculateApplicationProgress(progress);

  return (
    <div className={cn("flex min-h-screen flex-col bg-white", className)}>
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-[72px] max-w-4xl items-center justify-between px-4 md:px-8">
          <CompanyLogo href="/dashboard" size="sm" />
          <div className="hidden items-center gap-2 text-xs font-medium text-brand-success md:flex">
            {saveState === "saving" ? (
              <span className="text-muted-foreground">Saving...</span>
            ) : saveState === "saved" ? (
              <>
                <CheckCircle2 className="size-4" />
                Saved Automatically
              </>
            ) : saveState === "error" ? (
              <span className="text-brand-danger">Save failed</span>
            ) : progress.lastSavedAt ? (
              <>
                <CheckCircle2 className="size-4" />
                Saved Automatically
              </>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] bg-[#F8FAFC]">
          <div className="mx-auto max-w-4xl px-4 py-4 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Application Progress
                </p>
                <p className="mt-1 text-lg font-bold text-brand-navy">
                  {percent}% Complete
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4 shrink-0" />
                <span>
                  Estimated Time Remaining:{" "}
                  {formatEstimatedTime(estimatedMinutesRemaining)}
                </span>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-brand-blue transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 pb-28 md:px-8 md:py-14">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-base font-medium text-brand-blue transition-colors hover:text-brand-blue/80"
          >
            <ArrowLeft className="size-5" />
            Previous
          </button>
        ) : null}
        {children}
      </main>
    </div>
  );
}

type ApplicationSectionProps = {
  title: string;
  subtitle?: string;
  explanation?: string;
  children: React.ReactNode;
};

export function ApplicationSection({
  title,
  subtitle,
  explanation,
  children,
}: ApplicationSectionProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {subtitle ? (
        <p className="text-[11px] font-semibold tracking-[0.12em] text-brand-blue uppercase">
          {subtitle}
        </p>
      ) : null}
      <h1 className="heading-primary mt-3 text-3xl leading-tight md:text-4xl">
        {title}
      </h1>
      {explanation ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {explanation}
        </p>
      ) : null}
      <div className="card-surface mt-10 p-6 md:p-8">{children}</div>
    </div>
  );
}

export function ApplicationField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2.5">
      <span className="text-sm font-semibold text-brand-navy md:text-base">
        {label}
      </span>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </label>
  );
}

export const applicationInputClassName =
  "h-14 w-full rounded-2xl border border-brand-border bg-white px-4 text-base text-brand-navy outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15";

export function ApplicationNavButtons({
  onContinue,
  onPrevious,
  continueLabel = "Continue",
  continueDisabled = false,
  isSaving = false,
}: {
  onContinue: () => void;
  onPrevious?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  isSaving?: boolean;
}) {
  return (
    <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      {onPrevious ? (
        <button
          type="button"
          onClick={onPrevious}
          className="inline-flex h-14 items-center justify-center rounded-xl border border-brand-border px-8 text-base font-semibold text-brand-navy transition-colors hover:bg-brand-background"
        >
          Previous
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        disabled={continueDisabled || isSaving}
        onClick={onContinue}
        className="inline-flex h-14 items-center justify-center rounded-xl bg-brand-blue px-10 text-base font-semibold text-white transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
      >
        {isSaving ? "Saving..." : continueLabel}
      </button>
    </div>
  );
}
