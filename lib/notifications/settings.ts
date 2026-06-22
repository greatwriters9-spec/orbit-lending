import { cleanEnv } from "@/lib/env";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  AdminNotificationSettings,
  AdminNotificationSeverity,
} from "@/types/admin-notifications";

const DEFAULT_SETTINGS: AdminNotificationSettings = {
  emailEnabled: true,
  criticalAlertsEnabled: true,
  inAppEnabled: true,
  primaryEmail: "",
  secondaryEmail: "",
  telegramEnabled: false,
  telegramChatId: "",
  telegramBotToken: "",
  notificationMode: "all",
};

export async function fetchAdminNotificationSettings(): Promise<AdminNotificationSettings> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "notifications")
    .maybeSingle();

  const value = (data?.value ?? {}) as Record<string, unknown>;

  return {
    emailEnabled: value.emailEnabled !== false,
    criticalAlertsEnabled: value.criticalAlertsEnabled !== false,
    inAppEnabled: value.inAppEnabled !== false,
    primaryEmail: String(value.primaryEmail ?? ""),
    secondaryEmail: String(value.secondaryEmail ?? ""),
    telegramEnabled: value.telegramEnabled === true,
    telegramChatId: String(
      value.telegramChatId ?? cleanEnv(process.env.TELEGRAM_CHAT_ID) ?? "",
    ),
    telegramBotToken: String(
      value.telegramBotToken ?? cleanEnv(process.env.TELEGRAM_BOT_TOKEN) ?? "",
    ),
    notificationMode:
      value.notificationMode === "critical_only" ? "critical_only" : "all",
  };
}

export function shouldDeliverAdminNotification(
  settings: AdminNotificationSettings,
  severity: AdminNotificationSeverity,
): boolean {
  if (settings.notificationMode === "critical_only") {
    return severity === "critical";
  }
  return true;
}

export { DEFAULT_SETTINGS as DEFAULT_ADMIN_NOTIFICATION_SETTINGS };
