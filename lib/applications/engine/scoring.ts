import type { ApplicationScoreInput, ApplicationScores } from "@/types/application-details";

function clampScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100;
}

const EMPLOYMENT_WEIGHTS: Record<string, number> = {
  employed: 90,
  "self-employed": 75,
  contractor: 70,
  retired: 65,
  student: 45,
  unemployed: 25,
};

export function calculateApplicationScores(
  input: ApplicationScoreInput,
): ApplicationScores {
  const monthlyIncome = Number(input.monthlyIncome ?? 0);
  const monthlyExpenses = Number(input.monthlyExpenses ?? 0);
  const existingDebt = Number(input.existingDebt ?? 0);
  const requestedAmount = Number(input.requestedAmount ?? 0);
  const employmentStatus = String(input.employmentStatus ?? "").toLowerCase();

  const disposableIncome = Math.max(0, monthlyIncome - monthlyExpenses);
  const debtToIncome =
    monthlyIncome > 0 ? (existingDebt + requestedAmount / 12) / monthlyIncome : 1;

  const incomeScore = clampScore(
    monthlyIncome <= 0
      ? 0
      : 40 +
          Math.min(40, (disposableIncome / monthlyIncome) * 40) +
          Math.min(20, (monthlyIncome / 10000) * 20),
  );

  const employmentScore = clampScore(
    EMPLOYMENT_WEIGHTS[employmentStatus] ??
      (employmentStatus.includes("employ") ? 80 : 50),
  );

  const riskScore = clampScore(
    100 -
      debtToIncome * 35 -
      (requestedAmount > monthlyIncome * 12 ? 15 : 0) -
      (disposableIncome < requestedAmount * 0.05 ? 10 : 0),
  );

  const finalScore = clampScore(
    incomeScore * 0.4 + employmentScore * 0.3 + riskScore * 0.3,
  );

  return {
    riskScore,
    incomeScore,
    employmentScore,
    finalScore,
  };
}
