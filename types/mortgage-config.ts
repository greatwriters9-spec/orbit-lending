export const DEFAULT_DOWN_PAYMENT_TIERS = [5, 10, 15, 20, 25] as const;

/** Term lengths offered during client onboarding (months). */
export const STANDARD_ONBOARDING_TERM_MONTHS = [180, 240, 300, 360] as const;

export type MortgageTermConfig = {
  id: string;
  label: string;
  termMonths: number;
  interestRate: number;
  isPrimary?: boolean;
  /** Interest rate (%) by down payment tier key: "5", "10", "15", "20", "25" */
  tierRates?: Partial<Record<DownPaymentTierKey, number>>;
};

export type DownPaymentTierKey = "5" | "10" | "15" | "20" | "25";

export type MortgageConfig = {
  productName: string;
  description: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  maxLtv: number;
  status: "active" | "hidden";
  terms: MortgageTermConfig[];
};

export const MORTGAGE_SETTINGS_KEY = "mortgage";

const TIER_RATE_STEP = 0.08;

function buildDefaultTierRates(baseRate: number): Record<DownPaymentTierKey, number> {
  return {
    "5": baseRate,
    "10": roundRate(baseRate - TIER_RATE_STEP),
    "15": roundRate(baseRate - TIER_RATE_STEP * 2),
    "20": roundRate(baseRate - TIER_RATE_STEP * 3),
    "25": roundRate(baseRate - TIER_RATE_STEP * 4),
  };
}

function roundRate(value: number): number {
  return Math.max(0, Math.round(value * 1000) / 1000);
}

export function downPaymentTierKey(percent: number): DownPaymentTierKey {
  const match = DEFAULT_DOWN_PAYMENT_TIERS.find((tier) => tier === percent);
  return String(match ?? 5) as DownPaymentTierKey;
}

export function getTierRatesForTerm(
  term: MortgageTermConfig,
): Record<DownPaymentTierKey, number> {
  const defaults = buildDefaultTierRates(term.interestRate);
  return {
    "5": term.tierRates?.["5"] ?? defaults["5"],
    "10": term.tierRates?.["10"] ?? defaults["10"],
    "15": term.tierRates?.["15"] ?? defaults["15"],
    "20": term.tierRates?.["20"] ?? defaults["20"],
    "25": term.tierRates?.["25"] ?? defaults["25"],
  };
}

export const DEFAULT_MORTGAGE_CONFIG: MortgageConfig = {
  productName: "Home Mortgage",
  description:
    "Competitive fixed-rate mortgage financing for primary residences, refinancing, and investment properties.",
  minLoanAmount: 50000,
  maxLoanAmount: 2_000_000,
  maxLtv: 80,
  status: "active",
  terms: [
    {
      id: "fixed-30",
      label: "30-Year Fixed",
      termMonths: 360,
      interestRate: 6.99,
      isPrimary: true,
      tierRates: {
        "5": 7.25,
        "10": 7.05,
        "15": 6.92,
        "20": 6.83,
        "25": 6.69,
      },
    },
    {
      id: "fixed-25",
      label: "25-Year Fixed",
      termMonths: 300,
      interestRate: 6.89,
      tierRates: {
        "5": 7.15,
        "10": 6.95,
        "15": 6.82,
        "20": 6.73,
        "25": 6.59,
      },
    },
    {
      id: "fixed-20",
      label: "20-Year Fixed",
      termMonths: 240,
      interestRate: 6.79,
      tierRates: {
        "5": 7.05,
        "10": 6.85,
        "15": 6.72,
        "20": 6.63,
        "25": 6.49,
      },
    },
    {
      id: "fixed-15",
      label: "15-Year Fixed",
      termMonths: 180,
      interestRate: 6.75,
      tierRates: {
        "5": 6.99,
        "10": 6.79,
        "15": 6.66,
        "20": 6.57,
        "25": 6.43,
      },
    },
  ],
};

/** Minimum down payment (%) clients may choose, derived from max LTV. */
export function minDownPaymentPercentFromConfig(config: MortgageConfig): number {
  const ltv = Math.min(100, Math.max(1, config.maxLtv));
  return Math.round((100 - ltv) * 100) / 100;
}

/** Down payment tier buttons/options available to clients for the current LTV. */
export function getAvailableDownPaymentTiers(
  config: MortgageConfig,
): (typeof DEFAULT_DOWN_PAYMENT_TIERS)[number][] {
  const minimum = minDownPaymentPercentFromConfig(config);
  return DEFAULT_DOWN_PAYMENT_TIERS.filter((tier) => tier >= minimum);
}

/** Standard mortgage terms shown in onboarding, ordered shortest to longest. */
export function getStandardMortgageTerms(config: MortgageConfig): MortgageTermConfig[] {
  const normalized = normalizeMortgageConfig(config);
  return STANDARD_ONBOARDING_TERM_MONTHS.map((months) =>
    normalized.terms.find((term) => term.termMonths === months),
  ).filter((term): term is MortgageTermConfig => Boolean(term));
}

/** Down payment fraction (0-1) implied by the configured max LTV. */
export function downPaymentRateFromConfig(config: MortgageConfig): number {
  return minDownPaymentPercentFromConfig(config) / 100;
}

/** The term used to anchor pre-qualification when no client preference exists. */
export function getPrimaryMortgageTerm(
  config: MortgageConfig,
): MortgageTermConfig | null {
  if (config.terms.length === 0) {
    return null;
  }
  return (
    config.terms.find((term) => term.isPrimary) ??
    config.terms.reduce((longest, term) =>
      term.termMonths > longest.termMonths ? term : longest,
    )
  );
}

export function resolveMortgageTermByMonths(
  config: MortgageConfig,
  termMonths: number,
): MortgageTermConfig | null {
  const exact = config.terms.find((term) => term.termMonths === termMonths);
  if (exact) {
    return exact;
  }
  return null;
}

export function normalizeMortgageConfig(config: MortgageConfig): MortgageConfig {
  const mergedTerms = [...config.terms];

  for (const defaultTerm of DEFAULT_MORTGAGE_CONFIG.terms) {
    if (!mergedTerms.some((term) => term.termMonths === defaultTerm.termMonths)) {
      mergedTerms.push(defaultTerm);
    }
  }

  const terms = mergedTerms.map((term) => ({
    ...term,
    tierRates: getTierRatesForTerm(term),
  }));

  const hasPrimary = terms.some((term) => term.isPrimary);
  if (!hasPrimary && terms.length > 0) {
    const primaryCandidate =
      terms.find((term) => term.termMonths === 360) ?? terms[0];
    for (const term of terms) {
      term.isPrimary = term.id === primaryCandidate.id;
    }
  }

  return { ...config, terms };
}
