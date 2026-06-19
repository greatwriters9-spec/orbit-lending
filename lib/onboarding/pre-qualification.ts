import { calculateLoanPayment } from "@/lib/loans/calculator";
import { getLoanProductBySlug } from "@/lib/loans/mock-data";
import {
  hasMortgagePreferences,
  resolveDownPaymentPercentFromPreferences,
  resolveHomePriceFromDraft,
  resolveInterestRateForSelection,
  resolveTermConfigFromPreferences,
} from "@/lib/mortgage/preferences";
import {
  DEFAULT_MORTGAGE_CONFIG,
  downPaymentRateFromConfig,
  getPrimaryMortgageTerm,
  normalizeMortgageConfig,
  type MortgageConfig,
  type MortgageTermConfig,
} from "@/types/mortgage-config";
import type {
  MortgageApplicationDraft,
  PreQualificationResult,
} from "@/types/mortgage-onboarding";

const DEFAULT_PRODUCT_SLUG = "home-mortgage";
const MAX_DTI = 0.43;
const HOUSING_RATIO = 0.28;

function mapEmploymentToStatus(type?: string): string {
  switch (type) {
    case "self_employed":
      return "self-employed";
    case "contractor":
      return "contractor";
    case "retired":
      return "retired";
    default:
      return "employed";
  }
}

function resolveHomePrice(draft: MortgageApplicationDraft): number {
  return resolveHomePriceFromDraft(draft);
}

function estimateMaxHomeFromIncome(
  annualIncome: number,
  existingDebtMonthly: number,
  interestRate: number,
  termMonths: number,
  productMax: number,
  downPaymentRate: number,
): number {
  if (annualIncome <= 0) {
    return 0;
  }

  const monthlyIncome = annualIncome / 12;
  const maxHousingPayment = monthlyIncome * HOUSING_RATIO;
  const maxTotalDebtPayment = monthlyIncome * MAX_DTI;
  const availableForMortgage = Math.max(
    0,
    Math.min(maxHousingPayment, maxTotalDebtPayment - existingDebtMonthly),
  );

  const paymentResult = calculateLoanPayment({
    principal: 100_000,
    annualInterestRate: interestRate,
    repaymentPeriod: termMonths,
    repaymentFrequency: "Monthly",
  });

  if (!paymentResult || paymentResult.installmentAmount <= 0) {
    return annualIncome * 3.5;
  }

  const affordableMortgage =
    (availableForMortgage / paymentResult.installmentAmount) * 100_000;
  const incomeCap = affordableMortgage / (1 - downPaymentRate);
  const ruleOfThumbCap = annualIncome * 3.5;

  return Math.min(productMax, Math.max(incomeCap, ruleOfThumbCap * 0.85));
}

function resolveLoanTermId(termMonths: number, fallbackTermId: string): string {
  const product = getLoanProductBySlug(DEFAULT_PRODUCT_SLUG);
  return (
    product?.terms.find((item) => item.repaymentPeriod === termMonths)?.id ??
    fallbackTermId
  );
}

function buildPreQualificationResult(input: {
  draft: MortgageApplicationDraft;
  config: MortgageConfig;
  termConfig: MortgageTermConfig;
  downPaymentRate: number;
  interestRate: number;
  termMonths: number;
}): PreQualificationResult | null {
  const { draft, config, termConfig, downPaymentRate, interestRate, termMonths } =
    input;

  const minLoanAmount = config.minLoanAmount;
  const maxLoanAmount = config.maxLoanAmount;
  const loanTermId = resolveLoanTermId(termMonths, termConfig.id);

  const annualIncome = draft.employment?.annualIncome ?? 0;
  const statedHomePrice = resolveHomePrice(draft);
  const liquidAssets =
    (draft.assets?.checkingBalance ?? 0) +
    (draft.assets?.savingsBalance ?? 0) +
    (draft.assets?.investmentBalance ?? 0);

  const incomeBasedMax = estimateMaxHomeFromIncome(
    annualIncome,
    0,
    interestRate,
    termMonths,
    maxLoanAmount,
    downPaymentRate,
  );

  const assetBasedMax =
    liquidAssets > 0
      ? liquidAssets / downPaymentRate + liquidAssets * 0.5
      : incomeBasedMax;

  const maximumHomePrice = Math.round(
    Math.min(
      maxLoanAmount,
      Math.max(statedHomePrice, incomeBasedMax, assetBasedMax),
    ),
  );

  const effectiveHomePrice =
    statedHomePrice > 0
      ? Math.min(statedHomePrice, maximumHomePrice)
      : maximumHomePrice;

  const estimatedDownPayment = Math.round(effectiveHomePrice * downPaymentRate);
  const estimatedMortgageAmount = Math.max(
    minLoanAmount,
    effectiveHomePrice - estimatedDownPayment,
  );

  const payment = calculateLoanPayment({
    principal: estimatedMortgageAmount,
    annualInterestRate: interestRate,
    repaymentPeriod: termMonths,
    repaymentFrequency: "Monthly",
  });

  return {
    maximumHomePrice,
    estimatedMortgageAmount,
    estimatedDownPayment,
    estimatedMonthlyPayment: payment?.installmentAmount ?? 0,
    interestRate,
    loanTermMonths: termMonths,
    loanTermId,
    loanProductSlug: DEFAULT_PRODUCT_SLUG,
  };
}

/** Original pre-qualification path — used when mortgage preferences are not set. */
function computePreQualificationLegacy(
  draft: MortgageApplicationDraft,
  config: MortgageConfig,
): PreQualificationResult | null {
  const primaryTerm = getPrimaryMortgageTerm(config);
  if (!primaryTerm) {
    return null;
  }

  const downPaymentRate = downPaymentRateFromConfig(config);

  return buildPreQualificationResult({
    draft,
    config,
    termConfig: primaryTerm,
    downPaymentRate,
    interestRate: primaryTerm.interestRate,
    termMonths: primaryTerm.termMonths,
  });
}

function computePreQualificationWithPreferences(
  draft: MortgageApplicationDraft,
  config: MortgageConfig,
): PreQualificationResult | null {
  const preferences = draft.mortgagePreferences;
  if (!preferences || !hasMortgagePreferences(preferences)) {
    return computePreQualificationLegacy(draft, config);
  }

  const termConfig = resolveTermConfigFromPreferences(preferences, config);
  if (!termConfig) {
    return computePreQualificationLegacy(draft, config);
  }

  const homePrice = resolveHomePrice(draft);
  const downPaymentPercent = resolveDownPaymentPercentFromPreferences(
    preferences,
    homePrice,
    config,
  );
  const downPaymentRate = downPaymentPercent / 100;
  const interestRate = resolveInterestRateForSelection(
    termConfig,
    downPaymentPercent,
    config,
  );

  return buildPreQualificationResult({
    draft,
    config,
    termConfig,
    downPaymentRate,
    interestRate,
    termMonths: termConfig.termMonths,
  });
}

export function computePreQualification(
  draft: MortgageApplicationDraft,
  config: MortgageConfig = DEFAULT_MORTGAGE_CONFIG,
): PreQualificationResult | null {
  const normalized = normalizeMortgageConfig(config);

  if (hasMortgagePreferences(draft.mortgagePreferences)) {
    return computePreQualificationWithPreferences(draft, normalized);
  }

  return computePreQualificationLegacy(draft, normalized);
}

export function getEmploymentStatusForScoring(draft: MortgageApplicationDraft) {
  return mapEmploymentToStatus(draft.employment?.employmentType);
}
