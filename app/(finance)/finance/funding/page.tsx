import { FundingQueueTable } from "@/components/finance/funding-queue-table";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchFundingQueue } from "@/lib/wallet/queries";
import { PATHWARD_BANK } from "@/types/wallet";

export const metadata = {
  title: "Funding Queue",
};

export default async function FinanceFundingPage() {
  const queue = await fetchFundingQueue();

  return (
    <div className="space-y-8 md:space-y-9">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
            Loan Officer Portal
          </p>
          <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
            Funding Queue
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            Approved mortgages awaiting disbursement. Funding credits the client
            wallet automatically via {PATHWARD_BANK.name}.
          </p>
        </div>
      </section>

      <SectionHeader
        title="Approved Mortgages Awaiting Funding"
        description={`${queue.length} application${queue.length === 1 ? "" : "s"} ready for disbursement.`}
      />

      <FundingQueueTable items={queue} />
    </div>
  );
}

