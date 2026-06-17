import Link from "next/link";
import { notFound } from "next/navigation";

import { requireClient } from "@/lib/auth/guards";
import { ClientTicketDetail } from "@/components/support/client-ticket-detail";
import {
  fetchTicketAttachments,
  fetchTicketById,
  fetchTicketMessages,
  fetchTicketSatisfaction,
  fetchTicketTimeline,
} from "@/lib/support/queries";

export const metadata = {
  title: "Support Ticket | Orbit Mortgage",
};

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const ctx = await requireClient();
  const { ticketId } = await params;

  const ticket = await fetchTicketById(ticketId);
  if (!ticket || ticket.borrowerId !== ctx.user.id) {
    notFound();
  }

  const [messages, timeline, attachments, satisfaction] = await Promise.all([
    fetchTicketMessages(ticketId),
    fetchTicketTimeline(ticketId),
    fetchTicketAttachments(ticketId),
    fetchTicketSatisfaction(ticketId),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/support" className="text-sm text-brand-blue hover:underline">
        ← Back to Support
      </Link>
      <ClientTicketDetail
        ticket={ticket}
        messages={messages}
        timeline={timeline}
        attachments={attachments}
        satisfaction={satisfaction}
      />
    </div>
  );
}
