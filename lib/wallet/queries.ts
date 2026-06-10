import { createClient } from "@/lib/supabase/server";
import { getLoanProductBySlug } from "@/lib/loans/mock-data";
import { getOrCreateWallet, mapWallet } from "@/lib/wallet/ledger";
import type {
  FundingQueueItem,
  Wallet,
  WalletDashboardData,
  WalletTransaction,
  WithdrawalRequest,
} from "@/types/wallet";
import { TRANSACTION_TYPE_LABELS } from "@/types/wallet";

type DbTransaction = {
  id: string;
  wallet_id: string;
  transaction_type: WalletTransaction["transactionType"];
  amount: number;
  status: WalletTransaction["status"];
  description: string;
  reference_number: string;
  application_id: string | null;
  withdrawal_request_id: string | null;
  created_by: string | null;
  created_at: string;
};

type DbWithdrawal = {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  withdrawal_method: WithdrawalRequest["withdrawalMethod"];
  destination_details: Record<string, string>;
  notes: string | null;
  status: WithdrawalRequest["status"];
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

function mapTransaction(row: DbTransaction): WalletTransaction {
  return {
    id: row.id,
    walletId: row.wallet_id,
    transactionType: row.transaction_type,
    amount: Number(row.amount),
    status: row.status,
    description: row.description,
    referenceNumber: row.reference_number,
    applicationId: row.application_id ?? undefined,
    withdrawalRequestId: row.withdrawal_request_id ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
  };
}

function mapWithdrawal(row: DbWithdrawal): WithdrawalRequest {
  return {
    id: row.id,
    walletId: row.wallet_id,
    userId: row.user_id,
    amount: Number(row.amount),
    withdrawalMethod: row.withdrawal_method,
    destinationDetails: row.destination_details ?? {},
    notes: row.notes ?? undefined,
    status: row.status,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    createdAt: row.created_at,
  };
}

export async function fetchWalletForUser(userId: string): Promise<Wallet> {
  return getOrCreateWallet(userId);
}

export async function fetchWalletDashboard(
  userId: string,
): Promise<WalletDashboardData> {
  const wallet = await getOrCreateWallet(userId);
  const supabase = await createClient();

  const [transactionsRes, withdrawalsRes] = await Promise.all([
    supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const transactions = (transactionsRes.data ?? []).map((row) =>
    mapTransaction(row as DbTransaction),
  );

  return {
    wallet,
    recentTransactions: transactions,
    withdrawalRequests: (withdrawalsRes.data ?? []).map((row) =>
      mapWithdrawal(row as DbWithdrawal),
    ),
    fundingHistory: transactions.filter((t) => t.transactionType === "loan_funding"),
  };
}

export async function fetchFundingQueue(): Promise<FundingQueueItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loan_applications")
    .select(
      "id, application_number, user_id, loan_product_slug, approved_amount, requested_amount, updated_at, personal_info",
    )
    .eq("status", "approved")
    .order("updated_at", { ascending: true });

  if (!data?.length) {
    return [];
  }

  return data.map((row) => {
    const personalInfo = row.personal_info as Record<string, unknown>;
    const first = String(personalInfo.firstName ?? personalInfo.first_name ?? "");
    const last = String(personalInfo.lastName ?? personalInfo.last_name ?? "");
    const product = getLoanProductBySlug(row.loan_product_slug);

    return {
      id: row.id,
      applicationNumber: row.application_number ?? "Pending",
      applicantName: `${first} ${last}`.trim() || "Applicant",
      applicantId: row.user_id,
      productName: product?.name ?? row.loan_product_slug,
      approvedAmount: Number(row.approved_amount ?? row.requested_amount ?? 0),
      approvalDate: row.updated_at,
    };
  });
}

export async function fetchPendingWithdrawals(): Promise<WithdrawalRequest[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (!data?.length) {
    return [];
  }

  const userIds = [...new Set(data.map((row) => row.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", userIds);

  const nameById = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Client",
    ]),
  );

  return data.map((row) => ({
    ...mapWithdrawal(row as DbWithdrawal),
    applicantName: nameById.get(row.user_id) ?? "Client",
  }));
}

export { TRANSACTION_TYPE_LABELS };
