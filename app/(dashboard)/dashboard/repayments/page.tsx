import { requireClient } from "@/lib/auth/guards";
import { ClientRepaymentsDashboard } from "@/components/repayments/client-repayments-dashboard";
import { fetchClientRepaymentSummary } from "@/lib/repayments/queries";

export const metadata = {
  title: "Repayments | Orbit Lending",
};

export default async function RepaymentsPage() {
  const ctx = await requireClient();
  const summary = await fetchClientRepaymentSummary(ctx.user.id);

  return <ClientRepaymentsDashboard summary={summary} />;
}
