import Link from "next/link";
import { notFound } from "next/navigation";

import { requireFinanceStaff } from "@/lib/auth/guards";
import { FinanceTicketDetail } from "@/components/support/finance-ticket-detail";
import {
  fetchTicketById,
  fetchTicketMessages,
  fetchTicketTimeline,
} from "@/lib/support/queries";

export const metadata = {
  title: "Support Ticket | Finance Portal",
};

export default async function FinanceSupportTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  await requireFinanceStaff();
  const { ticketId } = await params;

  const ticket = await fetchTicketById(ticketId);
  if (!ticket) {
    notFound();
  }

  const [messages, timeline] = await Promise.all([
    fetchTicketMessages(ticketId, true),
    fetchTicketTimeline(ticketId),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/finance/support" className="text-sm text-brand-blue hover:underline">
        ← Back to Support Center
      </Link>
      <FinanceTicketDetail ticket={ticket} messages={messages} timeline={timeline} />
    </div>
  );
}
