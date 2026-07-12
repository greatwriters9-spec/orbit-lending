import { AuditLogTable } from "@/components/admin/audit-log-table";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchPlatformAuditLogs } from "@/lib/admin/audit/queries";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Audit Logs",
};

export default async function SuperAdminAuditLogsPage() {
  const ctx = await requireSuperAdmin();

  if (!hasAdminPermission(ctx.role, "audit:view")) {
    redirect("/super-admin");
  }

  const logs = await fetchPlatformAuditLogs({ limit: 200 });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Audit Logs"
        description="Complete record of administrative actions, product changes, and account governance events."
      />
      <AuditLogTable logs={logs} />
    </div>
  );
}

