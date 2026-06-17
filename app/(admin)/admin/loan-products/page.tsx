import { redirect } from "next/navigation";

import { MortgageManagement } from "@/components/admin/mortgage-management";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata = {
  title: "Mortgage Management | Orbit Mortgage",
};

export default async function AdminLoanProductsPage() {
  const ctx = await requireAdmin();

  if (!hasAdminPermission(ctx.role, "products:manage")) {
    redirect("/admin");
  }

  const config = await fetchMortgageConfig();

  return <MortgageManagement config={config} />;
}
