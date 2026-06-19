import { formatApplicationDate } from "@/lib/applications/status-utils";
import { hasOutstandingDocumentRequests } from "@/lib/applications/document-request-status";
import {
  countUnreadStaffMessages,
  getLatestUnreadStaffMessage,
  getUnreadStaffMessagesByApplication,
} from "@/lib/notifications/message-read";
import { createClient } from "@/lib/supabase/server";
import type { NotificationPriority } from "@/types/dashboard";
import type {
  ApplicationActivityEvent,
  ClientNotification,
  NotificationCategory,
  PriorityAction,
} from "@/types/notifications";

function mapNotification(row: {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  read: boolean;
  modal_dismissed: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}): ClientNotification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type as ClientNotification["type"],
    category: row.category as NotificationCategory,
    priority: row.priority as ClientNotification["priority"],
    read: row.read,
    modalDismissed: row.modal_dismissed,
    actionUrl: row.action_url ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export async function fetchUserNotifications(
  userId: string,
  options?: { category?: NotificationCategory; limit?: number },
): Promise<ClientNotification[]> {
  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data } = await query;
  return (data ?? []).map(mapNotification);
}

export async function fetchUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return count ?? 0;
}

export async function fetchCriticalAlerts(
  userId: string,
): Promise<ClientNotification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("priority", "critical")
    .eq("modal_dismissed", false)
    .order("created_at", { ascending: false })
    .limit(3);

  return (data ?? []).map(mapNotification);
}

export async function fetchUnreadMessageCount(userId: string): Promise<number> {
  return countUnreadStaffMessages(userId);
}

