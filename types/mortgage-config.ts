export type MortgageTermConfig = {
  id: string;
  label: string;
  termMonths: number;
  interestRate: number;
  isPrimary?: boolean;
};

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

export const DEFAULT_MORTGAGE_CONFIG: MortgageConfig = {
  productName: "Home Mortgage",
  description:
    "Competitive fixed-rate mortgage financing for primary residences, refinancing, and investment properties.",
  minLoanAmount: 50000,
  maxLoanAmount: 1500000,
  maxLtv: 80,
  status: "active",
  terms: [
    {
      id: "fixed-30",
      label: "30-Year Fixed",
      termMonths: 360,
      interestRate: 6.99,
      isPrimary: true,
    },
    {
      id: "fixed-15",
      label: "15-Year Fixed",
      termMonths: 180,
      interestRate: 6.75,
    },
  ],
};

/** Down payment fraction (0-1) implied by the configured max LTV. */
export function downPaymentRateFromConfig(config: MortgageConfig): number {
  const ltv = Math.min(100, Math.max(1, config.maxLtv));
  return 1 - ltv / 100;
}

/** The term used to anchor pre-qualification (primary, else longest). */
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
