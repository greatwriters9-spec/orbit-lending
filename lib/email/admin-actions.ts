"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/guards";
import {
  ADMIN_SENDABLE_TEMPLATES,
  EMAIL_TEMPLATE_LABELS,
  resolveTemplateDepartment,
} from "@/lib/email/templates/catalog";
import { fetchAllEmailCommunicationLogs } from "@/lib/email/queries";
import { sendEmail } from "@/lib/email/service";
import type { EmailDepartment, EmailTemplateKey } from "@/lib/email/types";
import { createClient } from "@/lib/supabase/server";

const sendCommunicationSchema = z.object({
  recipientEmail: z.email("Enter a valid recipient email."),
  userId: z.string().uuid().optional(),
  department: z.enum([
    "system",
    "loan_officer",
    "underwriting",
    "funding",
    "closings",
    "support",
    "executive",
  ]),
  template: z.string().min(1),
  subject: z.string().min(3, "Subject is required."),
  headline: z.string().optional(),
  staffName: z.string().optional(),
  staffTitle: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type AdminCommunicationActionState = {
  error?: string;
  success?: string;
};

export async function fetchCommunicationCenterDataAction() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role")
    .order("created_at", { ascending: false })
    .limit(200);

  const logs = await fetchAllEmailCommunicationLogs({ limit: 50 });

  return {
    users: (users ?? []).map((user) => ({
      id: user.id as string,
      email: user.email as string,
      name:
        user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : (user.email as string),
      role: user.role as string,
    })),
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

  const result = await sendEmail({
    department: parsed.data.department as EmailDepartment,
    template,
    recipient: parsed.data.recipientEmail,
    userId: parsed.data.userId,
    subject: parsed.data.subject,
    customMessage: parsed.data.message,
    sentBy: ctx.user.id,
    data: {
      subject: parsed.data.subject,
      headline:
        parsed.data.headline?.trim() ||
        parsed.data.subject,
      message: parsed.data.message,
      staffName: parsed.data.staffName?.trim() || undefined,
      staffTitle: parsed.data.staffTitle?.trim() || undefined,
    },
    metadata: {
      source: "admin_communication_center",
    },
  });

  revalidatePath("/admin/communications");
  revalidatePath("/super-admin/communications");

  if (parsed.data.userId) {
    revalidatePath(`/admin/users/${parsed.data.userId}`);
    revalidatePath(`/super-admin/users/${parsed.data.userId}`);
  }

  if (!result.ok) {
    return { error: result.error };
  }

  return { success: "Email sent and logged successfully." };
}
