import { requireFinanceStaff } from "@/lib/auth/guards";
import { FinanceSupportCenter } from "@/components/support/finance-support-center";
import {
  fetchFinanceTickets,
  fetchSupportAnalytics,
} from "@/lib/support/queries";
import { processStaleTicketEscalations } from "@/lib/support/actions";

export const metadata = {
  title: "Support Center | Finance Portal",
};

export default async function FinanceSupportPage() {
  const ctx = await requireFinanceStaff();
  await processStaleTicketEscalations();

  const [tickets, analytics] = await Promise.all([
    fetchFinanceTickets(),
    fetchSupportAnalytics(),
  ]);

  return (
    <FinanceSupportCenter
      tickets={tickets}
      analytics={analytics}
      staffId={ctx.user.id}
    />
  );
}
