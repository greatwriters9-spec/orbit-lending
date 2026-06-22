import { cleanEnv } from "@/lib/env";
import { sendEmail } from "@/lib/email/service";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  AdminNotificationChannel,
  AdminNotificationEvent,
  AdminNotificationSeverity,
} from "@/types/admin-notifications";

import { fetchAdminNotificationSettings } from "./settings";

export type AdminEmailNotificationInput = {
  event: AdminNotificationEvent;
  title: string;
  message: string;
  severity: AdminNotificationSeverity;
  entityType?: string;
  entityId?: string;
  dashboardUrl?: string;
  recipients?: string[];
};

async function logAdminNotificationChannel(input: {
  eventType: AdminNotificationEvent;
  title: string;
  message: string;
  severity: AdminNotificationSeverity;
  entityType?: string;
  entityId?: string;
  channel: AdminNotificationChannel;
  dashboardUrl?: string;
}) {
  const supabase = createServiceRoleClient();
  await supabase.from("admin_notifications").insert({
    event_type: input.eventType,
    title: input.title,
    message: input.message,
    severity: input.severity,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    channel: input.channel,
    dashboard_url: input.dashboardUrl ?? null,
    read: input.channel !== "in_app",
  });
}

export async function sendAdminEmailNotification(
  input: AdminEmailNotificationInput,
): Promise<{ ok: boolean; error?: string }> {
  const settings = await fetchAdminNotificationSettings();
  if (!settings.emailEnabled) {
    return { ok: false, error: "Admin email notifications are disabled." };
  }

  const recipients = (input.recipients ?? [])
    .concat([settings.primaryEmail, settings.secondaryEmail])
    .map((email) => email.trim())
    .filter(Boolean);

  const uniqueRecipients = [...new Set(recipients)];
  if (uniqueRecipients.length === 0) {
    const supportEmail = cleanEnv(process.env.EMAIL_REPLY_TO);
    if (supportEmail) {
      uniqueRecipients.push(supportEmail);
    }
  }

  if (uniqueRecipients.length === 0) {
    return { ok: false, error: "No admin email recipients configured." };
  }

  const origin =
    cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";
  const dashboardLink = input.dashboardUrl
    ? input.dashboardUrl.startsWith("http")
      ? input.dashboardUrl
      : `${origin}${input.dashboardUrl}`
    : `${origin}/admin`;

  const headline = `[${input.severity.toUpperCase()}] ${input.title}`;
  const detailLines = [
    input.message,
    input.entityType && input.entityId
      ? `Reference: ${input.entityType} #${input.entityId}`
      : null,
    `Event: ${input.event}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  let lastError: string | undefined;
  for (const recipient of uniqueRecipients) {
    const result = await sendEmail({
      department: "support",
      template: "account_notification",
      recipient,
      data: {
        headline,
        message: detailLines,
        actionUrl: dashboardLink,
      },
      metadata: {
        adminNotificationEvent: input.event,
        severity: input.severity,
      },
    });

    if (!result.ok) {
      lastError = result.error;
    }
  }

  if (lastError) {
    return { ok: false, error: lastError };
  }

  await logAdminNotificationChannel({
    eventType: input.event,
    title: input.title,
    message: input.message,
    severity: input.severity,
    entityType: input.entityType,
    entityId: input.entityId,
    channel: "email",
    dashboardUrl: input.dashboardUrl,
  });

  return { ok: true };
}

/** @deprecated Use sendEmail or sendTimelineEmail from lib/email instead. */
export async function sendTransactionalEmail(
  payload: {
    to: string;
    subject: string;
    html: string;
    text: string;
  },
) {
  const result = await sendEmail({
    department: "support",
    template: "account_notification",
    recipient: payload.to,
    data: {
      headline: payload.subject,
      message: payload.text.split("\n\n")[1] ?? payload.text,
      subject: payload.subject,
    },
    metadata: { source: "legacy_sendTransactionalEmail" },
  });

  if (result.ok) {
    return { ok: true as const, id: result.resendId ?? "unknown" };
  }

  return { ok: false as const, error: result.error };
}

/** @deprecated Use account_notification template via sendEmail instead. */
export function buildEmailHtml(title: string, message: string, actionUrl?: string) {
  const actionBlock = actionUrl
    ? `<p style="margin-top:24px"><a href="${actionUrl}" style="background:#2563EB;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Orbit Mortgage</a></p>`
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h1 style="color:#0F172A;font-size:20px;margin:0 0 12px">${title}</h1>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0">${message}</p>
      ${actionBlock}
      <p style="color:#94A3B8;font-size:12px;margin-top:32px">Orbit Mortgage</p>
    </div>
  `;
}
