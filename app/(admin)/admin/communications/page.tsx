import { CommunicationCenter } from "@/components/admin/communication-center";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchCommunicationCenterDataAction } from "@/lib/email/admin-actions";
import { requireAdmin } from "@/lib/auth/guards";
import { getRoleLabel } from "@/lib/auth/roles";
import { getCompanyContext } from "@/lib/company/server";

export default async function AdminCommunicationsPage() {
  const ctx = await requireAdmin();
  const { branding } = await getCompanyContext();
  const data = await fetchCommunicationCenterDataAction();
  const senderName =
    ctx.profile?.first_name && ctx.profile?.last_name
      ? `${ctx.profile.first_name} ${ctx.profile.last_name}`
      : ctx.user.email ?? "";
  const senderTitle = getRoleLabel(ctx.role);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Communications"
        description={`Send and review institutional client emails from ${branding.institutionName} departments.`}
      />
      <CommunicationCenter
        initialUsers={data.users}
        initialLogs={data.logs}
        clientCount={data.clientCount}
        memberCount={data.memberCount}
        senderName={senderName}
        senderTitle={senderTitle}
      />
    </div>
  );
}
