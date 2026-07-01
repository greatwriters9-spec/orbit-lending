"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/guards";
import {
  ADMIN_SENDABLE_TEMPLATES,
  EMAIL_TEMPLATE_LABELS,
  resolveTemplateDepartment,
} from "@/lib/email/templates/catalog";
import { fetchAllEmailCommunicationLogs, fetchEmailCommunicationLogById } from "@/lib/email/queries";
import {
  buildCommunicationLogMetadata,
  renderCommunicationPreview,
  sanitizeCommunicationMessage,
  type CommunicationPreviewResult,
  type CommunicationRecipient,
} from "@/lib/email/communication-compose";
import { stripHtmlToText } from "@/lib/email/sanitize-html";
import { sendEmail } from "@/lib/email/service";
import type { EmailDepartment, EmailCommunicationLog, EmailTemplateKey } from "@/lib/email/types";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const recipientModeSchema = z.enum(["single", "multiple", "all"]);
const audienceSchema = z.enum(["clients", "all"]);

const sendCommunicationSchema = z
  .object({
    recipientMode: recipientModeSchema.default("single"),
    audience: audienceSchema.default("clients"),
    recipientEmail: z.string().optional(),
    userId: z.string().uuid().optional(),
    userIds: z.array(z.string().uuid()).optional(),
    department: z.enum([
      "system",
      "loan_officer",
      "underwriting",
      "funding",
      "closings",
      "compliance",
      "support",
      "executive",
    ]),
    template: z.string().min(1),
    subject: z.string().min(3, "Subject is required."),
    headline: z.string().optional(),
    staffName: z.string().optional(),
    staffTitle: z.string().optional(),
    message: z.string().min(1, "Message is required."),
  })
  .superRefine((data, ctx) => {
    const messageText = stripHtmlToText(data.message);
    if (messageText.length < 10) {
      ctx.addIssue({
        code: "custom",
        message: "Message must be at least 10 characters.",
        path: ["message"],
      });
    }

    if (data.recipientMode === "single") {
      const email = data.recipientEmail?.trim();
      if (!email || !z.email().safeParse(email).success) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid recipient email.",
          path: ["recipientEmail"],
        });
      }
    }

    if (data.recipientMode === "multiple") {
      if (!data.userIds?.length) {
        ctx.addIssue({
          code: "custom",
          message: "Select at least one recipient.",
          path: ["userIds"],
        });
      }
    }
  });

export type AdminCommunicationActionState = {
  error?: string;
  success?: string;
};

export type EmailCommunicationLogDetail = {
  log: EmailCommunicationLog;
  html: string;
};

export type { CommunicationRecipient } from "@/lib/email/communication-compose";

function mapProfileToRecipient(user: {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}): CommunicationRecipient | null {
  if (!user.email?.trim()) {
    return null;
  }

  return {
    id: user.id,
    email: user.email.trim(),
    name:
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.email,
    role: user.role ?? "client",
  };
}

async function fetchCommunicationRecipients(
  audience: z.infer<typeof audienceSchema>,
): Promise<CommunicationRecipient[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role")
    .not("email", "is", null)
    .order("created_at", { ascending: false });

  if (audience === "clients") {
    query = query.eq("role", "client");
  }

  const { data } = await query;
  return (data ?? [])
    .map((user) =>
      mapProfileToRecipient({
        id: user.id as string,
        email: user.email as string | null,
        first_name: user.first_name as string | null,
        last_name: user.last_name as string | null,
        role: user.role as string | null,
      }),
    )
    .filter((user): user is CommunicationRecipient => user !== null);
}

async function resolveCommunicationRecipients(input: {
  recipientMode: z.infer<typeof recipientModeSchema>;
  audience: z.infer<typeof audienceSchema>;
  recipientEmail?: string;
  userId?: string;
  userIds?: string[];
}): Promise<CommunicationRecipient[]> {
  if (input.recipientMode === "single") {
    const email = input.recipientEmail?.trim();
    if (!email) {
      return [];
    }

    if (input.userId) {
      const supabase = createServiceRoleClient();
      const { data } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, role")
        .eq("id", input.userId)
        .maybeSingle();

      const mapped = data ? mapProfileToRecipient(data as never) : null;
      if (mapped) {
        return [{ ...mapped, email }];
      }
    }

    return [
      {
        id: input.userId ?? email,
        email,
        name: email,
        role: "client",
      },
    ];
  }

  if (input.recipientMode === "multiple") {
    const ids = new Set(input.userIds ?? []);
    const all = await fetchCommunicationRecipients("all");
    return all.filter((user) => ids.has(user.id));
  }

  return fetchCommunicationRecipients(input.audience);
}

export async function fetchCommunicationCenterDataAction() {
  await requireAdmin();

  const [users, logs] = await Promise.all([
    fetchCommunicationRecipients("all"),
    fetchAllEmailCommunicationLogs({ limit: 50 }),
  ]);

  const clientCount = users.filter((user) => user.role === "client").length;

  return {
    users,
    clientCount,
    memberCount: users.length,
    logs,
    templates: ADMIN_SENDABLE_TEMPLATES.map((key) => ({
      key,
      label: EMAIL_TEMPLATE_LABELS[key],
      department: resolveTemplateDepartment(key),
    })),
  };
}

