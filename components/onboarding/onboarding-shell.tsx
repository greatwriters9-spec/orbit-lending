import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import {
  AskAssistantButton,
  OnboardingFooter,
  OnboardingStepFaq,
  OnboardingTestimonials,
} from "@/components/onboarding/onboarding-chrome";
import type { OnboardingStepKey } from "@/lib/onboarding/faq-content";
import { cn } from "@/lib/utils";

type OnboardingShellProps = {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
  stepKey?: OnboardingStepKey;
  showChrome?: boolean;
  isLoggedIn?: boolean;
};

export function OnboardingShell({
  children,
  step,
  totalSteps,
  onBack,
  showBack = true,
  className,
  stepKey,
  showChrome = true,
  isLoggedIn = false,
}: OnboardingShellProps) {
  const progress = totalSteps > 0 ? Math.round((step / totalSteps) * 100) : 0;

  return (
    <div className={cn("flex min-h-screen flex-col bg-[#F8FAFC]", className)}>
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-[72px] max-w-3xl items-center justify-between px-4 md:px-6">
          <OrbitLogo href="/" size="sm" aria-label="Orbit Mortgage home" />
          <p className="text-xs font-medium text-muted-foreground">
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

      <main className="mx-auto max-w-3xl flex-1 px-4 py-10 pb-44 md:px-6 md:py-14 md:pb-48">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-10 inline-flex items-center gap-2 text-base font-medium text-brand-blue transition-colors hover:text-brand-blue/80"
          >
            <ArrowLeft className="size-5" />
            Back
          </button>
        ) : null}
        {children}
        {showChrome ? (
          <>
            <OnboardingStepFaq stepKey={stepKey} />
            <OnboardingTestimonials step={step} />
          </>
        ) : null}
      </main>

      {showChrome ? (
        <>
          <AskAssistantButton isLoggedIn={isLoggedIn} className="bottom-[5.5rem] md:bottom-[6rem]" />
          <OnboardingFooter />
        </>
      ) : null}
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
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="heading-primary text-center text-3xl leading-tight md:text-4xl lg:text-[2.75rem]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 text-center text-base leading-relaxed text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-12">{children}</div>
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
        "flex min-h-[4.75rem] w-full items-center gap-4 rounded-2xl border px-6 py-5 text-left text-base font-semibold transition-colors md:min-h-20 md:px-7 md:py-6 md:text-lg",
        selected
          ? "border-brand-blue bg-brand-blue/[0.08] text-brand-navy shadow-[0_8px_24px_rgba(37,99,235,0.12)] ring-2 ring-brand-blue/25"
          : "border-[#E5E7EB] bg-white text-brand-navy shadow-sm hover:border-brand-blue/40 hover:shadow-md",
      )}
    >
      <span
        className={cn(
          "size-5 shrink-0 rounded-full border-2 md:size-6",
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
    <label className="block space-y-3">
      <span className="text-base font-semibold text-brand-navy md:text-lg">{label}</span>
      {children}
      {helper ? (
        <span className="block text-sm text-muted-foreground">{helper}</span>
      ) : null}
    </label>
  );
}

export function onboardingInputClassName() {
  return "h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white px-5 text-base text-brand-navy outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 md:h-[3.75rem] md:text-lg";
}
