import { requireClient } from "@/lib/auth/guards";
import { ClientSupportCenter } from "@/components/support/client-support-center";
import {
  fetchClientTickets,
  fetchKnowledgeArticles,
  fetchSupportSummary,
} from "@/lib/support/queries";
import { processStaleTicketEscalations } from "@/lib/support/actions";
import type { SupportTicketCategory } from "@/types/support";

export const metadata = {
  title: "Support",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string; category?: string }>;
}) {
  const ctx = await requireClient();
  await processStaleTicketEscalations();
  const params = await searchParams;

  const [tickets, articles, summary] = await Promise.all([
    fetchClientTickets(ctx.user.id),
    fetchKnowledgeArticles(),
    fetchSupportSummary(ctx.user.id),
  ]);

  return (
    <ClientSupportCenter
      tickets={tickets}
      articles={articles}
      summary={summary}
      initialOpenTicket={params.open === "ticket"}
      initialCategory={params.category as SupportTicketCategory | undefined}
    />
  );
}

