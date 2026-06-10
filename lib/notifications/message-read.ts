import { createClient } from "@/lib/supabase/server";

const STAFF_SENDER_ROLES = ["finance", "officer", "system"] as const;

export async function markApplicationMessagesRead(
  userId: string,
  applicationId: string,
): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase.from("application_message_read_states").upsert(
    {
      user_id: userId,
      application_id: applicationId,
      last_read_at: now,
    },
    { onConflict: "user_id,application_id" },
  );

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("category", "finance_message")
    .eq("read", false)
    .contains("metadata", { applicationId });
}

export async function countUnreadStaffMessages(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("loan_applications")
    .select("id")
    .eq("user_id", userId)
    .neq("status", "draft");

  const appIds = (applications ?? []).map((app) => app.id);
  if (appIds.length === 0) {
    return 0;
  }

  const [{ data: readStates }, { data: messages }] = await Promise.all([
    supabase
      .from("application_message_read_states")
      .select("application_id, last_read_at")
      .eq("user_id", userId)
      .in("application_id", appIds),
    supabase
      .from("application_messages")
      .select("application_id, created_at")
      .in("application_id", appIds)
      .in("sender_role", [...STAFF_SENDER_ROLES]),
  ]);

  const lastReadMap = new Map(
    (readStates ?? []).map((row) => [row.application_id, row.last_read_at]),
  );

  return (messages ?? []).filter((message) => {
    const lastRead = lastReadMap.get(message.application_id);
    if (!lastRead) {
      return true;
    }
    return new Date(message.created_at) > new Date(lastRead);
  }).length;
}

export async function getUnreadStaffMessagesByApplication(
  userId: string,
  applicationIds: string[],
): Promise<Map<string, number>> {
  const supabase = await createClient();
  const unreadMap = new Map<string, number>();

  if (applicationIds.length === 0) {
    return unreadMap;
  }

  const [{ data: readStates }, { data: messages }] = await Promise.all([
    supabase
      .from("application_message_read_states")
      .select("application_id, last_read_at")
      .eq("user_id", userId)
      .in("application_id", applicationIds),
    supabase
      .from("application_messages")
      .select("application_id, created_at")
      .in("application_id", applicationIds)
      .in("sender_role", [...STAFF_SENDER_ROLES]),
  ]);

  const lastReadMap = new Map(
    (readStates ?? []).map((row) => [row.application_id, row.last_read_at]),
  );

  for (const message of messages ?? []) {
    const lastRead = lastReadMap.get(message.application_id);
    const isUnread =
      !lastRead || new Date(message.created_at) > new Date(lastRead);

    if (isUnread) {
      unreadMap.set(
        message.application_id,
        (unreadMap.get(message.application_id) ?? 0) + 1,
      );
    }
  }

  return unreadMap;
}

export async function getLatestUnreadStaffMessage(userId: string) {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("loan_applications")
    .select("id")
    .eq("user_id", userId)
    .neq("status", "draft");

  const appIds = (applications ?? []).map((app) => app.id);
  if (appIds.length === 0) {
    return null;
  }

  const unreadMap = await getUnreadStaffMessagesByApplication(userId, appIds);
  const unreadAppIds = [...unreadMap.keys()];
  if (unreadAppIds.length === 0) {
    return null;
  }

  const { data: message } = await supabase
    .from("application_messages")
    .select("application_id, message, sender_name, created_at")
    .in("application_id", unreadAppIds)
    .in("sender_role", ["finance", "officer"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return message;
}

export async function markSupportTicketNotificationsRead(
  userId: string,
  ticketId: string,
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("category", "support")
    .eq("read", false)
    .contains("metadata", { ticketId });
}
