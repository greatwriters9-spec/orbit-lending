import { createClient } from "@/lib/supabase/server";
import type { PathwardLinkedAccount } from "@/types/wallet";
import { getFundingBankName } from "@/types/wallet";

type ProfilePathwardRow = {
  pathward_account_holder_name: string | null;
  pathward_routing_number: string | null;
  pathward_account_number: string | null;
  pathward_account_balance: number | null;
  pathward_linked_at: string | null;
  pathward_withdrawable_approved_at: string | null;
  funding_bank_name: string | null;
};

const MORTGAGE_APPROVED_STATUSES = new Set([
  "approved",
  "funded",
  "active",
  "completed",
]);

export function mapPathwardLinkedAccount(
  profile: ProfilePathwardRow | null,
): PathwardLinkedAccount | null {
  if (!profile?.pathward_routing_number || !profile?.pathward_account_number) {
    return null;
  }

  return {
    accountHolderName: profile.pathward_account_holder_name ?? "Client",
    routingNumber: String(profile.pathward_routing_number),
    accountNumber: String(profile.pathward_account_number),
    accountNumberLast4: String(profile.pathward_account_number).slice(-4),
    accountBalance: Number(profile.pathward_account_balance ?? 0),
    linkedAt: profile.pathward_linked_at ?? null,
    withdrawableApprovedAt: profile.pathward_withdrawable_approved_at ?? null,
    fundingBankName: getFundingBankName(profile.funding_bank_name),
  };
}

export async function fetchPathwardLinkedAccount(
  userId: string,
): Promise<PathwardLinkedAccount | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select(
      "pathward_account_holder_name, pathward_routing_number, pathward_account_number, pathward_account_balance, pathward_linked_at, pathward_withdrawable_approved_at, funding_bank_name",
    )
    .eq("id", userId)
    .maybeSingle();

  return mapPathwardLinkedAccount(data as ProfilePathwardRow | null);
}

export async function isMortgageApprovedForWithdrawal(
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data: activeLoan } = await supabase
    .from("loans")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (activeLoan) {
    return true;
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("status")
    .eq("user_id", userId)
    .neq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return application
    ? MORTGAGE_APPROVED_STATUSES.has(application.status)
    : false;
}
