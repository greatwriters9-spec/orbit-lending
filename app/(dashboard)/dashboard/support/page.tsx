import { requireClient } from "@/lib/auth/guards";
import { ClientSupportCenter } from "@/components/support/client-support-center";
import {
  fetchClientTickets,
  fetchKnowledgeArticles,
  fetchSupportSummary,
} from "@/lib/support/queries";
import { processStaleTicketEscalations } from "@/lib/support/actions";

export const metadata = {
  title: "Support | Orbit Lending",
};

export default async function SupportPage() {
  const ctx = await requireClient();
  await processStaleTicketEscalations();

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
    />
  );
}
