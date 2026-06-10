import type { LoanCalculatorResult } from "@/types/loan-application";

type CalculateLoanPaymentInput = {
  principal: number;
  annualInterestRate: number;
  repaymentPeriod: number;
  repaymentFrequency: string;
};

function getPeriodsPerYear(frequency: string): number {
  return frequency.toLowerCase() === "weekly" ? 52 : 12;
}

export function calculateLoanPayment({
  principal,
  annualInterestRate,
  repaymentPeriod,
  repaymentFrequency,
}: CalculateLoanPaymentInput): LoanCalculatorResult | null {
  if (principal <= 0 || repaymentPeriod <= 0 || annualInterestRate < 0) {
    return null;
  }

  const periodsPerYear = getPeriodsPerYear(repaymentFrequency);
  const periodicRate = annualInterestRate / 100 / periodsPerYear;
  const numberOfPayments = repaymentPeriod;

  let installmentAmount: number;

  if (periodicRate === 0) {
    installmentAmount = principal / numberOfPayments;
  } else {
    const factor = Math.pow(1 + periodicRate, numberOfPayments);
    installmentAmount = (principal * periodicRate * factor) / (factor - 1);
  }

  const totalRepayment = installmentAmount * numberOfPayments;
  const totalInterest = totalRepayment - principal;

  return {
    installmentAmount: roundCurrency(installmentAmount),
    totalRepayment: roundCurrency(totalRepayment),
    totalInterest: roundCurrency(totalInterest),
    numberOfPayments,
    apr: annualInterestRate,
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatInstallmentLabel(frequency: string): string {
  return frequency.toLowerCase() === "weekly" ? "Weekly Payment" : "Monthly Payment";
}
