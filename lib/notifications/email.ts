import { sendEmail } from "@/lib/email/service";
import { resolveTemplateDepartment } from "@/lib/email/templates/catalog";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailSendResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status?: number };

/**
 * @deprecated Use sendEmail or sendTimelineEmail from lib/email instead.
 * Retained for backwards compatibility — routes through branded templates.
 */
export async function sendTransactionalEmail(
  payload: EmailPayload,
): Promise<EmailSendResult> {
  const result = await sendEmail({
    department: resolveTemplateDepartment("account_notification"),
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
    return { ok: true, id: result.resendId ?? "unknown" };
  }

  return { ok: false, error: result.error };
}

/** @deprecated Use account_notification template via sendEmail instead. */
export function buildEmailHtml(title: string, message: string, actionUrl?: string) {
  const actionBlock = actionUrl
    ? `<p style="margin-top:24px"><a href="${actionUrl}" style="background:#2563EB;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Orbitt Mortgage</a></p>`
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h1 style="color:#0F172A;font-size:20px;margin:0 0 12px">${title}</h1>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0">${message}</p>
      ${actionBlock}
      <p style="color:#94A3B8;font-size:12px;margin-top:32px">Orbitt Mortgage</p>
    </div>
  `;
}
