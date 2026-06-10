"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

type AuditLogInput = {
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
};

export async function logAuditEntry(input: AuditLogInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    null;

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    old_values: input.oldValues ?? null,
    new_values: input.newValues ?? null,
    ip_address: ipAddress,
  });
}

export async function recordStatusChange(
  applicationId: string,
  status: string,
  note: string,
) {
  const supabase = await createClient();

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status,
    note,
  });
}
