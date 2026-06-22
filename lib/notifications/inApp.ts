import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  AdminNotificationEvent,
  AdminNotificationSeverity,
} from "@/types/admin-notifications";

export type AdminInAppNotificationInput = {
  event: AdminNotificationEvent;
  title: string;
  message: string;
  severity: AdminNotificationSeverity;
  entityType?: string;
  entityId?: string;
  dashboardUrl?: string;
};

export async function createAdminInAppNotification(
  input: AdminInAppNotificationInput,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("admin_notifications").insert({
    event_type: input.event,
    title: input.title,
    message: input.message,
    severity: input.severity,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    channel: "in_app",
    dashboard_url: input.dashboardUrl ?? null,
    read: false,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
