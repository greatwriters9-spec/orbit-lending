import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/application-details";

const ACTIVE_LOAN_STATUSES: ApplicationStatus[] = ["funded", "active"];

export async function userHasActiveLoan(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("loan_applications")
    .select("id, status")
    .eq("user_id", userId)
    .in("status", ACTIVE_LOAN_STATUSES);

  if (applications && applications.length > 0) {
    return true;
  }

  const { data: loans } = await supabase
    .from("loans")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1);

  return (loans?.length ?? 0) > 0;
}

export const ACTIVE_LOAN_BLOCK_MESSAGE =
  "You already have an active mortgage. New applications are not permitted while a mortgage is funded or in repayment.";
