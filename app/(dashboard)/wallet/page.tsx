import {
  WalletSummary,
  WalletTransactionTable,
  WithdrawalRequestsList,
} from "@/components/wallet";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { requireClient } from "@/lib/auth/guards";
import { fetchWalletDashboard } from "@/lib/wallet/queries";

export const metadata = {
  title: "Wallet | Orbit Lending",
};

export default async function WalletPage() {
  const { user } = await requireClient();
  const data = await fetchWalletDashboard(user.id);

  return (
    <div className="space-y-8 md:space-y-9">
      <WalletSummary wallet={data.wallet} />

      <section className="grid gap-8 xl:grid-cols-2">
        <div>
          <SectionHeader
            title="Recent Transactions"
            description="Complete ledger of all wallet movements."
            className="mb-4"
          />
          <WalletTransactionTable transactions={data.recentTransactions} />
        </div>
        <div>
          <SectionHeader
            title="Withdrawal Requests"
            description="Track the status of your withdrawal requests."
            className="mb-4"
          />
          <WithdrawalRequestsList requests={data.withdrawalRequests} />
        </div>
      </section>

      {data.fundingHistory.length > 0 ? (
        <section>
          <SectionHeader
            title="Funding History"
            description="Loan disbursements credited to your wallet."
            className="mb-4"
          />
          <WalletTransactionTable
            transactions={data.fundingHistory}
            title="Loan Funding"
            emptyMessage="No funding history."
          />
        </section>
      ) : null}
    </div>
  );
}
