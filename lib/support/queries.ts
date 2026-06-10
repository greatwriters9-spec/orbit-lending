import { createClient } from "@/lib/supabase/server";
import { createSupportAttachmentSignedUrl } from "@/lib/support/storage";
import type {
  SupportAnalytics,
  SupportKnowledgeArticle,
  SupportSummary,
  SupportTicket,
  SupportTicketAttachment,
  SupportTicketFilters,
  SupportTicketMessage,
  SupportTimelineEvent,
} from "@/types/support";

function mapTicket(row: Record<string, unknown>): SupportTicket {
  return {
    id: row.id as string,
    ticketNumber: row.ticket_number as string,
    borrowerId: row.borrower_id as string,
    applicationId: (row.application_id as string | null) ?? null,
    subject: row.subject as string,
    category: row.category as SupportTicket["category"],
    priority: row.priority as SupportTicket["priority"],
    status: row.status as SupportTicket["status"],
    description: row.description as string,
    contactPreference: row.contact_preference as SupportTicket["contactPreference"],
    assignedTo: (row.assigned_to as string | null) ?? null,
    assignedStaffName: (row.assigned_staff_name as string | null) ?? null,
    escalationLevel: row.escalation_level as SupportTicket["escalationLevel"],
    escalatedAt: (row.escalated_at as string | null) ?? null,
    resolvedAt: (row.resolved_at as string | null) ?? null,
    closedAt: (row.closed_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    borrowerName:
      row.profiles && typeof row.profiles === "object"
        ? [
            (row.profiles as { first_name?: string }).first_name,
            (row.profiles as { last_name?: string }).last_name,
          ]
            .filter(Boolean)
            .join(" ") || null
        : null,
    borrowerEmail:
      row.profiles && typeof row.profiles === "object"
        ? ((row.profiles as { email?: string }).email ?? null)
        : null,
  };
}

function mapMessage(row: Record<string, unknown>): SupportTicketMessage {
  return {
    id: row.id as string,
    ticketId: row.ticket_id as string,
    senderId: (row.sender_id as string | null) ?? null,
    senderRole: row.sender_role as SupportTicketMessage["senderRole"],
    senderName: row.sender_name as string,
    message: row.message as string,
    isInternal: Boolean(row.is_internal),
    createdAt: row.created_at as string,
  };
}

function mapTimeline(row: Record<string, unknown>): SupportTimelineEvent {
  return {
    id: row.id as string,
    ticketId: row.ticket_id as string,
    eventType: row.event_type as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    actorId: (row.actor_id as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}

function mapArticle(row: Record<string, unknown>): SupportKnowledgeArticle {
  return {
    id: row.id as string,
    slug: row.slug as string,
    category: row.category as string,
    title: row.title as string,
    summary: row.summary as string,
    content: row.content as string,
    tags: (row.tags as string[]) ?? [],
  };
}

export async function fetchClientTickets(
  borrowerId: string,
  filters?: SupportTicketFilters,
): Promise<SupportTicket[]> {
  const supabase = await createClient();
  let query = supabase
    .from("support_tickets")
    .select("*")
    .eq("borrower_id", borrowerId)
    .order("updated_at", { ascending: false });

  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.category?.length) {
    query = query.in("category", filters.category);
  }
  if (filters?.priority?.length) {
    query = query.in("priority", filters.priority);
  }

  const { data } = await query;
  let rows = (data ?? []).map(mapTicket);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(q) ||
        ticket.ticketNumber.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q),
    );
  }

  return rows;
}

export async function fetchFinanceTickets(
  filters?: SupportTicketFilters,
  staffId?: string,
): Promise<SupportTicket[]> {
  const supabase = await createClient();
  let query = supabase
    .from("support_tickets")
    .select("*, profiles:borrower_id(first_name, last_name, email)")
    .order("updated_at", { ascending: false });

  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.category?.length) {
    query = query.in("category", filters.category);
  }
  if (filters?.priority?.length) {
    query = query.in("priority", filters.priority);
  }
  if (filters?.assignedToMe && staffId) {
    query = query.eq("assigned_to", staffId);
  }

  const { data } = await query;
  let rows = (data ?? []).map(mapTicket);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(q) ||
        ticket.ticketNumber.toLowerCase().includes(q) ||
        (ticket.borrowerName ?? "").toLowerCase().includes(q) ||
        (ticket.borrowerEmail ?? "").toLowerCase().includes(q),
    );
  }

  return rows;
}

export async function fetchTicketById(
  ticketId: string,
): Promise<SupportTicket | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("*, profiles:borrower_id(first_name, last_name, email)")
    .eq("id", ticketId)
    .maybeSingle();

  return data ? mapTicket(data) : null;
}

