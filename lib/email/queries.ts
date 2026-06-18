import type { EmailCommunicationLog, EmailTemplateKey } from "@/lib/email/types";
import { getEmailTemplateLabel } from "@/lib/email/templates/catalog";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

type EmailLogRow = {
  id: string;
  user_id: string | null;
  recipient_email: string;
  sender_email: string;
  sender_display_name: string;
  department: string;
  template_key: string;
  subject: string;
  status: string;
  resend_id: string | null;
  error_message: string | null;
  sent_by: string | null;
  created_at: string;
};

function mapEmailLog(row: EmailLogRow): EmailCommunicationLog {
  return {
    id: row.id,
    userId: row.user_id,
    recipientEmail: row.recipient_email,
    senderEmail: row.sender_email,
    senderDisplayName: row.sender_display_name,
    department: row.department as EmailCommunicationLog["department"],
    templateKey: row.template_key as EmailTemplateKey,
    subject: row.subject,
    status: row.status as EmailCommunicationLog["status"],
    resendId: row.resend_id,
    errorMessage: row.error_message,
    sentBy: row.sent_by,
    createdAt: row.created_at,
  };
}

export { getEmailTemplateLabel } from "@/lib/email/templates/catalog";

export async function fetchUserEmailCommunicationLogs(
  userId: string,
  limit = 50,
): Promise<EmailCommunicationLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("email_communication_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => mapEmailLog(row as EmailLogRow));
}

export async function fetchAllEmailCommunicationLogs(input?: {
  limit?: number;
  recipientEmail?: string;
}): Promise<EmailCommunicationLog[]> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("email_communication_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(input?.limit ?? 100);

  if (input?.recipientEmail) {
    query = query.ilike("recipient_email", `%${input.recipientEmail}%`);
  }

  const { data } = await query;
  return (data ?? []).map((row) => mapEmailLog(row as EmailLogRow));
}

export async function fetchRecentEmailCommunicationLogs(
  limit = 25,
): Promise<EmailCommunicationLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("email_communication_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => mapEmailLog(row as EmailLogRow));
}
