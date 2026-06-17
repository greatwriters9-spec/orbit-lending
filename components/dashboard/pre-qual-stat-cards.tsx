import {
  BadgePercent,
  Calendar,
  CircleDollarSign,
  Home,
  Landmark,
  Wallet,
} from "lucide-react";

import { StatCard } from "@/components/ui-kit/stat-card";
import { formatCurrency } from "@/lib/loans/queries";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";

type PreQualStatCardsProps = {
  preQualification: PreQualificationResult;
};

export function PreQualStatCards({ preQualification }: PreQualStatCardsProps) {
  const termYears = Math.round(preQualification.loanTermMonths / 12);

  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Maximum Home Budget"
        value={formatCurrency(preQualification.maximumHomePrice)}
        description="Based on your income and assets"
        icon={Home}
        variant="growth"
      />
      <StatCard
        title="Estimated Mortgage Amount"
        value={formatCurrency(preQualification.estimatedMortgageAmount)}
        description="Loan amount before closing costs"
        icon={Landmark}
      />
      <StatCard
        title="Estimated Down Payment"
        value={formatCurrency(preQualification.estimatedDownPayment)}
        description="Typical 20% down payment estimate"
        icon={Wallet}
      />
      <StatCard
        title="Estimated Monthly Payment"
        value={formatCurrency(preQualification.estimatedMonthlyPayment)}
        description="Principal and interest estimate"
        icon={CircleDollarSign}
        variant="growth"
      />
      <StatCard
        title="Interest Rate"
        value={`${preQualification.interestRate.toFixed(2)}%`}
        description="Estimated rate for your profile"
        icon={BadgePercent}
      />
      <StatCard
        title="Loan Term"
        value={`${termYears} years`}
        description={`${preQualification.loanTermMonths} monthly payments`}
        icon={Calendar}
      />
    </section>
  );
}
