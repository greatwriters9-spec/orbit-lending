import {
  WalletSummary,
  WalletTransactionTable,
  WithdrawalRequestsList,
} from "@/components/wallet";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { requireClient } from "@/lib/auth/guards";
import { fetchWalletDashboard } from "@/lib/wallet/queries";

export const metadata = {
  title: "Funding Account",
};

export default async function WalletPage() {
  const { user } = await requireClient();
  const data = await fetchWalletDashboard(user.id);

  return (
    <div className="space-y-8 md:space-y-9">
      <SectionHeader
        title="Funding Account"
        description="View your Pathward-linked account, withdrawable balance, and funding activity."
      />
      <WalletSummary wallet={data.wallet} linkedAccount={data.linkedAccount} />

      <section className="grid gap-8 xl:grid-cols-2">
        <div>
          <SectionHeader
            title="Recent Transactions"
            description="Full history of deposits, transfers, and withdrawals."
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
            description="Mortgage disbursements credited to your funding account."
            className="mb-4"
          />
          <WalletTransactionTable
            transactions={data.fundingHistory}
            title="Mortgage Funding"
            emptyMessage="No funding history."
          />
        </section>
      ) : null}
    </div>
  );
}

