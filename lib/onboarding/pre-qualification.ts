import { calculateLoanPayment } from "@/lib/loans/calculator";
import { getLoanProductBySlug } from "@/lib/loans/mock-data";
import type {
  MortgageApplicationDraft,
  PreQualificationResult,
} from "@/types/mortgage-onboarding";

const DEFAULT_PRODUCT_SLUG = "home-mortgage";
const DOWN_PAYMENT_RATE = 0.2;
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
  if (draft.homeFound) {
    return draft.purchasePrice ?? 0;
  }
  return draft.targetHomePrice ?? 0;
}

function estimateMaxHomeFromIncome(
  annualIncome: number,
  existingDebtMonthly: number,
  interestRate: number,
  termMonths: number,
  productMax: number,
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
  const incomeCap = affordableMortgage / (1 - DOWN_PAYMENT_RATE);
  const ruleOfThumbCap = annualIncome * 3.5;

  return Math.min(productMax, Math.max(incomeCap, ruleOfThumbCap * 0.85));
}

export function computePreQualification(
  draft: MortgageApplicationDraft,
): PreQualificationResult | null {
  const product = getLoanProductBySlug(DEFAULT_PRODUCT_SLUG);
  if (!product?.terms.length) {
    return null;
  }

  const term =
    product.terms.find((item) => item.repaymentPeriod === 360) ??
    product.terms[product.terms.length - 1];

  const annualIncome = draft.employment?.annualIncome ?? 0;
  const statedHomePrice = resolveHomePrice(draft);
  const liquidAssets =
    (draft.assets?.checkingBalance ?? 0) +
    (draft.assets?.savingsBalance ?? 0) +
    (draft.assets?.investmentBalance ?? 0);

  const incomeBasedMax = estimateMaxHomeFromIncome(
    annualIncome,
    0,
    term.interestRate,
    term.repaymentPeriod,
    product.maxAmount,
  );

  const assetBasedMax =
    liquidAssets > 0
      ? liquidAssets / DOWN_PAYMENT_RATE + liquidAssets * 0.5
      : incomeBasedMax;

  const maximumHomePrice = Math.round(
    Math.min(
      product.maxAmount,
      Math.max(statedHomePrice, incomeBasedMax, assetBasedMax),
    ),
  );

  const effectiveHomePrice =
    statedHomePrice > 0
      ? Math.min(statedHomePrice, maximumHomePrice)
      : maximumHomePrice;

  const estimatedDownPayment = Math.round(effectiveHomePrice * DOWN_PAYMENT_RATE);
  const estimatedMortgageAmount = Math.max(
    product.minAmount,
    effectiveHomePrice - estimatedDownPayment,
  );

  const payment = calculateLoanPayment({
    principal: estimatedMortgageAmount,
    annualInterestRate: term.interestRate,
    repaymentPeriod: term.repaymentPeriod,
    repaymentFrequency: term.repaymentFrequency,
  });

  return {
    maximumHomePrice,
    estimatedMortgageAmount,
    estimatedDownPayment,
    estimatedMonthlyPayment: payment?.installmentAmount ?? 0,
    interestRate: term.interestRate,
    loanTermMonths: term.repaymentPeriod,
    loanTermId: term.id,
    loanProductSlug: DEFAULT_PRODUCT_SLUG,
  };
}

export function getEmploymentStatusForScoring(draft: MortgageApplicationDraft) {
  return mapEmploymentToStatus(draft.employment?.employmentType);
}
