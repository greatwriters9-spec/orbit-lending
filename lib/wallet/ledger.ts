import { createClient } from "@/lib/supabase/server";
import type { Wallet } from "@/types/wallet";

type DbWallet = {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  reserved_balance: number;
  total_funded: number;
  total_withdrawn: number;
  total_repaid: number;
  current_loan_exposure: number;
  created_at: string;
  updated_at: string;
};

export function mapWallet(row: DbWallet): Wallet {
  return {
    id: row.id,
    userId: row.user_id,
    availableBalance: Number(row.available_balance),
    pendingBalance: Number(row.pending_balance),
    reservedBalance: Number(row.reserved_balance),
    totalFunded: Number(row.total_funded),
    totalWithdrawn: Number(row.total_withdrawn),
    totalRepaid: Number(row.total_repaid),
    currentLoanExposure: Number(row.current_loan_exposure),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getOrCreateWallet(userId: string): Promise<Wallet> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return mapWallet(existing as DbWallet);
  }

  const { data: created, error } = await supabase
    .from("wallets")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to create wallet.");
  }

  return mapWallet(created as DbWallet);
}
