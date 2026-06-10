import { requireFinanceStaff } from "@/lib/auth/guards";
import { FinanceRepaymentQueue } from "@/components/repayments/finance-repayment-queue";
import { fetchFinanceRepaymentQueue } from "@/lib/repayments/queries";

export const metadata = {
  title: "Repayments | Finance Portal",
};

export default async function FinanceRepaymentsPage() {
  await requireFinanceStaff();
  const queue = await fetchFinanceRepaymentQueue();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-primary text-3xl">Repayment Verification</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review submitted borrower payments, verify proof, and apply approved installments.
        </p>
      </div>

      <FinanceRepaymentQueue items={queue} />
    </div>
  );
}
