import { requireFinanceStaff } from "@/lib/auth/guards";
import { FinanceTransactionCenter } from "@/components/transactions/finance-transaction-center";
import {
  fetchFinanceTransactionSummary,
  fetchTransactions,
} from "@/lib/transactions/queries";

export const metadata = {
  title: "Transaction Center | Finance Portal",
};

export default async function FinanceTransactionsPage() {
  await requireFinanceStaff();
  const [transactions, summary] = await Promise.all([
    fetchTransactions({ limit: 1000 }),
    fetchFinanceTransactionSummary(),
  ]);

  return (
    <FinanceTransactionCenter transactions={transactions} summary={summary} />
  );
}
