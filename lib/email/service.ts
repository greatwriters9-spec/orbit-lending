import {
  getEmailTestOverride,
  getResendApiKey,
} from "@/lib/email/config";
import {
  getEmailSender,
  resolveOutgoingEmailEvent,
} from "@/lib/email/emailRouter";
import { deliverResendEmailWithDevFallback } from "@/lib/email/resend-client";
import { renderEmailFromTemplate } from "@/lib/email/templates/catalog";
import type {
  EmailDeliveryStatus,
  SendEmailInput,
  SendEmailResult,
} from "@/lib/email/types";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

async function resolveEmailCompanyId(
  input: SendEmailInput,
): Promise<string | undefined> {
  const metadataCompanyId = input.metadata?.company_id;
  if (typeof metadataCompanyId === "string" && metadataCompanyId.trim()) {
    return metadataCompanyId;
  }

  if (!input.userId) {
    try {
      const { getCurrentCompanyId } = await import("@/lib/company/server");
      return await getCurrentCompanyId();
    } catch {
      return undefined;
    }
  }

  const supabase = createServiceRoleClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", input.userId)
    .maybeSingle();

  if (profile?.company_id) {
    return profile.company_id;
  }

  const { data: authUser } = await supabase.auth.admin.getUserById(input.userId);
  const metaCompanyId = authUser?.user?.user_metadata?.company_id;
  if (typeof metaCompanyId === "string" && metaCompanyId.trim()) {
    return metaCompanyId;
  }

  try {
    const { getCurrentCompanyId } = await import("@/lib/company/server");
    return await getCurrentCompanyId();
  } catch {
    return undefined;
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
  const companyId = await resolveEmailCompanyId(input);
  const rendered = await renderEmailFromTemplate(input.template, input.data, {
    subject: input.subject,
    customMessage: input.customMessage,
  }, companyId);

  const event = resolveOutgoingEmailEvent({
    template: input.template,
    department: input.department,
    metadata: input.metadata,
  });
  const sender = getEmailSender(event);
  const logDepartment = sender.department;

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
      senderEmail: sender.fromEmail,
      senderDisplayName: sender.fromName,
      department: logDepartment,
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
    senderEmail: sender.fromEmail,
    senderDisplayName: sender.fromName,
    department: logDepartment,
    templateKey: input.template,
    subject: rendered.subject,
    status: "pending",
    sentBy: input.sentBy,
    metadata: input.metadata,
  });

  const result = await deliverResendEmailWithDevFallback({
    from: sender.from,
    to: recipient,
    subject,
    html: rendered.html,
    text: rendered.text,
    replyTo: sender.replyTo,
  });

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
