import { createClient } from "@/lib/supabase/server";
import type { RepaymentActivityAction } from "@/types/repayments";

export async function logRepaymentActivity(input: {
  loanId: string;
  repaymentId?: string;
  actorId?: string;
  actorRole?: string;
  action: RepaymentActivityAction;
  details?: Record<string, unknown>;
}) {
  const supabase = await createClient();

  await supabase.from("repayment_activity_logs").insert({
    loan_id: input.loanId,
    repayment_id: input.repaymentId ?? null,
    actor_id: input.actorId ?? null,
    actor_role: input.actorRole ?? null,
    action: input.action,
    details: input.details ?? {},
  });
}
