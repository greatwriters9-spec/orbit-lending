import { createClient } from "@/lib/supabase/server";
import type {
  AdminUserApplication,
  AdminUserDetail,
  AdminUserFundingApplication,
  AdminUserMessage,
  AdminUserSummary,
  AdminUserTransaction,
  AdminUserWallet,
} from "@/types/admin";
import type { AccountStatus } from "@/types/profile";

type DbProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  role: string;
  account_status: AccountStatus;
  account_status_reason: string | null;
  account_status_changed_at: string | null;
  pathward_account_holder_name: string | null;
  pathward_routing_number: string | null;
  pathward_account_number: string | null;
  pathward_account_balance: number | null;
  pathward_linked_at: string | null;
  pathward_withdrawable_approved_at: string | null;
  funding_bank_name: string | null;
  profile_status: string;
  created_at: string;
};

export async function fetchAdminUsers(options?: {
  search?: string;
  role?: string;
  accountStatus?: string;
}): Promise<AdminUserSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.role) {
    query = query.eq("role", options.role);
  }

  if (options?.accountStatus) {
    query = query.eq("account_status", options.accountStatus);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  let profiles = data as DbProfile[];

  if (options?.search) {
    const term = options.search.toLowerCase();
    profiles = profiles.filter(
      (p) =>
        p.email.toLowerCase().includes(term) ||
        `${p.first_name ?? ""} ${p.last_name ?? ""}`.toLowerCase().includes(term),
    );
  }

  const userIds = profiles.map((p) => p.id);
  const appCounts = new Map<string, number>();

  if (userIds.length > 0) {
    const { data: apps } = await supabase
      .from("loan_applications")
      .select("user_id")
      .in("user_id", userIds);

    for (const app of apps ?? []) {
      appCounts.set(app.user_id, (appCounts.get(app.user_id) ?? 0) + 1);
    }
  }

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    firstName: p.first_name,
    lastName: p.last_name,
    role: p.role,
    accountStatus: p.account_status ?? "active",
    profileStatus: p.profile_status,
    createdAt: p.created_at,
    applicationCount: appCounts.get(p.id) ?? 0,
  }));
}

export async function fetchAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const p = data as DbProfile;

  const { count } = await supabase
    .from("loan_applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return {
    id: p.id,
    email: p.email,
    firstName: p.first_name,
    lastName: p.last_name,
    phone: p.phone,
    country: p.country,
    role: p.role,
    accountStatus: p.account_status ?? "active",
    accountStatusReason: p.account_status_reason,
    accountStatusChangedAt: p.account_status_changed_at,
    pathwardAccountHolderName: p.pathward_account_holder_name,
    pathwardRoutingNumber: p.pathward_routing_number,
    pathwardAccountNumber: p.pathward_account_number,
    pathwardAccountBalance: Number(p.pathward_account_balance ?? 0),
    pathwardLinkedAt: p.pathward_linked_at,
    pathwardWithdrawableApprovedAt: p.pathward_withdrawable_approved_at,
    fundingBankName: p.funding_bank_name,
    profileStatus: p.profile_status,
    createdAt: p.created_at,
    applicationCount: count ?? 0,
  };
}

export async function fetchAdminUserFundingApplication(
  userId: string,
): Promise<AdminUserFundingApplication | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loan_applications")
    .select("id, status, personal_info")
    .eq("user_id", userId)
    .in("status", ["approved", "funded", "active"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    status: data.status,
    personalInfo: (data.personal_info ?? {}) as Record<string, unknown>,
  };
}

export async function fetchAdminUserApplications(
  userId: string,
): Promise<AdminUserApplication[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loan_applications")
    .select(
      "id, application_number, loan_product_slug, status, requested_amount, submitted_at, updated_at",
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    applicationNumber: row.application_number ?? "—",
    productSlug: row.loan_product_slug,
    status: row.status,
    requestedAmount: Number(row.requested_amount ?? 0),
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  }));
}

export async function fetchAdminUserLoans(
  userId: string,
): Promise<AdminUserApplication[]> {
  const apps = await fetchAdminUserApplications(userId);
  return apps.filter((a) =>
    ["approved", "funded", "active", "completed"].includes(a.status),
  );
}

export async function fetchAdminUserWallet(
  userId: string,
): Promise<AdminUserWallet | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("wallets")
    .select("id, available_balance, pending_balance, currency")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    availableBalance: Number(data.available_balance),
    pendingBalance: Number(data.pending_balance),
    currency: data.currency ?? "USD",
  };
}

export async function fetchAdminUserTransactions(
  userId: string,
): Promise<AdminUserTransaction[]> {
  const supabase = await createClient();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!wallet) {
    return [];
  }

  const { data } = await supabase
    .from("wallet_transactions")
    .select("id, transaction_type, amount, description, reference_number, status, created_at")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.transaction_type,
    amount: Number(row.amount),
    description: row.description ?? "",
    createdAt: row.created_at,
  }));
}

export async function fetchAdminUserMessages(
  userId: string,
): Promise<AdminUserMessage[]> {
  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("loan_applications")
    .select("id, application_number")
    .eq("user_id", userId);

  if (!apps?.length) {
    return [];
  }

  const appMap = new Map(apps.map((a) => [a.id, a.application_number ?? "—"]));
  const appIds = apps.map((a) => a.id);

  const { data: messages } = await supabase
    .from("application_messages")
    .select("*")
    .in("application_id", appIds)
    .order("created_at", { ascending: false })
    .limit(50);

  return (messages ?? []).map((row) => ({
    id: row.id,
    applicationId: row.application_id,
    applicationNumber: appMap.get(row.application_id) ?? "—",
    senderName: row.sender_name,
    senderRole: row.sender_role,
    message: row.message,
    createdAt: row.created_at,
  }));
}
