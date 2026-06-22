import { createClient } from "@/lib/supabase/server";
import type { AdminNotificationRecord } from "@/types/admin-notifications";
function mapAdminNotification(row: {
  id: string;
  event_type: string;
  title: string;
  message: string;
  severity: string;
  entity_type: string | null;
  entity_id: string | null;
  channel: string;
  dashboard_url: string | null;
  read: boolean;
  created_at: string;
}): AdminNotificationRecord {
  return {
    id: row.id,
    eventType: row.event_type as AdminNotificationRecord["eventType"],
    title: row.title,
    message: row.message,
    severity: row.severity as AdminNotificationRecord["severity"],
    entityType: row.entity_type,
    entityId: row.entity_id,
    channel: row.channel as AdminNotificationRecord["channel"],
    read: row.read,
    createdAt: row.created_at,
    dashboardUrl: row.dashboard_url,
  };
}

export async function fetchAdminNotifications(options?: {
  limit?: number;
}): Promise<AdminNotificationRecord[]> {
  const supabase = await createClient();
  let query = supabase
    .from("admin_notifications")
    .select("*")
    .eq("channel", "in_app")
    .order("created_at", { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data } = await query;
  return (data ?? []).map(mapAdminNotification);
}

export async function fetchUnreadAdminNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("admin_notifications")
    .select("*", { count: "exact", head: true })
    .eq("channel", "in_app")
    .eq("read", false);

  return count ?? 0;
}
