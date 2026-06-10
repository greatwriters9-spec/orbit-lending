import { createClient } from "@/lib/supabase/server";
import { getOrCreateWallet } from "@/lib/wallet/ledger";
import type {
  PlatformTransaction,
  TransactionFilters,
  TransactionSummary,
  TransactionTimelineEvent,
} from "@/types/transactions";

function mapTransaction(row: Record<string, unknown>): PlatformTransaction {
  return {
    id: row.id as string,
    transactionNumber: row.transaction_number as string,
    borrowerId: row.borrower_id as string,
    loanId: (row.loan_id as string | null) ?? null,
    repaymentId: (row.repayment_id as string | null) ?? null,
    walletTransactionId: (row.wallet_transaction_id as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    transactionType: row.transaction_type as PlatformTransaction["transactionType"],
    category: row.category as PlatformTransaction["category"],
    amount: Number(row.amount),
    direction: row.direction as PlatformTransaction["direction"],
    previousBalance:
      row.previous_balance != null ? Number(row.previous_balance) : null,
    newBalance: row.new_balance != null ? Number(row.new_balance) : null,
    status: row.status as PlatformTransaction["status"],
    referenceNumber: row.reference_number as string,
    description: row.description as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    loanNumber:
      ((row.loans as { loan_number?: string } | null)?.loan_number as
        | string
        | undefined) ?? null,
  };
}

function mapTimeline(row: Record<string, unknown>): TransactionTimelineEvent {
  return {
    id: row.id as string,
    transactionId: row.transaction_id as string,
    eventType: row.event_type as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    actorId: (row.actor_id as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function fetchTransactions(input: {
  borrowerId?: string;
  filters?: TransactionFilters;
  limit?: number;
  offset?: number;
  financeWide?: boolean;
}): Promise<PlatformTransaction[]> {
  const supabase = await createClient();
  let query = supabase
    .from("platform_transactions")
    .select("*, loans(loan_number)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (input.borrowerId) {
    query = query.eq("borrower_id", input.borrowerId);
  }

  const filters = input.filters;
  if (filters?.types?.length) {
    query = query.in("transaction_type", filters.types);
  }
  if (filters?.statuses?.length) {
    query = query.in("status", filters.statuses);
  }
  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("created_at", `${filters.dateTo}T23:59:59`);
  }
  if (filters?.amountMin != null) {
    query = query.gte("amount", filters.amountMin);
  }
  if (filters?.amountMax != null) {
    query = query.lte("amount", filters.amountMax);
  }
  if (filters?.referenceNumber) {
    query = query.ilike("reference_number", `%${filters.referenceNumber}%`);
  }
  if (filters?.search) {
    query = query.or(
      `description.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%,transaction_number.ilike.%${filters.search}%`,
    );
  }

  if (input.limit) {
    query = query.range(
      input.offset ?? 0,
      (input.offset ?? 0) + input.limit - 1,
    );
  }

  const { data } = await query;
  let rows = (data ?? []).map(mapTransaction);

  if (filters?.loanNumber) {
    rows = rows.filter(
      (row) =>
        row.loanNumber?.toLowerCase().includes(filters.loanNumber!.toLowerCase()) ||
        row.metadata.loanNumber
          ?.toString()
          .toLowerCase()
          .includes(filters.loanNumber!.toLowerCase()),
    );
  }

  return rows;
}

export async function fetchTransactionSummary(
  borrowerId: string,
): Promise<TransactionSummary> {
  const supabase = await createClient();
  const wallet = await getOrCreateWallet(borrowerId);

  const { data } = await supabase
    .from("platform_transactions")
    .select("amount, direction, status, created_at")
    .eq("borrower_id", borrowerId)
    .is("deleted_at", null);

  const rows = data ?? [];
  const completed = rows.filter((row) => row.status === "completed");
  const moneyReceived = completed
    .filter((row) => row.direction === "credit")
    .reduce((sum, row) => sum + Number(row.amount), 0);
  const moneyPaid = completed
    .filter((row) => row.direction === "debit")
    .reduce((sum, row) => sum + Number(row.amount), 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    totalTransactions: rows.length,
    moneyReceived,
    moneyPaid,
    walletBalance: wallet.availableBalance,
    recentActivityCount: rows.filter(
      (row) => new Date(row.created_at) >= thirtyDaysAgo,
    ).length,
  };
}

export async function fetchTransactionById(
  transactionId: string,
): Promise<PlatformTransaction | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_transactions")
    .select("*, loans(loan_number)")
    .eq("id", transactionId)
    .is("deleted_at", null)
    .maybeSingle();

  return data ? mapTransaction(data) : null;
}

export async function fetchTransactionTimeline(
  transactionId: string,
): Promise<TransactionTimelineEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transaction_timeline_events")
    .select("*")
    .eq("transaction_id", transactionId)
    .order("created_at", { ascending: true });

  return (data ?? []).map(mapTimeline);
}

export async function fetchFinanceTransactionSummary(): Promise<{
  totalTransactions: number;
  pendingReview: number;
  completedVolume: number;
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_transactions")
    .select("amount, status")
    .is("deleted_at", null);

  const rows = data ?? [];
  return {
    totalTransactions: rows.length,
    pendingReview: rows.filter((row) =>
      ["pending", "processing"].includes(row.status),
    ).length,
    completedVolume: rows
      .filter((row) => row.status === "completed")
      .reduce((sum, row) => sum + Number(row.amount), 0),
  };
}
