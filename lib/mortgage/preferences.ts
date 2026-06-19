import type { MortgageApplicationDraft, MortgagePreferences } from "@/types/mortgage-onboarding";
import type { MortgageConfig, MortgageTermConfig } from "@/types/mortgage-config";
import {
  DEFAULT_DOWN_PAYMENT_TIERS,
  STANDARD_ONBOARDING_TERM_MONTHS,
  downPaymentTierKey,
  getAvailableDownPaymentTiers,
  getPrimaryMortgageTerm,
  getStandardMortgageTerms,
  getTierRatesForTerm,
  minDownPaymentPercentFromConfig,
  resolveMortgageTermByMonths,
} from "@/types/mortgage-config";

export const ONBOARDING_TERM_OPTIONS = [
  { months: 180, label: "15 Years" },
  { months: 240, label: "20 Years" },
  { months: 300, label: "25 Years" },
  { months: 360, label: "30 Years" },
] as const;

export const DEFAULT_MORTGAGE_TERM_MONTHS = 360;

/** Absolute floor when no admin config is available. */
export const MIN_DOWN_PAYMENT_PERCENT = 5;

export function resolveMinDownPaymentPercent(config?: MortgageConfig): number {
  if (!config) {
    return MIN_DOWN_PAYMENT_PERCENT;
  }
  return minDownPaymentPercentFromConfig(config);
}

export function getOnboardingTermOptions(config?: MortgageConfig) {
  if (!config) {
    return ONBOARDING_TERM_OPTIONS;
  }

  const standardTerms = getStandardMortgageTerms(config);
  if (standardTerms.length === 0) {
    return ONBOARDING_TERM_OPTIONS;
  }

  return STANDARD_ONBOARDING_TERM_MONTHS.map((months) => {
    const term = standardTerms.find((item) => item.termMonths === months);
    const fallback = ONBOARDING_TERM_OPTIONS.find((option) => option.months === months);
    return {
      months,
      label: term?.label ?? fallback?.label ?? `${months / 12} Years`,
    };
  });
}

export function hasMortgagePreferences(
  preferences?: MortgagePreferences,
): preferences is MortgagePreferences {
  if (!preferences) {
    return false;
  }
  const hasTerm = typeof preferences.termMonths === "number" && preferences.termMonths > 0;
  const hasPercent =
    preferences.downPaymentMode === "percent" &&
    typeof preferences.downPaymentPercent === "number";
  const hasCustom =
    preferences.downPaymentMode === "custom" &&
    typeof preferences.downPaymentAmount === "number" &&
    preferences.downPaymentAmount > 0;
  return hasTerm && (hasPercent || hasCustom);
}

export function resolveDownPaymentPercentFromPreferences(
  preferences: MortgagePreferences,
  homePrice: number,
  config?: MortgageConfig,
): number {
  const minimum = resolveMinDownPaymentPercent(config);

  if (preferences.downPaymentMode === "percent") {
    return Math.max(minimum, preferences.downPaymentPercent ?? minimum);
  }

  if (homePrice <= 0 || !preferences.downPaymentAmount) {
    return minimum;
  }

  const percent = (preferences.downPaymentAmount / homePrice) * 100;
  return Math.max(minimum, Math.round(percent * 100) / 100);
}

/** Maps a down payment % to the pricing tier used for rate lookup (floor tier). */
export function resolveDownPaymentTierPercent(
  downPaymentPercent: number,
  config?: MortgageConfig,
): number {
  const tiers = config
    ? getAvailableDownPaymentTiers(config)
    : [...DEFAULT_DOWN_PAYMENT_TIERS];
  const minimum = resolveMinDownPaymentPercent(config);
  const sorted = [...tiers].sort((a, b) => b - a);

  for (const tier of sorted) {
    if (downPaymentPercent >= tier) {
      return tier;
    }
  }

  return sorted.at(-1) ?? minimum;
}

export function resolveInterestRateForSelection(
  term: MortgageTermConfig,
  downPaymentPercent: number,
  config?: MortgageConfig,
): number {
  const tierPercent = resolveDownPaymentTierPercent(downPaymentPercent, config);
  const tierRates = getTierRatesForTerm(term);
  return tierRates[downPaymentTierKey(tierPercent)] ?? term.interestRate;
}

export function resolveTermConfigFromPreferences(
  preferences: MortgagePreferences,
  config: MortgageConfig,
): MortgageTermConfig | null {
  const months = preferences.termMonths ?? DEFAULT_MORTGAGE_TERM_MONTHS;
  return (
    resolveMortgageTermByMonths(config, months) ??
    getPrimaryMortgageTerm(config)
  );
}

export function createDefaultMortgagePreferences(
  config?: MortgageConfig,
): MortgagePreferences {
  const minimum = resolveMinDownPaymentPercent(config);
  const impliedDown =
    config && config.maxLtv > 0 ? Math.max(minimum, 100 - config.maxLtv) : 20;

  const availableTiers = config
    ? getAvailableDownPaymentTiers(config)
    : [...DEFAULT_DOWN_PAYMENT_TIERS];

  const normalizedPercent = availableTiers.includes(
    impliedDown as (typeof DEFAULT_DOWN_PAYMENT_TIERS)[number],
  )
    ? impliedDown
    : (availableTiers[0] ?? minimum);

  return {
    downPaymentMode: "percent",
    downPaymentPercent: normalizedPercent,
    termMonths: DEFAULT_MORTGAGE_TERM_MONTHS,
  };
}

export function validateMortgagePreferences(
  preferences: MortgagePreferences | undefined,
  homePrice: number,
  config?: MortgageConfig,
): string | null {
  const minimum = resolveMinDownPaymentPercent(config);
  const availableTiers = config
    ? getAvailableDownPaymentTiers(config)
    : [...DEFAULT_DOWN_PAYMENT_TIERS];

  if (!preferences?.termMonths) {
    return "Select a mortgage term to continue.";
  }

  const termOptions = getOnboardingTermOptions(config);
  if (!termOptions.some((option) => option.months === preferences.termMonths)) {
    return "Select a valid mortgage term.";
  }

  if (preferences.downPaymentMode === "percent") {
    if (!preferences.downPaymentPercent) {
      return "Select your desired down payment percentage.";
    }
    if (preferences.downPaymentPercent < minimum) {
      return `Minimum down payment is ${minimum}% based on current lending limits.`;
    }
    if (!availableTiers.includes(preferences.downPaymentPercent as (typeof DEFAULT_DOWN_PAYMENT_TIERS)[number])) {
      return `Select a down payment of at least ${minimum}%.`;
    }
    return null;
  }

  if (!preferences.downPaymentAmount || preferences.downPaymentAmount <= 0) {
    return "Enter your desired down payment amount.";
  }

  if (homePrice > 0) {
    const percent = (preferences.downPaymentAmount / homePrice) * 100;
    if (percent < minimum) {
      return `Down payment must be at least ${minimum}% of the home price.`;
    }
  }

  return null;
}

export function resolveHomePriceFromDraft(draft: MortgageApplicationDraft): number {
  if (draft.homeFound) {
    return draft.purchasePrice ?? 0;
  }
  return draft.targetHomePrice ?? 0;
}
