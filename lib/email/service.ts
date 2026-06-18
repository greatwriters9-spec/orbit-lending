import {
  getDevFallbackFrom,
  getEmailTestOverride,
  getResendApiKey,
  resolveDepartmentSender,
} from "@/lib/email/config";
import { renderEmailFromTemplate } from "@/lib/email/templates/catalog";
import type {
  EmailDeliveryStatus,
  SendEmailInput,
  SendEmailResult,
} from "@/lib/email/types";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

async function postResendEmail(input: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string; status?: number }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  const body = await response.text();

  if (!response.ok) {
    let message = body;
    try {
      const parsed = JSON.parse(body) as { message?: string };
      message = parsed.message ?? body;
    } catch {
      // keep raw body
    }
    return { ok: false, error: message, status: response.status };
  }

  try {
    const parsed = JSON.parse(body) as { id?: string };
    return { ok: true, id: parsed.id ?? "unknown" };
  } catch {
    return { ok: true, id: "unknown" };
  }
}

async function createEmailLog(input: {
  userId?: string;
  recipientEmail: string;
  senderEmail: string;
  senderDisplayName: string;
  department: SendEmailInput["department"];
  templateKey: SendEmailInput["template"];
  subject: string;
  status: EmailDeliveryStatus;
  resendId?: string;
  errorMessage?: string;
  sentBy?: string;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("email_communication_logs")
    .insert({
      user_id: input.userId ?? null,
      recipient_email: input.recipientEmail,
      sender_email: input.senderEmail,
      sender_display_name: input.senderDisplayName,
      department: input.department,
      template_key: input.templateKey,
      subject: input.subject,
      status: input.status,
      resend_id: input.resendId ?? null,
      error_message: input.errorMessage ?? null,
      sent_by: input.sentBy ?? null,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[sendEmail] Failed to write email log:", error?.message);
    return "unlogged";
  }

  return data.id as string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const rendered = await renderEmailFromTemplate(input.template, input.data, {
    subject: input.subject,
    customMessage: input.customMessage,
  });

  const sender = resolveDepartmentSender(
    input.department ?? rendered.department,
  );

  const testOverride = getEmailTestOverride();
  const recipient = testOverride ?? input.recipient.trim();
  const subject = testOverride
    ? `[DEV → ${input.recipient}] ${rendered.subject}`
    : rendered.subject;

  const apiKey = getResendApiKey();
  if (!apiKey) {
    const logId = await createEmailLog({
      userId: input.userId,
      recipientEmail: input.recipient,
      senderEmail: sender.address,
      senderDisplayName: sender.displayName,
      department: input.department ?? rendered.department,
      templateKey: input.template,
      subject: rendered.subject,
      status: process.env.NODE_ENV === "development" ? "skipped" : "failed",
      errorMessage: "RESEND_API_KEY is not configured.",
      sentBy: input.sentBy,
      metadata: input.metadata,
    });

    if (process.env.NODE_ENV === "development") {
      console.info("[sendEmail:dev] Skipped send", {
        to: input.recipient,
        template: input.template,
        subject: rendered.subject,
      });
      return { ok: false, logId, error: "RESEND_API_KEY is not configured." };
    }

    return { ok: false, logId, error: "RESEND_API_KEY is not configured." };
  }

  const pendingLogId = await createEmailLog({
    userId: input.userId,
    recipientEmail: input.recipient,
    senderEmail: sender.address,
    senderDisplayName: sender.displayName,
    department: input.department ?? rendered.department,
    templateKey: input.template,
    subject: rendered.subject,
    status: "pending",
    sentBy: input.sentBy,
    metadata: input.metadata,
  });

  let result = await postResendEmail({
    from: sender.from,
    to: recipient,
    subject,
    html: rendered.html,
    text: rendered.text,
  });

  const domainNotVerified =
    !result.ok &&
    result.error.toLowerCase().includes("domain is not verified");

  if (domainNotVerified && sender.from !== getDevFallbackFrom()) {
    result = await postResendEmail({
      from: getDevFallbackFrom(),
      to: recipient,
      subject,
      html: rendered.html,
      text: rendered.text,
    });
  }

  const supabase = createServiceRoleClient();

  if (result.ok) {
    await supabase
      .from("email_communication_logs")
      .update({
        status: "sent",
        resend_id: result.id,
        error_message: null,
      })
      .eq("id", pendingLogId);

    return { ok: true, logId: pendingLogId, resendId: result.id };
  }

  await supabase
    .from("email_communication_logs")
    .update({
      status: "failed",
      error_message: result.error,
    })
    .eq("id", pendingLogId);

  console.error("[sendEmail] Send failed:", {
    recipient: input.recipient,
    template: input.template,
    error: result.error,
  });

  return { ok: false, logId: pendingLogId, error: result.error };
}
