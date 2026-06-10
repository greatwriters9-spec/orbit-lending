import { calculateLoanPayment } from "@/lib/loans/calculator";
import type { LoanRepaymentStatus } from "@/types/repayments";

export type ScheduleInstallment = {
  loan_id: string;
  borrower_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  installment_amount: number;
  remaining_balance_before: number;
  remaining_balance_after: number;
  status: LoanRepaymentStatus;
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getPeriodsPerYear(frequency: string): number {
  return frequency.toLowerCase() === "weekly" ? 52 : 12;
}

function addPeriod(baseDate: Date, periodIndex: number, frequency: string): Date {
  const date = new Date(baseDate);
  if (frequency.toLowerCase() === "weekly") {
    date.setDate(date.getDate() + periodIndex * 7);
  } else {
    date.setMonth(date.getMonth() + periodIndex);
  }
  return date;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function resolveInitialStatus(dueDate: string): LoanRepaymentStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  if (due.getTime() === today.getTime()) {
    return "due_today";
  }
  return "upcoming";
}

export function buildRepaymentSchedule(input: {
  loanId: string;
  borrowerId: string;
  principal: number;
  annualInterestRate: number;
  repaymentPeriod: number;
  repaymentFrequency: string;
  fundingDate: Date;
}): ScheduleInstallment[] {
  const calculation = calculateLoanPayment({
    principal: input.principal,
    annualInterestRate: input.annualInterestRate,
    repaymentPeriod: input.repaymentPeriod,
    repaymentFrequency: input.repaymentFrequency,
  });

  if (!calculation) {
    return [];
  }

  const periodsPerYear = getPeriodsPerYear(input.repaymentFrequency);
  const periodicRate = input.annualInterestRate / 100 / periodsPerYear;
  const installmentAmount = calculation.installmentAmount;
  let remainingPrincipal = input.principal;
  let remainingBalance = calculation.totalRepayment;
  const installments: ScheduleInstallment[] = [];

  for (let index = 1; index <= calculation.numberOfPayments; index += 1) {
    const interestAmount =
      periodicRate === 0
        ? 0
        : roundCurrency(remainingPrincipal * periodicRate);
    const principalAmount = roundCurrency(installmentAmount - interestAmount);
    const balanceBefore = roundCurrency(remainingBalance);
    remainingPrincipal = roundCurrency(
      Math.max(remainingPrincipal - principalAmount, 0),
    );
    remainingBalance = roundCurrency(
      Math.max(remainingBalance - installmentAmount, 0),
    );

    const dueDate = formatDate(
      addPeriod(input.fundingDate, index, input.repaymentFrequency),
    );

    installments.push({
      loan_id: input.loanId,
      borrower_id: input.borrowerId,
      installment_number: index,
      due_date: dueDate,
      principal_amount: principalAmount,
      interest_amount: interestAmount,
      installment_amount: installmentAmount,
      remaining_balance_before: balanceBefore,
      remaining_balance_after: remainingBalance,
      status: resolveInitialStatus(dueDate),
    });
  }

  return installments;
}

export function generateLoanNumber(applicationNumber?: string | null): string {
  if (applicationNumber) {
    return applicationNumber;
  }
  return `ORBIT-${Date.now().toString().slice(-8)}`;
}