export async function sendAdminCommunicationAction(
  input: z.infer<typeof sendCommunicationSchema>,
): Promise<AdminCommunicationActionState> {
  const ctx = await requireAdmin();
  const parsed = sendCommunicationSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const template = parsed.data.template as EmailTemplateKey;
  if (!ADMIN_SENDABLE_TEMPLATES.includes(template)) {
    return { error: "Invalid email template selected." };
  }

  const recipients = await resolveCommunicationRecipients(parsed.data);
  if (recipients.length === 0) {
    return { error: "No recipients matched your selection." };
  }

  const department = parsed.data.department as EmailDepartment;
  const sanitizedMessage = sanitizeCommunicationMessage(parsed.data.message);
  const preview = await renderCommunicationPreview({
    compose: parsed.data,
    sanitizedMessage,
    recipients,
  });

  if (!preview.readyToSend) {
    return {
      error:
        preview.checks.find((check) => !check.ok)?.detail ??
        "Review the email details before sending.",
    };
  }

  const logMetadata = buildCommunicationLogMetadata({
    compose: parsed.data,
    sanitizedMessage,
    renderedHtml: preview.html,
    recipientCount: recipients.length,
  });

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const recipient of recipients) {
    const result = await sendEmail({
      department,
      template,
      recipient: recipient.email,
      userId: recipient.id.includes("@") ? undefined : recipient.id,
      subject: parsed.data.subject,
      customMessage: sanitizedMessage,
      sentBy: ctx.user.id,
      data: {
        subject: parsed.data.subject,
        headline: parsed.data.headline?.trim() || parsed.data.subject,
        message: sanitizedMessage,
        staffName: parsed.data.staffName?.trim() || undefined,
        staffTitle: parsed.data.staffTitle?.trim() || undefined,
      },
      metadata: {
        ...logMetadata,
        event:
          template === "custom_message"
            ? `department:${department}`
            : template,
      },
    });

    if (result.ok) {
      sent += 1;
    } else {
      failed += 1;
      if (result.error && errors.length < 3) {
        errors.push(`${recipient.email}: ${result.error}`);
      }
    }
  }

  revalidatePath("/admin/communications");
  revalidatePath("/super-admin/communications");

  for (const recipient of recipients) {
    if (!recipient.id.includes("@")) {
      revalidatePath(`/admin/users/${recipient.id}`);
      revalidatePath(`/super-admin/users/${recipient.id}`);
    }
  }

  if (sent === 0) {
    return {
      error:
        errors[0] ??
        "Unable to send email to the selected recipients.",
    };
  }

  if (failed > 0) {
    return {
      success: `Sent to ${sent} recipient${sent === 1 ? "" : "s"}. ${failed} failed.`,
    };
  }

  if (parsed.data.recipientMode === "single") {
    return { success: "Email sent and logged successfully." };
  }

  return {
    success: `Broadcast sent to ${sent} recipient${sent === 1 ? "" : "s"}.`,
  };
}

export async function previewAdminCommunicationAction(
  input: z.infer<typeof sendCommunicationSchema>,
): Promise<{ error?: string; preview?: CommunicationPreviewResult }> {
  await requireAdmin();
  const parsed = sendCommunicationSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const template = parsed.data.template as EmailTemplateKey;
  if (!ADMIN_SENDABLE_TEMPLATES.includes(template)) {
    return { error: "Invalid email template selected." };
  }

  const recipients = await resolveCommunicationRecipients(parsed.data);
  const sanitizedMessage = sanitizeCommunicationMessage(parsed.data.message);
  const preview = await renderCommunicationPreview({
    compose: parsed.data,
    sanitizedMessage,
    recipients,
  });

  return { preview };
}

export async function fetchEmailCommunicationLogDetailAction(
  logId: string,
): Promise<{ error?: string; detail?: EmailCommunicationLogDetail }> {
  await requireAdmin();

  const log = await fetchEmailCommunicationLogById(logId);
  if (!log) {
    return { error: "Email log not found." };
  }

  const storedHtml =
    typeof log.metadata.renderedHtml === "string" ? log.metadata.renderedHtml : null;

  if (storedHtml) {
    return { detail: { log, html: storedHtml } };
  }

  const composition = log.metadata.composition as
    | {
        subject?: string;
        headline?: string;
        messageHtml?: string;
        staffName?: string | null;
        staffTitle?: string | null;
        department?: EmailDepartment;
        template?: EmailTemplateKey;
      }
    | undefined;

  if (composition?.messageHtml && composition.template) {
    const rendered = await renderCommunicationPreview({
      compose: {
        recipientMode: "single",
        audience: "clients",
        department: composition.department ?? log.department,
        template: composition.template,
        subject: composition.subject ?? log.subject,
        headline: composition.headline,
        staffName: composition.staffName ?? undefined,
        staffTitle: composition.staffTitle ?? undefined,
        message: composition.messageHtml,
      },
      sanitizedMessage: composition.messageHtml,
      recipients: [
        {
          id: log.userId ?? log.recipientEmail,
          email: log.recipientEmail,
          name: log.recipientEmail,
          role: "client",
        },
      ],
    });

    return { detail: { log, html: rendered.html } };
  }

  return {
    detail: {
      log,
      html: `<html><body style="font-family:Arial,sans-serif;padding:24px;"><h1>${log.subject}</h1><p>Full email preview is not available for this older log entry.</p></body></html>`,
    },
  };
}

export async function deleteEmailCommunicationLogAction(
  logId: string,
): Promise<AdminCommunicationActionState> {
  await requireAdmin();

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("email_communication_logs")
    .delete()
    .eq("id", logId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/communications");
  revalidatePath("/super-admin/communications");

  return { success: "Email log deleted." };
}