export async function fetchPriorityActions(userId: string): Promise<PriorityAction[]> {
  const supabase = await createClient();
  const actions: PriorityAction[] = [];

  const { data: applications } = await supabase
    .from("loan_applications")
    .select("id, status, application_number, loan_product_slug")
    .eq("user_id", userId)
    .neq("status", "draft")
    .order("updated_at", { ascending: false });

  for (const app of applications ?? []) {
    const href = `/dashboard/loans/${app.id}`;

    if (app.status === "information_required") {
      actions.push({
        id: `docs-${app.id}`,
        label: "Upload Required Documents",
        description: `Application ${app.application_number ?? ""} needs additional documents.`,
        href,
        priority: "critical",
      });
    }

    if (app.status === "offer_sent") {
      actions.push({
        id: `offer-${app.id}`,
        label: "Review Mortgage Offer",
        description: "A mortgage offer is waiting for your response.",
        href,
        priority: "critical",
      });
    }

    const { data: pendingOffers } = await supabase
      .from("loan_offers")
      .select("id")
      .eq("application_id", app.id)
      .eq("status", "pending")
      .limit(1);

    if (pendingOffers?.length && app.status !== "offer_sent") {
      actions.push({
        id: `offer-pending-${app.id}`,
        label: "Review Mortgage Offer",
        description: "Review and respond to your mortgage offer.",
        href,
        priority: "high",
      });
    }

    const { data: docRequests } = await supabase
      .from("application_document_requests")
      .select("review_status, fulfilled, file_url")
      .eq("application_id", app.id);

    if (
      hasOutstandingDocumentRequests(docRequests ?? []) &&
      app.status !== "information_required"
    ) {
      actions.push({
        id: `doc-req-${app.id}`,
        label: "Upload Required Documents",
        description: "Outstanding document requests on your application.",
        href,
        priority: "high",
      });
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_status")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.profile_status !== "complete") {
    actions.push({
      id: "complete-profile",
      label: "Complete Verification",
      description: "Finish your profile to unlock full account features.",
      href: "/profile/complete",
      priority: "normal",
    });
  }

  const recentFinanceMsg = await getLatestUnreadStaffMessage(userId);

  if (recentFinanceMsg) {
    actions.push({
      id: `msg-${recentFinanceMsg.application_id}`,
      label: "Respond To Loan Officer Message",
      description: `${recentFinanceMsg.sender_name} sent a message about your application.`,
      href: `/dashboard/loans/${recentFinanceMsg.application_id}`,
      priority: "high",
    });
  }

  const { data: awaitingTickets } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, subject")
    .eq("borrower_id", userId)
    .eq("status", "waiting_for_client")
    .limit(3);

  for (const ticket of awaitingTickets ?? []) {
    actions.push({
      id: `support-${ticket.id}`,
      label: "Respond To Support Ticket",
      description: `${ticket.ticket_number}: ${ticket.subject}`,
      href: `/dashboard/support/${ticket.id}`,
      priority: "high",
    });
  }

  const priorityOrder = { critical: 0, high: 1, normal: 2 };
  return actions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
}

export async function fetchApplicationActivity(
  applicationId: string,
): Promise<ApplicationActivityEvent[]> {
  const supabase = await createClient();

  const [activityRes, historyRes, messagesRes] = await Promise.all([
    supabase
      .from("application_activity_events")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("application_status_history")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("application_messages")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false }),
  ]);

  const events: ApplicationActivityEvent[] = [];

  for (const row of activityRes.data ?? []) {
    events.push({
      id: row.id,
      applicationId: row.application_id,
      eventType: row.event_type,
      title: row.title,
      description: row.description ?? undefined,
      actorName: row.actor_name ?? undefined,
      createdAt: row.created_at,
    });
  }

  for (const row of historyRes.data ?? []) {
    events.push({
      id: `status-${row.id}`,
      applicationId: row.application_id,
      eventType: "status_change",
      title: row.status.replace(/_/g, " "),
      description: row.note ?? undefined,
      createdAt: row.created_at,
    });
  }

  for (const row of messagesRes.data ?? []) {
    if (row.sender_role === "client") continue;
    events.push({
      id: `msg-${row.id}`,
      applicationId: row.application_id,
      eventType: "message",
      title: `Message from ${row.sender_name}`,
      description: row.message,
      actorName: row.sender_name,
      createdAt: row.created_at,
    });
  }

  return events.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function fetchUserMessageThreads(userId: string) {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("loan_applications")
    .select("id, application_number, loan_product_slug, status, updated_at")
    .eq("user_id", userId)
    .neq("status", "draft")
    .order("updated_at", { ascending: false });

  const appIds = (applications ?? []).map((a) => a.id);
  const unreadByApp = await getUnreadStaffMessagesByApplication(userId, appIds);

  const threads = [];

  for (const app of applications ?? []) {
    const { data: messages } = await supabase
      .from("application_messages")
      .select("*")
      .eq("application_id", app.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const last = messages?.[0];
    threads.push({
      applicationId: app.id,
      applicationNumber: app.application_number ?? "Application",
      productSlug: app.loan_product_slug,
      status: app.status,
      lastMessage: last?.message ?? "No messages yet",
      lastSender: last?.sender_name ?? "",
      lastAt: last?.created_at ?? app.updated_at,
      formattedDate: formatApplicationDate(last?.created_at ?? app.updated_at),
      unreadCount: unreadByApp.get(app.id) ?? 0,
    });
  }

  return threads;
}

export function mapNotificationToDashboard(n: ClientNotification) {
  const priorityMap = {
    critical: "warning" as const,
    high: "warning" as const,
    normal: "default" as const,
    informational: "default" as const,
  };

  const successStatuses = ["approved", "funded", "active", "completed", "offer_accepted"];

  let priority: NotificationPriority = priorityMap[n.priority];
  if (
    n.metadata.status &&
    typeof n.metadata.status === "string" &&
    successStatuses.includes(n.metadata.status)
  ) {
    priority = "success";
  }

  return {
    id: n.id,
    title: n.title,
    message: n.message,
    timestamp: formatApplicationDate(n.createdAt),
    priority,
    unread: !n.read,
    actionUrl: n.actionUrl,
  };
}
