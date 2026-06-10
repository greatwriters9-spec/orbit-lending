import { createClient } from "@/lib/supabase/server";
import type { PlatformAuditLog } from "@/types/admin";

type DbAuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
};

function extractReason(newValues: Record<string, unknown> | null): string | null {
  if (!newValues?.reason || typeof newValues.reason !== "string") {
    return null;
  }
  return newValues.reason;
}

export async function fetchPlatformAuditLogs(options?: {
  limit?: number;
  entityType?: string;
  action?: string;
}): Promise<PlatformAuditLog[]> {
  const supabase = await createClient();
  const limit = options?.limit ?? 100;

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.entityType) {
    query = query.eq("entity_type", options.entityType);
  }

  if (options?.action) {
    query = query.eq("action", options.action);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const actorIds = [
    ...new Set(
      (data as DbAuditLog[])
        .map((row) => row.user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const actorNames = new Map<string, string>();

  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", actorIds);

    for (const profile of profiles ?? []) {
      const name =
        profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : (profile.email ?? "Staff");
      actorNames.set(profile.id, name);
    }
  }

  return (data as DbAuditLog[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    actorName: row.user_id ? (actorNames.get(row.user_id) ?? null) : null,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    oldValues: row.old_values,
    newValues: row.new_values,
    reason: extractReason(row.new_values),
    createdAt: row.created_at,
  }));
}
