"use client";

import { useMemo } from "react";

import {
  OnboardingField,
  OnboardingQuestion,
  onboardingInputClassName,
} from "@/components/onboarding/onboarding-shell";
import {
  DEFAULT_MORTGAGE_TERM_MONTHS,
  getOnboardingTermOptions,
  resolveInterestRateForSelection,
  resolveMinDownPaymentPercent,
  resolveTermConfigFromPreferences,
} from "@/lib/mortgage/preferences";
import {
  getAvailableDownPaymentTiers,
  normalizeMortgageConfig,
  type MortgageConfig,
} from "@/types/mortgage-config";
import type { MortgageApplicationDraft, MortgagePreferences } from "@/types/mortgage-onboarding";
import { cn } from "@/lib/utils";

type OnboardingMortgagePreferencesStepProps = {
  draft: MortgageApplicationDraft;
  homePrice: number;
  mortgageConfig: MortgageConfig;
  onChange: (preferences: MortgagePreferences) => void;
};

function parseCurrency(value: string): number {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmountFieldValue(value?: number): string {
  return value && value > 0 ? String(value) : "";
}

export function OnboardingMortgagePreferencesStep({
  draft,
  homePrice,
  mortgageConfig,
  onChange,
}: OnboardingMortgagePreferencesStepProps) {
  const config = useMemo(
    () => normalizeMortgageConfig(mortgageConfig),
    [mortgageConfig],
  );

  const minimumDownPayment = resolveMinDownPaymentPercent(config);
  const availableTiers = getAvailableDownPaymentTiers(config);
  const termOptions = getOnboardingTermOptions(config);

  const preferences = draft.mortgagePreferences ?? {
    downPaymentMode: "percent" as const,
    downPaymentPercent: availableTiers[0] ?? minimumDownPayment,
    termMonths: DEFAULT_MORTGAGE_TERM_MONTHS,
  };

  const customPercent =
    homePrice > 0 && preferences.downPaymentAmount
      ? Math.round((preferences.downPaymentAmount / homePrice) * 10000) / 100
      : null;

  const selectedPercentLabel = useMemo(() => {
    if (preferences.downPaymentMode === "percent") {
      return `${preferences.downPaymentPercent ?? minimumDownPayment}%`;
    }
    if (customPercent !== null) {
      return `${customPercent}% of home price`;
    }
    return "Custom amount";
  }, [
    customPercent,
    minimumDownPayment,
    preferences.downPaymentMode,
    preferences.downPaymentPercent,
  ]);

  const estimatedRate = useMemo(() => {
    const termConfig = resolveTermConfigFromPreferences(preferences, config);
    if (!termConfig) {
      return null;
    }

    const downPercent =
      preferences.downPaymentMode === "percent"
        ? (preferences.downPaymentPercent ?? minimumDownPayment)
        : customPercent ?? minimumDownPayment;

    return resolveInterestRateForSelection(termConfig, downPercent, config);
  }, [config, customPercent, minimumDownPayment, preferences]);

  function updatePreferences(patch: Partial<MortgagePreferences>) {
    onChange({ ...preferences, ...patch });
  }

  return (
    <OnboardingQuestion
      title="Mortgage Preferences"
      subtitle="Choose your desired down payment and loan term. These selections help us personalize your pre-qualification estimate."
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-base font-semibold text-brand-navy md:text-lg">
            Desired Down Payment
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Minimum down payment is {minimumDownPayment}% based on current lending
            limits. A larger down payment may qualify you for a lower interest rate.
          </p>

          <div
            className={cn(
              "mt-5 grid gap-3",
              availableTiers.length <= 3
                ? "grid-cols-2 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-5",
            )}
          >
            {availableTiers.map((percent) => {
              const selected =
                preferences.downPaymentMode === "percent" &&
                preferences.downPaymentPercent === percent;

              return (
                <button
                  key={percent}
                  type="button"
                  onClick={() =>
                    updatePreferences({
                      downPaymentMode: "percent",
                      downPaymentPercent: percent,
                      downPaymentAmount: undefined,
                    })
                  }
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-center text-base font-semibold transition-colors",
                    selected
                      ? "border-brand-blue bg-brand-blue/[0.08] text-brand-navy ring-2 ring-brand-blue/25"
                      : "border-[#E5E7EB] bg-white text-brand-navy hover:border-brand-blue/40",
                  )}
                >
                  {percent}%
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="downPaymentMode"
                checked={preferences.downPaymentMode === "custom"}
                onChange={() =>
                  updatePreferences({
                    downPaymentMode: "custom",
                    downPaymentPercent: undefined,
                  })
                }
                className="size-4 accent-brand-blue"
              />
              <span className="text-base font-semibold text-brand-navy">
                Enter a custom amount
              </span>
            </label>
            {preferences.downPaymentMode === "custom" ? (
              <div className="mt-4">
                <OnboardingField
                  label="Custom Down Payment"
                  helper={
                    homePrice > 0 && customPercent !== null
                      ? `Equals ${customPercent}% of your ${homePrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} home price`
                      : `Enter at least ${minimumDownPayment}% of the home price`
                  }
                >
                  <input
                    className={onboardingInputClassName()}
                    inputMode="decimal"
                    value={formatAmountFieldValue(preferences.downPaymentAmount)}
                    onChange={(event) =>
                      updatePreferences({
                        downPaymentMode: "custom",
                        downPaymentAmount: parseCurrency(event.target.value),
                        downPaymentPercent: undefined,
                      })
                    }
                    placeholder="$70,000"
                  />
                </OnboardingField>
              </div>
            ) : null}
          </div>
        </section>

        <section>
          <OnboardingField
            label="Mortgage Term"
            helper="Select the number of years you'd like to repay your mortgage."
          >
            <select
              className={cn(onboardingInputClassName(), "appearance-none")}
              value={preferences.termMonths ?? DEFAULT_MORTGAGE_TERM_MONTHS}
              onChange={(event) =>
                updatePreferences({ termMonths: Number(event.target.value) })
              }
            >
              {termOptions.map((option) => (
                <option key={option.months} value={option.months}>
                  {option.label}
                </option>
              ))}
            </select>
          </OnboardingField>
        </section>

        <div className="rounded-2xl border border-brand-blue/15 bg-brand-blue/[0.05] px-5 py-4 text-sm leading-relaxed text-brand-navy/80">
          <span className="font-semibold text-brand-navy">Your selections:</span>{" "}
          {selectedPercentLabel} down payment on a{" "}
          {Math.round((preferences.termMonths ?? DEFAULT_MORTGAGE_TERM_MONTHS) / 12)}
          -year fixed mortgage
          {estimatedRate !== null ? (
            <>
              {" "}
              at an estimated{" "}
              <span className="font-semibold text-brand-navy">
                {estimatedRate.toFixed(2)}%
              </span>{" "}
              interest rate.
            </>
          ) : (
            "."
          )}
        </div>
      </div>
    </OnboardingQuestion>
  );
}
