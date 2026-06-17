import { FinanceWithdrawalsTable } from "@/components/finance/finance-withdrawals-table";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchPendingWithdrawals } from "@/lib/wallet/queries";
import { PATHWARD_BANK } from "@/types/wallet";

export const metadata = {
  title: "Withdrawal Approvals | Orbit Mortgage",
};

export default async function FinanceWithdrawalsPage() {
  const requests = await fetchPendingWithdrawals();

  return (
    <div className="space-y-8 md:space-y-9">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
            Loan Officer Portal
          </p>
          <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
            Withdrawal Queue
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            Review and approve client withdrawal requests. Processed through{" "}
            {PATHWARD_BANK.name}.
          </p>
        </div>
      </section>

      <SectionHeader
        title="Pending Withdrawals"
        description={`${requests.length} withdrawal request${requests.length === 1 ? "" : "s"} awaiting review.`}
      />

      <FinanceWithdrawalsTable requests={requests} />
    </div>
  );
}

