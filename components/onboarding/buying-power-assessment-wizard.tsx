"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AssessmentIntro } from "@/components/onboarding/assessment-intro";
import { useCompany } from "@/components/providers/company-provider";
import {
  OnboardingField,
  OnboardingQuestion,
  OnboardingShell,
  OptionCard,
  onboardingInputClassName,
} from "@/components/onboarding/onboarding-shell";
import { OnboardingStateInput } from "@/components/onboarding/onboarding-state-input";
import { Button } from "@/components/ui-kit/button";
import { prepareDraftForPreQualification } from "@/lib/onboarding/assessment-mapper";
import { writeMortgageApplicationDraft } from "@/lib/onboarding/draft-storage";
import { computePreQualification } from "@/lib/onboarding/pre-qualification";
import type { MortgageConfig } from "@/types/mortgage-config";
import type {
  AssessmentEmploymentStatus,
  BuyingGoal,
  CreditRange,
  MilitaryService,
  MortgageApplicationDraft,
} from "@/types/mortgage-onboarding";
import { ONBOARDING_ROUTES } from "@/types/mortgage-onboarding";

type StepKey =
  | "buying-goal"
  | "home-found"
  | "home-price"
  | "property-state"
  | "down-payment"
  | "income"
  | "monthly-debt"
  | "credit-range"
  | "employment"
  | "military";

const STEPS: StepKey[] = [
  "buying-goal",
  "home-found",
  "home-price",
  "property-state",
  "down-payment",
  "income",
  "monthly-debt",
  "credit-range",
  "employment",
  "military",
];

const BUYING_GOAL_OPTIONS: { value: BuyingGoal; label: string }[] = [
  { value: "first_home", label: "Buying my first home" },
  { value: "another_home", label: "Buying another home" },
  { value: "refinancing", label: "Refinancing" },
  { value: "exploring", label: "Exploring my options" },
];

