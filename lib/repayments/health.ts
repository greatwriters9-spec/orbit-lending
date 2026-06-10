import type { LoanHealthRating, LoanRepayment } from "@/types/repayments";

export function calculateLoanHealth(input: {
  schedule: Pick<LoanRepayment, "status">[];
}): { rating: LoanHealthRating; score: number } {
  const actionable = input.schedule.filter(
    (item) => item.status !== "waived",
  );

  if (actionable.length === 0) {
    return { rating: "excellent", score: 100 };
  }

  const paidCount = actionable.filter((item) => item.status === "paid").length;
  const overdueCount = actionable.filter(
    (item) => item.status === "overdue",
  ).length;
  const lateCount = actionable.filter((item) => item.status === "late").length;
  const missedCount = actionable.filter((item) =>
    ["overdue", "late"].includes(item.status),
  ).length;

  let score = 100;
  score -= overdueCount * 18;
  score -= lateCount * 10;
  score -= missedCount * 4;

  const onTimeRatio = paidCount / Math.max(actionable.length, 1);
  score = Math.round(score * 0.6 + onTimeRatio * 40);

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  let rating: LoanHealthRating = "excellent";
  if (score < 50 || overdueCount >= 2) {
    rating = "critical";
  } else if (score < 70 || overdueCount >= 1 || lateCount >= 2) {
    rating = "warning";
  } else if (score < 85 || lateCount >= 1) {
    rating = "good";
  }

  return { rating, score };
}

export function calculateRepaymentProgress(input: {
  totalInstallments: number;
  paidInstallments: number;
}): number {
  if (input.totalInstallments <= 0) {
    return 0;
  }
  return Math.round((input.paidInstallments / input.totalInstallments) * 100);
}
