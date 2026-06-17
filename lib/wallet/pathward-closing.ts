import type { SupabaseClient } from "@supabase/supabase-js";

type PathwardProfileRow = {
  pathward_routing_number: string | null;
  pathward_account_number: string | null;
  pathward_account_balance: number | null;
};

export function isPathwardAccountLinked(profile: PathwardProfileRow | null): boolean {
  return Boolean(profile?.pathward_routing_number && profile?.pathward_account_number);
}

export async function creditPathwardAccountBalance(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
): Promise<{ error?: string; newBalance?: number; credited: number }> {
  if (amount <= 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("pathward_account_balance")
      .eq("id", userId)
      .maybeSingle();
    return {
      credited: 0,
      newBalance: Number(profile?.pathward_account_balance ?? 0),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "pathward_routing_number, pathward_account_number, pathward_account_balance",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return { error: profileError.message, credited: 0 };
  }

  if (!isPathwardAccountLinked(profile as PathwardProfileRow | null)) {
    return {
      error: "Pathward account must be linked before crediting closing funds.",
      credited: 0,
    };
  }

  const currentBalance = Number(profile?.pathward_account_balance ?? 0);
  const newBalance = currentBalance + amount;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ pathward_account_balance: newBalance })
    .eq("id", userId);

  if (updateError) {
    return { error: updateError.message, credited: 0 };
  }

  return { newBalance, credited: amount };
}

export async function syncMortgageToPathwardClosing(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string,
  mortgageAmount: number,
): Promise<{ error?: string; credited: number }> {
  if (mortgageAmount <= 0) {
    return { credited: 0 };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("personal_info")
    .eq("id", applicationId)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found.", credited: 0 };
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const closingMeta = personalInfo.closingFunds as
    | { mortgageCreditedToPathward?: number }
    | undefined;
  const alreadyCredited = Number(closingMeta?.mortgageCreditedToPathward ?? 0);

  if (alreadyCredited >= mortgageAmount) {
    return { credited: 0 };
  }

  const creditDelta = mortgageAmount - alreadyCredited;
  const result = await creditPathwardAccountBalance(supabase, userId, creditDelta);

  if (result.error) {
    return { error: result.error, credited: 0 };
  }

  if (result.credited > 0) {
    await supabase
      .from("loan_applications")
      .update({
        personal_info: {
          ...personalInfo,
          closingFunds: {
            ...closingMeta,
            mortgageCreditedToPathward: alreadyCredited + result.credited,
          },
        },
      })
      .eq("id", applicationId);
  }

  return { credited: result.credited };
}
