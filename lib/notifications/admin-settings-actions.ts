"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSuperAdmin } from "@/lib/auth/guards";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { logAuditEntry } from "@/lib/finance/audit";
import { sendAdminTestNotification } from "@/lib/notifications/notify";
import {
  DEFAULT_ADMIN_NOTIFICATION_SETTINGS,
  fetchAdminNotificationSettings,
} from "@/lib/notifications/settings";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/types/admin";
import type { AdminNotificationSettings } from "@/types/admin-notifications";

const settingsSchema = z.object({
  emailEnabled: z.boolean(),
  criticalAlertsEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  primaryEmail: z.string(),
  secondaryEmail: z.string(),
  telegramEnabled: z.boolean(),
  telegramChatId: z.string(),
  telegramBotToken: z.string(),
  notificationMode: z.enum(["all", "critical_only"]),
});

export async function fetchAdminNotificationSettingsAction(): Promise<AdminNotificationSettings> {
  await requireSuperAdmin();
  return fetchAdminNotificationSettings();
}

export async function updateAdminNotificationSettingsAction(
  input: z.infer<typeof settingsSchema>,
): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();

  if (!hasAdminPermission(ctx.role, "settings:manage")) {
    return { error: "You do not have permission to manage notification settings." };
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "notifications")
    .maybeSingle();

  const nextValue = {
    ...DEFAULT_ADMIN_NOTIFICATION_SETTINGS,
    ...(existing?.value as Record<string, unknown> | undefined),
    ...parsed.data,
  };

  const { error } = await supabase
    .from("platform_settings")
    .update({
      value: nextValue,
      updated_at: new Date().toISOString(),
      updated_by: ctx.user.id,
    })
    .eq("key", "notifications");

  if (error) {
    return { error: error.message };
  }

  await logAuditEntry({
    action: "platform.notification_settings_updated",
    entityType: "platform_settings",
    entityId: "notifications",
    oldValues: existing?.value as Record<string, unknown> | undefined,
    newValues: nextValue,
  });

  revalidatePath("/super-admin/settings");
  return { success: "Notification settings updated." };
}

export async function sendAdminTestNotificationAction(): Promise<AdminActionState> {
  await requireSuperAdmin();
  const result = await sendAdminTestNotification();
  if (!result.ok) {
    return { error: result.error ?? "Test notification failed." };
  }
  return { success: "Test notification sent." };
}
