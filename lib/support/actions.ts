"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireClient, requireFinanceStaff } from "@/lib/auth/guards";
import { resolveRole } from "@/lib/auth/navigation";
import { logAuditEntry } from "@/lib/finance/audit";
import { notifyUser } from "@/lib/notifications/service";
import {
  generateTicketNumber,
  getInitialEscalationLevel,
  shouldAutoEscalate,
} from "@/lib/support/constants";
import { uploadSupportAttachment } from "@/lib/support/storage";
import { createClient } from "@/lib/supabase/server";
import type {
  SupportActionState,
  SupportContactPreference,
  SupportEscalationLevel,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/types/support";

const createTicketSchema = z.object({
  subject: z.string().min(3, "Subject is required."),
  category: z.string(),
  description: z.string().min(10, "Please provide more detail."),
  priority: z.enum(["low", "normal", "high", "urgent", "critical"]),
  contactPreference: z.enum(["email", "in_app", "both"]),
  applicationId: z.string().uuid().optional().nullable(),
});

async function appendTimeline(input: {
  ticketId: string;
  eventType: string;
  title: string;
  description?: string;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  await supabase.from("support_ticket_timeline").insert({
    ticket_id: input.ticketId,
    event_type: input.eventType,
    title: input.title,
    description: input.description ?? null,
    actor_id: input.actorId ?? null,
    metadata: input.metadata ?? {},
  });
}

async function notifySupportEvent(input: {
  userId: string;
  title: string;
  message: string;
  ticketId: string;
  priority?: "critical" | "high" | "normal" | "informational";
  sendEmail?: boolean;
}) {
  await notifyUser({
    userId: input.userId,
    title: input.title,
    message: input.message,
    category: "support",
    priority: input.priority ?? "normal",
    actionUrl: `/dashboard/support/${input.ticketId}`,
    sendEmail: input.sendEmail ?? true,
    metadata: { ticketId: input.ticketId },
  });
}

export async function createSupportTicketAction(
  formData: FormData,
): Promise<SupportActionState> {
  const ctx = await requireClient();
  const parsed = createTicketSchema.safeParse({
    subject: formData.get("subject"),
    category: formData.get("category"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    contactPreference: formData.get("contactPreference"),
    applicationId: formData.get("applicationId") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const ticketNumber = generateTicketNumber();
  const autoEscalate = shouldAutoEscalate(parsed.data.priority);
  const escalationLevel = getInitialEscalationLevel(parsed.data.priority);

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      ticket_number: ticketNumber,
      borrower_id: ctx.user.id,
      application_id: parsed.data.applicationId,
      subject: parsed.data.subject,
      category: parsed.data.category as SupportTicketCategory,
      priority: parsed.data.priority as SupportTicketPriority,
      status: autoEscalate ? "escalated" : "open",
      description: parsed.data.description,
      contact_preference: parsed.data
        .contactPreference as SupportContactPreference,
      escalation_level: escalationLevel,
      escalated_at: autoEscalate ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !ticket) {
    return { error: error?.message ?? "Unable to create ticket." };
  }

  const senderName =
    `${ctx.profile?.first_name ?? ""} ${ctx.profile?.last_name ?? ""}`.trim() ||
    ctx.user.email ||
    "Client";

  const { data: message } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticket.id,
      sender_id: ctx.user.id,
      sender_role: "client",
      sender_name: senderName,
      message: parsed.data.description,
    })
    .select("id")
    .single();

  const attachment = formData.get("attachment");
  if (message && attachment instanceof File && attachment.size > 0) {
    const upload = await uploadSupportAttachment({
      userId: ctx.user.id,
      ticketId: ticket.id,
      file: attachment,
    });

    if (!upload.error) {
      await supabase.from("support_ticket_attachments").insert({
        ticket_id: ticket.id,
        message_id: message.id,
        file_name: attachment.name,
        storage_path: upload.storagePath,
        uploaded_by: ctx.user.id,
      });
    }
  }

  await appendTimeline({
    ticketId: ticket.id,
    eventType: "created",
    title: "Ticket Created",
    description: `Ticket ${ticketNumber} submitted.`,
    actorId: ctx.user.id,
  });

  if (autoEscalate) {
    await appendTimeline({
      ticketId: ticket.id,
      eventType: "escalated",
      title: "Automatically Escalated",
      description: `Priority ${parsed.data.priority} ticket escalated to ${escalationLevel.replace(/_/g, " ")}.`,
      actorId: ctx.user.id,
    });
  }

  await notifySupportEvent({
    userId: ctx.user.id,
    title: "Support Ticket Created",
    message: `Your ticket ${ticketNumber} has been submitted. Our team will respond shortly.`,
    ticketId: ticket.id,
    priority: parsed.data.priority === "critical" ? "critical" : "high",
  });

  await logAuditEntry({
    action: "support.ticket_created",
    entityType: "support_ticket",
    entityId: ticket.id,
    newValues: {
      ticketNumber,
      category: parsed.data.category,
      priority: parsed.data.priority,
    },
  });

  revalidatePath("/dashboard/support");
  revalidatePath("/dashboard");

  return {
    success: `Ticket ${ticketNumber} created successfully.`,
    ticketId: ticket.id,
  };
}

export async function replyToTicketAction(
  formData: FormData,
): Promise<SupportActionState> {
  const ctx = await requireClient();
  const ticketId = formData.get("ticketId")?.toString();
  const message = formData.get("message")?.toString().trim();

  if (!ticketId || !message) {
    return { error: "Message is required." };
  }

  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .eq("borrower_id", ctx.user.id)
    .maybeSingle();

  if (!ticket) {
    return { error: "Ticket not found." };
  }

  const senderName =
    `${ctx.profile?.first_name ?? ""} ${ctx.profile?.last_name ?? ""}`.trim() ||
    "Client";

  const { data: inserted } = await supabase
    .from("support_ticket_messages")
    .insert({
      ticket_id: ticketId,
      sender_id: ctx.user.id,
      sender_role: "client",
      sender_name: senderName,
      message,
    })
    .select("id")
    .single();

  const attachment = formData.get("attachment");
  if (inserted && attachment instanceof File && attachment.size > 0) {
    const upload = await uploadSupportAttachment({
      userId: ctx.user.id,
      ticketId,
      file: attachment,
    });
    if (!upload.error) {
      await supabase.from("support_ticket_attachments").insert({
        ticket_id: ticketId,
        message_id: inserted.id,
        file_name: attachment.name,
        storage_path: upload.storagePath,
        uploaded_by: ctx.user.id,
      });
    }
  }

  await supabase
    .from("support_tickets")
    .update({
      status: "open",
      last_client_response_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  await appendTimeline({
    ticketId,
    eventType: "client_reply",
    title: "Client Responded",
    actorId: ctx.user.id,
  });

  revalidatePath(`/dashboard/support/${ticketId}`);
  revalidatePath("/finance/support");

  return { success: "Reply sent." };
}

export async function submitTicketSatisfactionAction(input: {
  ticketId: string;
  rating: number;
  feedback?: string;
}): Promise<SupportActionState> {
  const ctx = await requireClient();
  if (input.rating < 1 || input.rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, status")
    .eq("id", input.ticketId)
    .eq("borrower_id", ctx.user.id)
    .maybeSingle();

  if (!ticket || !["resolved", "closed"].includes(ticket.status)) {
    return { error: "Feedback can only be submitted for resolved tickets." };
  }

  const { error } = await supabase.from("support_ticket_satisfaction").upsert({
    ticket_id: input.ticketId,
    rating: input.rating,
    feedback: input.feedback ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  await appendTimeline({
    ticketId: input.ticketId,
    eventType: "satisfaction",
    title: "Feedback Submitted",
    description: `${input.rating}-star rating received.`,
    actorId: ctx.user.id,
  });

  revalidatePath(`/dashboard/support/${input.ticketId}`);
  return { success: "Thank you for your feedback." };
}

export async function staffReplyToTicketAction(
  formData: FormData,
): Promise<SupportActionState> {
  const ctx = await requireFinanceStaff();
  const ticketId = formData.get("ticketId")?.toString();
  const message = formData.get("message")?.toString().trim();
  const isInternal = formData.get("isInternal") === "true";

  if (!ticketId || !message) {
    return { error: "Message is required." };
  }

  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) {
    return { error: "Ticket not found." };
  }

  const senderName =
    `${ctx.profile?.first_name ?? ""} ${ctx.profile?.last_name ?? ""}`.trim() ||
    "Support Staff";

  await supabase.from("support_ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: ctx.user.id,
    sender_role: "staff",
    sender_name: senderName,
    message,
    is_internal: isInternal,
  });

  if (!isInternal) {
    await supabase
      .from("support_tickets")
      .update({
        status: "waiting_for_client",
        assigned_to: ticket.assigned_to ?? ctx.user.id,
        assigned_staff_name: ticket.assigned_staff_name ?? senderName,
        last_staff_response_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    await notifySupportEvent({
      userId: ticket.borrower_id,
      title: "Support Team Responded",
      message: `New response on ticket ${ticket.ticket_number}: ${ticket.subject}`,
      ticketId,
      priority: "high",
    });

    await appendTimeline({
      ticketId,
      eventType: "staff_reply",
      title: "Staff Responded",
      actorId: ctx.user.id,
    });
  }

  await logAuditEntry({
    action: "support.staff_reply",
    entityType: "support_ticket",
    entityId: ticketId,
    newValues: { isInternal },
  });

  revalidatePath(`/finance/support/${ticketId}`);
  revalidatePath(`/dashboard/support/${ticketId}`);

  return { success: isInternal ? "Internal note added." : "Reply sent to client." };
}

export async function assignTicketAction(input: {
  ticketId: string;
  assigneeId?: string | null;
}): Promise<SupportActionState> {
  const ctx = await requireFinanceStaff();
  const supabase = await createClient();

  let assigneeName = "Unassigned";
  if (input.assigneeId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", input.assigneeId)
      .maybeSingle();
    assigneeName =
      `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
      "Staff Member";
  }

  const { data: ticket } = await supabase
    .from("support_tickets")
    .update({
      assigned_to: input.assigneeId ?? ctx.user.id,
      assigned_staff_name: input.assigneeId ? assigneeName : `${ctx.profile?.first_name ?? ""} ${ctx.profile?.last_name ?? ""}`.trim(),
      status: "assigned",
    })
    .eq("id", input.ticketId)
    .select("*")
    .single();

  if (!ticket) {
    return { error: "Ticket not found." };
  }

  await appendTimeline({
    ticketId: input.ticketId,
    eventType: "assigned",
    title: "Ticket Assigned",
    description: `Assigned to ${ticket.assigned_staff_name}.`,
    actorId: ctx.user.id,
  });

  await notifySupportEvent({
    userId: ticket.borrower_id,
    title: "Support Ticket Assigned",
    message: `Your ticket ${ticket.ticket_number} has been assigned to a support specialist.`,
    ticketId: input.ticketId,
  });

  revalidatePath("/finance/support");
  return { success: "Ticket assigned." };
}

export async function updateTicketStatusAction(input: {
  ticketId: string;
  status: SupportTicketStatus;
  note?: string;
}): Promise<SupportActionState> {
  const ctx = await requireFinanceStaff();
  const supabase = await createClient();

  const updates: Record<string, unknown> = { status: input.status };
  if (input.status === "resolved") {
    updates.resolved_at = new Date().toISOString();
  }
  if (input.status === "closed") {
    updates.closed_at = new Date().toISOString();
  }

  const { data: ticket } = await supabase
    .from("support_tickets")
    .update(updates)
    .eq("id", input.ticketId)
    .select("*")
    .single();

  if (!ticket) {
    return { error: "Ticket not found." };
  }

  await appendTimeline({
    ticketId: input.ticketId,
    eventType: input.status,
    title: `Status Updated — ${input.status.replace(/_/g, " ")}`,
    description: input.note,
    actorId: ctx.user.id,
  });

  const notifyTitles: Partial<Record<SupportTicketStatus, string>> = {
    resolved: "Support Ticket Resolved",
    closed: "Support Ticket Closed",
    escalated: "Support Ticket Escalated",
    in_progress: "Support Ticket In Progress",
  };

  if (notifyTitles[input.status]) {
    await notifySupportEvent({
      userId: ticket.borrower_id,
      title: notifyTitles[input.status]!,
      message: `Ticket ${ticket.ticket_number} status: ${input.status.replace(/_/g, " ")}.`,
      ticketId: input.ticketId,
      priority: input.status === "escalated" ? "critical" : "high",
    });
  }

  await logAuditEntry({
    action: "support.status_updated",
    entityType: "support_ticket",
    entityId: input.ticketId,
    newValues: { status: input.status, note: input.note },
  });

  revalidatePath("/finance/support");
  revalidatePath(`/dashboard/support/${input.ticketId}`);

  return { success: "Ticket status updated." };
}

export async function escalateTicketAction(input: {
  ticketId: string;
  level: SupportEscalationLevel;
  reason?: string;
}): Promise<SupportActionState> {
  const ctx = await requireFinanceStaff();
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("support_tickets")
    .update({
      status: "escalated",
      escalation_level: input.level,
      escalated_at: new Date().toISOString(),
    })
    .eq("id", input.ticketId)
    .select("*")
    .single();

  if (!ticket) {
    return { error: "Ticket not found." };
  }

  await appendTimeline({
    ticketId: input.ticketId,
    eventType: "escalated",
    title: "Ticket Escalated",
    description: input.reason ?? `Escalated to ${input.level.replace(/_/g, " ")}.`,
    actorId: ctx.user.id,
  });

  await notifySupportEvent({
    userId: ticket.borrower_id,
    title: "Support Ticket Escalated",
    message: `Your ticket ${ticket.ticket_number} has been escalated for priority handling.`,
    ticketId: input.ticketId,
    priority: "critical",
  });

  revalidatePath("/finance/support");
  return { success: "Ticket escalated." };
}

export async function processStaleTicketEscalations(): Promise<number> {
  const supabase = await createClient();
  const threshold = new Date();
  threshold.setHours(threshold.getHours() - 48);

  const { data: staleTickets } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, borrower_id, priority")
    .in("status", ["open", "assigned", "in_progress"])
    .lt("created_at", threshold.toISOString())
    .is("last_staff_response_at", null);

  for (const ticket of staleTickets ?? []) {
    await supabase
      .from("support_tickets")
      .update({
        status: "escalated",
        escalation_level: "credit_manager",
        escalated_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);

    await appendTimeline({
      ticketId: ticket.id,
      eventType: "auto_escalated",
      title: "Auto-Escalated",
      description: "No staff response within 48 hours.",
    });

    await notifySupportEvent({
      userId: ticket.borrower_id,
      title: "Support Ticket Escalated",
      message: `Ticket ${ticket.ticket_number} was escalated due to response time.`,
      ticketId: ticket.id,
      priority: "high",
    });
  }

  return staleTickets?.length ?? 0;
}