const CREDIT_OPTIONS: { value: CreditRange; label: string }[] = [
  { value: "excellent", label: "Excellent" },
  { value: "very_good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "building", label: "Building Credit" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const EMPLOYMENT_OPTIONS: { value: AssessmentEmploymentStatus; label: string }[] = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "retired", label: "Retired" },
  { value: "military", label: "Military" },
  { value: "other", label: "Other" },
];

const MILITARY_OPTIONS: { value: MilitaryService; label: string }[] = [
  { value: "veteran", label: "Veteran" },
  { value: "active_duty", label: "Active Duty" },
  { value: "reserve", label: "Reserve" },
  { value: "none", label: "None" },
];

function parseCurrencyInput(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function formatCurrencyInput(value: number): string {
  if (!value) return "";
  return value.toLocaleString("en-US");
}

type BuyingPowerAssessmentWizardProps = {
  mortgageConfig: MortgageConfig;
  isLoggedIn?: boolean;
};

export function BuyingPowerAssessmentWizard({
  mortgageConfig,
  isLoggedIn = false,
}: BuyingPowerAssessmentWizardProps) {
  const router = useRouter();
  const { company } = useCompany();
  const [showIntro, setShowIntro] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<MortgageApplicationDraft>({});
  const [isPending, startTransition] = useTransition();

  const step = STEPS[stepIndex];
  const totalSteps = STEPS.length;

  const homePrice = draft.homeFound ? draft.purchasePrice : draft.targetHomePrice;

  const canContinue = useMemo(() => {
    switch (step) {
      case "buying-goal":
        return Boolean(draft.buyingGoal);
      case "home-found":
        return draft.homeFound === true || draft.homeFound === false;
      case "home-price":
        return Boolean(homePrice && homePrice > 0);
      case "property-state":
        return Boolean(draft.targetLocation?.state?.trim());
      case "down-payment":
        return Boolean(draft.plannedDownPayment && draft.plannedDownPayment > 0);
      case "income":
        return Boolean(draft.annualHouseholdIncome && draft.annualHouseholdIncome > 0);
      case "monthly-debt":
        return draft.monthlyDebtPayments !== undefined && draft.monthlyDebtPayments >= 0;
      case "credit-range":
        return Boolean(draft.creditRange);
      case "employment":
        return Boolean(draft.employmentStatus);
      case "military":
        return Boolean(draft.militaryService);
      default:
        return false;
    }
  }, [step, draft, homePrice]);

  const patchDraft = (patch: Partial<MortgageApplicationDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      setShowIntro(true);
      return;
    }
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const handleNext = () => {
    if (stepIndex >= STEPS.length - 1) {
      startTransition(() => {
        const prepared = prepareDraftForPreQualification(draft, mortgageConfig);
        const preQual = computePreQualification(prepared, mortgageConfig);
        if (!preQual) {
          return;
        }

        writeMortgageApplicationDraft({
          ...prepared,
          preQualification: preQual,
          completedAt: new Date().toISOString(),
        });
        router.push(ONBOARDING_ROUTES.congratulations);
      });
      return;
    }

    setStepIndex((current) => current + 1);
  };

  if (showIntro) {
    return <AssessmentIntro onStart={() => setShowIntro(false)} />;
  }

  return (
    <OnboardingShell
      step={stepIndex + 1}
      totalSteps={totalSteps}
      onBack={handleBack}
      showBack
      isLoggedIn={isLoggedIn}
      stepKey="home-found"
    >
      {step === "buying-goal" ? (
        <OnboardingQuestion
          title={`What brings you to ${company.companyName} today?`}
          subtitle="Home Buying Goal"
        >
          <div className="grid gap-3">
            {BUYING_GOAL_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.buyingGoal === option.value}
                onSelect={() => patchDraft({ buyingGoal: option.value })}
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      {step === "home-found" ? (
        <OnboardingQuestion
          title="Have you already found a home?"
          subtitle="Property Status"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <OptionCard
              label="Yes"
              selected={draft.homeFound === true}
              onSelect={() => patchDraft({ homeFound: true })}
            />
            <OptionCard
              label="No"
              selected={draft.homeFound === false}
              onSelect={() => patchDraft({ homeFound: false })}
            />
          </div>
        </OnboardingQuestion>
      ) : null}

      {step === "home-price" ? (
        <OnboardingQuestion
          title={
            draft.homeFound
              ? "Estimated Purchase Price"
              : "What price range are you considering?"
          }
          subtitle="Property Status"
        >
          <OnboardingField
            label={draft.homeFound ? "Estimated Purchase Price" : "Target Home Price"}
          >
            <input
              inputMode="numeric"
              className={onboardingInputClassName()}
              placeholder="$450,000"
              value={formatCurrencyInput(homePrice ?? 0)}
              onChange={(event) => {
                const amount = parseCurrencyInput(event.target.value);
                if (draft.homeFound) {
                  patchDraft({ purchasePrice: amount });
                } else {
                  patchDraft({ targetHomePrice: amount });
                }
              }}
            />
          </OnboardingField>
        </OnboardingQuestion>
      ) : null}

      {step === "property-state" ? (
        <OnboardingQuestion
          title="Which U.S. state will the property be located in?"
          subtitle="Property Location"
        >
          <OnboardingField label="State">
            <OnboardingStateInput
              value={draft.targetLocation?.state ?? ""}
              onChange={(stateCode) =>
                patchDraft({
                  targetLocation: {
                    city: draft.targetLocation?.city ?? "",
                    state: stateCode,
                    zip: draft.targetLocation?.zip ?? "",
                  },
                })
              }
            />
          </OnboardingField>
        </OnboardingQuestion>
      ) : null}

      {step === "down-payment" ? (
        <OnboardingQuestion
          title="How much do you plan to put down?"
          subtitle="Down Payment"
        >
          <OnboardingField label="Planned Down Payment">
            <input
              inputMode="numeric"
              className={onboardingInputClassName()}
              placeholder="$90,000"
              value={formatCurrencyInput(draft.plannedDownPayment ?? 0)}
              onChange={(event) =>
                patchDraft({ plannedDownPayment: parseCurrencyInput(event.target.value) })
              }
            />
          </OnboardingField>
        </OnboardingQuestion>
      ) : null}

      {step === "income" ? (
        <OnboardingQuestion
          title="What is your estimated annual household income before taxes?"
          subtitle="Annual Household Income"
        >
          <OnboardingField label="Annual Income">
            <input
              inputMode="numeric"
              className={onboardingInputClassName()}
              placeholder="$120,000"
              value={formatCurrencyInput(draft.annualHouseholdIncome ?? 0)}
              onChange={(event) =>
                patchDraft({
                  annualHouseholdIncome: parseCurrencyInput(event.target.value),
                })
              }
            />
          </OnboardingField>
        </OnboardingQuestion>
      ) : null}

      {step === "monthly-debt" ? (
        <OnboardingQuestion
          title="What are your estimated monthly debt payments?"
          subtitle="Monthly Debt"
        >
          <OnboardingField label="Total Monthly Debt Payments">
            <input
              inputMode="numeric"
              className={onboardingInputClassName()}
              placeholder="$800"
              value={formatCurrencyInput(draft.monthlyDebtPayments ?? 0)}
              onChange={(event) =>
                patchDraft({
                  monthlyDebtPayments: parseCurrencyInput(event.target.value),
                })
              }
            />
          </OnboardingField>
          <p className="mt-3 text-sm text-muted-foreground">
            Include auto loans, student loans, credit cards, and personal loans in one
            combined monthly amount.
          </p>
        </OnboardingQuestion>
      ) : null}

      {step === "credit-range" ? (
        <OnboardingQuestion
          title="Which range best describes your credit?"
          subtitle="Estimated Credit"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {CREDIT_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.creditRange === option.value}
                onSelect={() => patchDraft({ creditRange: option.value })}
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      {step === "employment" ? (
        <OnboardingQuestion
          title="Current employment status"
          subtitle="Employment"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {EMPLOYMENT_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.employmentStatus === option.value}
                onSelect={() => patchDraft({ employmentStatus: option.value })}
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      {step === "military" ? (
        <OnboardingQuestion
          title="Have you served in the U.S. military?"
          subtitle="Military Eligibility"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {MILITARY_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={draft.militaryService === option.value}
                onSelect={() => patchDraft({ militaryService: option.value })}
              />
            ))}
          </div>
        </OnboardingQuestion>
      ) : null}

      <div className="mt-10">
        <Button
          type="button"
          disabled={!canContinue || isPending}
          onClick={handleNext}
          className="h-14 w-full rounded-xl bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue/90"
        >
          {stepIndex >= STEPS.length - 1
            ? isPending
              ? "Calculating..."
              : "See My Results"
            : "Continue"}
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </OnboardingShell>
  );
}
