import { createClient } from "@/lib/supabase/server";
import type {
  PlatformTransactionCategory,
  PlatformTransactionStatus,
  PlatformTransactionType,
  TransactionDirection,
} from "@/types/transactions";

export type RecordPlatformTransactionInput = {
  borrowerId: string;
  loanId?: string | null;
  repaymentId?: string | null;
  walletTransactionId?: string | null;
  createdBy?: string | null;
  transactionType: PlatformTransactionType;
  category: PlatformTransactionCategory;
  amount: number;
  direction: TransactionDirection;
  previousBalance?: number | null;
  newBalance?: number | null;
  status?: PlatformTransactionStatus;
  referenceNumber: string;
  description: string;
  metadata?: Record<string, unknown>;
  timeline?: Array<{
    eventType: string;
    title: string;
    description?: string;
    actorId?: string | null;
  }>;
};

function generateTransactionNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORB-TXN-${date}-${suffix}`;
}

const DEFAULT_TIMELINE: Record<PlatformTransactionStatus, string> = {
  pending: "Submitted",
  processing: "Processing",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  failed: "Failed",
  reversed: "Reversed",
  cancelled: "Cancelled",
};

export async function recordPlatformTransaction(
  input: RecordPlatformTransactionInput,
): Promise<string | null> {
  const supabase = await createClient();
  const status = input.status ?? "completed";
  const transactionNumber = generateTransactionNumber();

  const { data, error } = await supabase
    .from("platform_transactions")
    .insert({
      transaction_number: transactionNumber,
      borrower_id: input.borrowerId,
      loan_id: input.loanId ?? null,
      repayment_id: input.repaymentId ?? null,
      wallet_transaction_id: input.walletTransactionId ?? null,
      created_by: input.createdBy ?? null,
      transaction_type: input.transactionType,
      category: input.category,
      amount: input.amount,
      direction: input.direction,
      previous_balance: input.previousBalance ?? null,
      new_balance: input.newBalance ?? null,
      status,
      reference_number: input.referenceNumber,
      description: input.description,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[recordPlatformTransaction]", error?.message);
    return null;
  }

  const timeline = input.timeline ?? [
    { eventType: "created", title: "Transaction Created" },
    {
      eventType: status,
      title: DEFAULT_TIMELINE[status] ?? "Updated",
    },
  ];

  await supabase.from("transaction_timeline_events").insert(
    timeline.map((event) => ({
      transaction_id: data.id,
      event_type: event.eventType,
      title: event.title,
      description: event.description ?? null,
      actor_id: event.actorId ?? input.createdBy ?? null,
    })),
  );

  return data.id;
}

export async function appendTransactionTimelineEvent(input: {
  transactionId: string;
  eventType: string;
  title: string;
  description?: string;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();

  await supabase.from("transaction_timeline_events").insert({
    transaction_id: input.transactionId,
    event_type: input.eventType,
    title: input.title,
    description: input.description ?? null,
    actor_id: input.actorId ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function syncWalletTransactionToLedger(input: {
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
  metadata?: Record<string, unknown>;
}) {
  const { mapWalletTypeToCategory, mapWalletTypeToPlatformType, mapWalletStatusToPlatformStatus } =
    await import("@/lib/transactions/constants");

  const creditTypes = new Set([
    "loan_funding",
    "withdrawal_rejected",
    "system_credit",
  ]);
  const direction =
    input.isCredit ?? creditTypes.has(input.walletType) ? "credit" : "debit";

  return recordPlatformTransaction({
    borrowerId: input.borrowerId,
    loanId: input.loanId ?? null,
    repaymentId: input.repaymentId ?? null,
    walletTransactionId: input.walletTransactionId,
    createdBy: input.createdBy ?? null,
    transactionType: mapWalletTypeToPlatformType(input.walletType, input.isCredit),
    category: mapWalletTypeToCategory(input.walletType),
    amount: input.amount,
    direction,
    previousBalance: input.previousBalance,
    newBalance: input.newBalance,
    status: mapWalletStatusToPlatformStatus(input.status),
    referenceNumber: input.referenceNumber,
    description: input.description,
    metadata: {
      applicationId: input.applicationId,
      walletType: input.walletType,
      ...(input.metadata ?? {}),
    },
    timeline: [
      { eventType: "created", title: "Transaction Created", actorId: input.createdBy },
      {
        eventType: mapWalletStatusToPlatformStatus(input.status),
        title:
          input.status === "pending"
            ? "Submitted"
            : input.status === "completed"
              ? "Completed"
              : "Updated",
        actorId: input.createdBy,
      },
    ],
  });
}
