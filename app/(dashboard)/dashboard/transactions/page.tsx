import { requireClient } from "@/lib/auth/guards";
import { ClientTransactionCenter } from "@/components/transactions/client-transaction-center";
import {
  fetchTransactionSummary,
  fetchTransactions,
} from "@/lib/transactions/queries";

export const metadata = {
  title: "Transactions | Orbit Mortgage",
};

export default async function TransactionsPage() {
  const ctx = await requireClient();
  const [transactions, summary] = await Promise.all([
    fetchTransactions({ borrowerId: ctx.user.id, limit: 500 }),
    fetchTransactionSummary(ctx.user.id),
  ]);

  return (
    <ClientTransactionCenter transactions={transactions} summary={summary} />
  );
}

