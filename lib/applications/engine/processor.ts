import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatus } from "@/types/application-details";

import { calculateApplicationScores } from "./scoring";
import { assertTransition } from "./transitions";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type ApplicationSnapshot = {
  id: string;
  user_id: string;
  status: ApplicationStatus;
  requested_amount: number | null;
  approved_amount: number | null;
  application_number: string | null;
  financial_info: Record<string, unknown>;
};

type TransitionOptions = {
  note: string;
  auditAction?: string;
  auditEntityType?: string;
  auditEntityId?: string;
  auditOldValues?: Record<string, unknown>;
  auditNewValues?: Record<string, unknown>;
  systemMessage?: string;
  skipValidation?: boolean;
  extraUpdates?: Record<string, unknown>;
};

export async function getApplicationSnapshot(
  applicationId: string,
): Promise<ApplicationSnapshot | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loan_applications")
    .select(
      "id, user_id, status, requested_amount, approved_amount, application_number, financial_info",
    )
    .eq("id", applicationId)
    .maybeSingle();

  return data as ApplicationSnapshot | null;
}

export async function transitionApplicationStatus(
  applicationId: string,
  toStatus: ApplicationStatus,
  options: TransitionOptions,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const existing = await getApplicationSnapshot(applicationId);
  if (!existing) {
    return { error: "Application not found." };
  }

  const fromStatus = existing.status as ApplicationStatus;

  if (!options.skipValidation) {
    const transitionError = assertTransition(fromStatus, toStatus);
    if (transitionError) {
      return { error: transitionError };
    }
  }

  if (fromStatus === toStatus && !options.extraUpdates) {
    return {};
  }

  const { error: updateError } = await supabase
    .from("loan_applications")
    .update({
      status: toStatus,
      ...(options.extraUpdates ?? {}),
    })
    .eq("id", applicationId);

  if (updateError) {
    return { error: updateError.message };
  }

  if (fromStatus !== toStatus) {
    await supabase.from("application_status_history").insert({
      application_id: applicationId,
      status: toStatus,
      note: options.note,
      changed_by: user.id,
    });
  }

  if (options.systemMessage) {
    await sendSystemMessage(supabase, applicationId, options.systemMessage);
  }

  await logApplicationAudit(supabase, user.id, {
    action: options.auditAction ?? "application.status_updated",
    entityType: options.auditEntityType ?? "loan_application",
    entityId: options.auditEntityId ?? applicationId,
    oldValues: {
      status: fromStatus,
      ...(options.auditOldValues ?? {}),
    },
    newValues: {
      status: toStatus,
      note: options.note,
      ...(options.auditNewValues ?? {}),
    },
  });

  if (fromStatus !== toStatus) {
    const { notifyApplicationStatusChange } = await import(
      "@/lib/notifications/service"
    );
    await notifyApplicationStatusChange(
      existing.user_id,
      applicationId,
      toStatus,
    );
  }

  return {};
}

export async function recordApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  note: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status,
    note,
    changed_by: user?.id ?? null,
  });
}

export async function sendSystemMessage(
  supabase: SupabaseClient,
  applicationId: string,
  message: string,
) {
  await supabase.from("application_messages").insert({
    application_id: applicationId,
    sender_role: "system",
    sender_name: "Orbit Lending",
    message,
  });
}

export async function sendStaffMessage(
  applicationId: string,
  message: string,
  senderName: string,
  senderRole: "finance" | "officer" = "finance",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { error } = await supabase.from("application_messages").insert({
    application_id: applicationId,
    sender_id: user.id,
    sender_role: senderRole,
    sender_name: senderName,
    message,
  });

  if (error) {
    return { error: error.message };
  }

  await logApplicationAudit(supabase, user.id, {
    action: "application.message_sent",
    entityType: "loan_application",
    entityId: applicationId,
    newValues: { message, senderRole },
  });

  const { data: application } = await supabase
    .from("loan_applications")
    .select("user_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (application?.user_id && senderRole === "finance") {
    const { notifyFinanceMessage } = await import("@/lib/notifications/service");
    await notifyFinanceMessage(
      application.user_id,
      applicationId,
      senderName,
      message,
    );
  }

  return {};
}

export async function logApplicationAudit(
  supabase: SupabaseClient,
  userId: string,
  input: {
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  },
) {
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    null;

  await supabase.from("audit_logs").insert({
    user_id: userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    old_values: input.oldValues ?? null,
    new_values: input.newValues ?? null,
    ip_address: ipAddress,
  });
}

export async function scoreApplication(
  applicationId: string,
  scoredBy?: string | null,
): Promise<{ error?: string; scores?: ReturnType<typeof calculateApplicationScores> }> {
  const supabase = await createClient();
  const existing = await getApplicationSnapshot(applicationId);

  if (!existing) {
    return { error: "Application not found." };
  }

  const scores = calculateApplicationScores({
    monthlyIncome: Number(existing.financial_info.monthlyIncome ?? 0),
    monthlyExpenses: Number(existing.financial_info.monthlyExpenses ?? 0),
    existingDebt: Number(existing.financial_info.existingDebt ?? 0),
    requestedAmount: Number(existing.requested_amount ?? 0),
    employmentStatus: String(existing.financial_info.employmentStatus ?? ""),
  });

  const { error } = await supabase.from("application_scores").upsert(
    {
      application_id: applicationId,
      risk_score: scores.riskScore,
      income_score: scores.incomeScore,
      employment_score: scores.employmentScore,
      final_score: scores.finalScore,
      scored_at: new Date().toISOString(),
      scored_by: scoredBy ?? null,
    },
    { onConflict: "application_id" },
  );

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await logApplicationAudit(supabase, user.id, {
      action: "application.scored",
      entityType: "loan_application",
      entityId: applicationId,
      newValues: scores,
    });
  }

  return { scores };
}

export async function processApplicationSubmission(applicationId: string) {
  const supabase = await createClient();

  await recordApplicationStatus(
    applicationId,
    "submitted",
    "Application submitted successfully and queued for review.",
  );

  await sendSystemMessage(
    supabase,
    applicationId,
    "Your application has been received. Our team will begin review within 24 hours.",
  );

  await scoreApplication(applicationId);

  await transitionApplicationStatus(applicationId, "under_review", {
    note: "Application assigned for initial review.",
    systemMessage:
      "Your application is now under review. We will notify you if additional information is needed.",
    skipValidation: true,
  });
}
