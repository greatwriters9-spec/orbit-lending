import { cleanEnv } from "@/lib/env";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { NotifyAdminInput } from "@/types/admin-notifications";

import { sendAdminEmailNotification } from "./email";
import { createAdminInAppNotification } from "./inApp";
import {
  fetchAdminNotificationSettings,
  shouldDeliverAdminNotification,
} from "./settings";
import { sendTelegramNotification } from "./telegram";
import { resolveAdminNotificationTemplate } from "./templates";

export type NotifyAdminResult = {
  inApp: boolean;
  email: boolean;
  telegram: boolean;
  skipped: boolean;
  errors: string[];
};

function resolveDashboardUrl(path?: string): string | undefined {
  if (!path) {
    return undefined;
  }
  const origin =
    cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";
  return path.startsWith("http") ? path : `${origin}${path}`;
}

export async function notifyAdmin(
  input: NotifyAdminInput,
): Promise<NotifyAdminResult> {
  const settings = await fetchAdminNotificationSettings();
  const template = resolveAdminNotificationTemplate(
    input.event,
    input.payload,
    input.severity,
  );

  const result: NotifyAdminResult = {
    inApp: false,
    email: false,
    telegram: false,
    skipped: false,
    errors: [],
  };

  if (!shouldDeliverAdminNotification(settings, template.severity)) {
    result.skipped = true;
    return result;
  }

  const title = template.title;
  const message = template.message;
  const dashboardUrl = resolveDashboardUrl(input.dashboardUrl);

  if (settings.inAppEnabled) {
    const inAppResult = await createAdminInAppNotification({
      event: input.event,
      title,
      message,
      severity: template.severity,
      entityType: input.entityType,
      entityId: input.entityId,
      dashboardUrl: input.dashboardUrl,
    });
    result.inApp = inAppResult.ok;
    if (!inAppResult.ok && inAppResult.error) {
      result.errors.push(inAppResult.error);
    }
  }

  if (settings.emailEnabled) {
    const emailResult = await sendAdminEmailNotification({
      event: input.event,
      title,
      message,
      severity: template.severity,
      entityType: input.entityType,
      entityId: input.entityId,
      dashboardUrl: input.dashboardUrl,
    });
    result.email = emailResult.ok;
    if (!emailResult.ok && emailResult.error) {
      result.errors.push(emailResult.error);
    }
  }

  if (settings.telegramEnabled) {
    const telegramResult = await sendTelegramNotification({
      title,
      message,
      severity: template.severity,
      entityType: input.entityType,
      entityId: input.entityId,
      dashboardUrl,
      customBody: template.telegramBody,
      botToken: settings.telegramBotToken,
      chatId: settings.telegramChatId,
    });
    result.telegram = telegramResult.ok;
    if (!telegramResult.ok && telegramResult.error) {
      result.errors.push(telegramResult.error);
    } else if (telegramResult.ok) {
      const supabase = createServiceRoleClient();
      await supabase.from("admin_notifications").insert({
        event_type: input.event,
        title,
        message,
        severity: template.severity,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        channel: "telegram",
        dashboard_url: input.dashboardUrl ?? null,
        read: true,
      });
    }
  }

  if (process.env.NODE_ENV === "development" && result.errors.length > 0) {
    console.warn("[notifyAdmin]", input.event, result.errors);
  }

  return result;
}

export async function sendAdminTestNotification(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const result = await notifyAdmin({
    event: "GENERAL_INQUIRY",
    severity: "normal",
    payload: {
      name: "Orbit Mortgage Admin",
      message: "This is a test notification from the Orbit Mortgage alert engine.",
      timestamp: new Date().toISOString(),
    },
    entityType: "system",
    entityId: "test",
    dashboardUrl: "/super-admin/settings",
  });

  if (result.skipped) {
    return { ok: false, error: "Notifications are filtered by current settings." };
  }

  if (result.errors.length > 0 && !result.inApp && !result.email && !result.telegram) {
    return { ok: false, error: result.errors.join(" ") };
  }

  return { ok: true };
}
