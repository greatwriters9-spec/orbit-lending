import { syncWalletTransactionToLedger } from "@/lib/transactions/record";
import { notifyTransactionEvent } from "@/lib/transactions/actions";

export async function mirrorWalletTransaction(input: {
  borrowerId: string;
  walletTransactionId: string;
  walletType: string;
  amount: number;
  status: string;
  referenceNumber: string;
  description: string;
  applicationId?: string | null;
  loanId?: string | null;
  repaymentId?: string | null;
  createdBy?: string | null;
  previousBalance?: number | null;
  newBalance?: number | null;
  isCredit?: boolean;
  notify?: { title: string; message: string };
}) {
  await syncWalletTransactionToLedger(input);

  if (input.notify) {
    await notifyTransactionEvent(
      input.borrowerId,
      input.notify.title,
      input.notify.message,
    );
  }
}