export async function fetchTicketMessages(
  ticketId: string,
  includeInternal = false,
): Promise<SupportTicketMessage[]> {
  const supabase = await createClient();
  let query = supabase
    .from("support_ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (!includeInternal) {
    query = query.eq("is_internal", false);
  }

  const { data: messages } = await query;
  const { data: attachments } = await supabase
    .from("support_ticket_attachments")
    .select("*")
    .eq("ticket_id", ticketId);

  const attachmentMap = new Map<string, SupportTicketAttachment[]>();
  for (const row of attachments ?? []) {
    const attachment: SupportTicketAttachment = {
      id: row.id,
      ticketId: row.ticket_id,
      messageId: row.message_id,
      fileName: row.file_name,
      storagePath: row.storage_path,
      downloadUrl: await createSupportAttachmentSignedUrl(row.storage_path),
      createdAt: row.created_at,
    };
    const key = row.message_id ?? "ticket";
    attachmentMap.set(key, [...(attachmentMap.get(key) ?? []), attachment]);
  }

  return (messages ?? []).map((row) => {
    const message = mapMessage(row);
    message.attachments = attachmentMap.get(message.id) ?? [];
    return message;
  });
}

export async function fetchTicketTimeline(
  ticketId: string,
): Promise<SupportTimelineEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_ticket_timeline")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return (data ?? []).map(mapTimeline);
}

export async function fetchTicketAttachments(
  ticketId: string,
): Promise<SupportTicketAttachment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_ticket_attachments")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false });

  return Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      ticketId: row.ticket_id,
      messageId: row.message_id,
      fileName: row.file_name,
      storagePath: row.storage_path,
      downloadUrl: await createSupportAttachmentSignedUrl(row.storage_path),
      createdAt: row.created_at,
    })),
  );
}

export async function fetchKnowledgeArticles(
  search?: string,
  category?: string,
): Promise<SupportKnowledgeArticle[]> {
  const supabase = await createClient();
  let query = supabase
    .from("support_knowledge_articles")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data } = await query;
  let rows = (data ?? []).map(mapArticle);

  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q) ||
        article.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  return rows;
}

export async function fetchSupportSummary(
  borrowerId: string,
): Promise<SupportSummary> {
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("status, updated_at")
    .eq("borrower_id", borrowerId);

  const rows = tickets ?? [];
  const openStatuses = new Set([
    "open",
    "assigned",
    "in_progress",
    "waiting_for_client",
    "escalated",
  ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", borrowerId)
    .eq("category", "support")
    .eq("read", false);

  return {
    openTickets: rows.filter((row) => openStatuses.has(row.status)).length,
    awaitingClient: rows.filter((row) => row.status === "waiting_for_client")
      .length,
    recentResponses: rows.filter(
      (row) => new Date(row.updated_at) >= sevenDaysAgo,
    ).length,
    unreadSupportNotifications: unreadCount ?? 0,
  };
}

export async function fetchSupportAnalytics(): Promise<SupportAnalytics> {
  const supabase = await createClient();
  const { data: tickets } = await supabase.from("support_tickets").select("*");
  const { data: satisfaction } = await supabase
    .from("support_ticket_satisfaction")
    .select("rating");

  const rows = tickets ?? [];
  const openStatuses = new Set([
    "open",
    "assigned",
    "in_progress",
    "waiting_for_client",
    "escalated",
  ]);

  const resolved = rows.filter((row) => row.resolved_at);
  const resolutionHours = resolved.map((row) => {
    const start = new Date(row.created_at).getTime();
    const end = new Date(row.resolved_at as string).getTime();
    return (end - start) / (1000 * 60 * 60);
  });

  const byCategory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  for (const row of rows) {
    byCategory[row.category] = (byCategory[row.category] ?? 0) + 1;
    byPriority[row.priority] = (byPriority[row.priority] ?? 0) + 1;
  }

  const ratings = (satisfaction ?? []).map((row) => Number(row.rating));
  const satisfactionScore = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;

  const escalated = rows.filter((row) => row.status === "escalated").length;

  return {
    openTickets: rows.filter((row) => openStatuses.has(row.status)).length,
    averageResolutionHours: resolutionHours.length
      ? resolutionHours.reduce((sum, hours) => sum + hours, 0) /
        resolutionHours.length
      : 0,
    satisfactionScore,
    byCategory,
    byPriority,
    escalationRate: rows.length ? escalated / rows.length : 0,
  };
}

export async function fetchTicketSatisfaction(
  ticketId: string,
): Promise<{ rating: number; feedback: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_ticket_satisfaction")
    .select("rating, feedback")
    .eq("ticket_id", ticketId)
    .maybeSingle();

  return data
    ? { rating: data.rating, feedback: data.feedback }
    : null;
}
