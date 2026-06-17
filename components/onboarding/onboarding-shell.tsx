import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { cn } from "@/lib/utils";

type OnboardingShellProps = {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
};

export function OnboardingShell({
  children,
  step,
  totalSteps,
  onBack,
  showBack = true,
  className,
}: OnboardingShellProps) {
  const progress = totalSteps > 0 ? Math.round((step / totalSteps) * 100) : 0;

  return (
    <div className={cn("min-h-screen bg-[#F8FAFC]", className)}>
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-[72px] max-w-3xl items-center justify-between px-4 md:px-6">
          <OrbitLogo href="/" size="sm" aria-label="Orbit Mortgage home" />          <p className="text-xs font-medium text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>
        <div className="h-1 bg-[#E5E7EB]">
          <div
            className="h-full bg-brand-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-brand-blue transition-colors hover:text-brand-blue/80"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        ) : null}
        {children}
      </main>
    </div>
  );
}

type OnboardingQuestionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function OnboardingQuestion({
  title,
  subtitle,
  children,
}: OnboardingQuestionProps) {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="heading-primary text-center text-2xl md:text-3xl">{title}</h1>
      {subtitle ? (
        <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground md:text-base">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-10">{children}</div>
    </div>
  );
}

type OptionCardProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function OptionCard({ label, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-5 py-4 text-left text-sm font-semibold transition-colors md:text-base",
        selected
          ? "border-brand-blue bg-brand-blue/[0.06] text-brand-navy ring-1 ring-brand-blue/20"
          : "border-[#E5E7EB] bg-white text-brand-navy hover:border-brand-blue/30",
      )}
    >
      <span
        className={cn(
          "size-4 shrink-0 rounded-full border-2",
          selected ? "border-brand-blue bg-brand-blue" : "border-[#D1D5DB]",
        )}
      />
      {label}
    </button>
  );
}

type OnboardingFieldProps = {
  label: string;
  children: ReactNode;
  helper?: string;
};

export function OnboardingField({ label, children, helper }: OnboardingFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-brand-navy">{label}</span>
      {children}
      {helper ? (
        <span className="block text-xs text-muted-foreground">{helper}</span>
      ) : null}
    </label>
  );
}

export function onboardingInputClassName() {
  return "h-12 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-brand-navy outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15";
}
