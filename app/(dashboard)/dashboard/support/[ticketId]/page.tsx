import { notFound } from "next/navigation";

import { requireClient } from "@/lib/auth/guards";
import { ClientTicketDetail } from "@/components/support/client-ticket-detail";
import {
  fetchTicketAttachments,
  fetchTicketById,
  fetchTicketMessages,
  fetchTicketSatisfaction,
} from "@/lib/support/queries";

export const metadata = {
  title: "Live Support | Orbit Mortgage",
};

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const ctx = await requireClient();
  const { ticketId } = await params;

  const ticket = await fetchTicketById(ticketId, ctx.user.id);
  if (!ticket) {
    notFound();
  }

  const [messages, attachments, satisfaction] = await Promise.all([
    fetchTicketMessages(ticketId),
    fetchTicketAttachments(ticketId),
    fetchTicketSatisfaction(ticketId),
  ]);

  return (
    <ClientTicketDetail
      ticket={ticket}
      messages={messages}
      attachments={attachments}
      satisfaction={satisfaction}
    />
  );
}
