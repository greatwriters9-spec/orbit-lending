import { CommunicationCenter } from "@/components/admin/communication-center";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchCommunicationCenterDataAction } from "@/lib/email/admin-actions";
import { requireSuperAdmin } from "@/lib/auth/guards";

export default async function SuperAdminCommunicationsPage() {
  await requireSuperAdmin();
  const data = await fetchCommunicationCenterDataAction();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Communications"
        description="Send and review institutional client emails from Orbit Mortgage departments."
      />
      <CommunicationCenter
        initialUsers={data.users}
        initialLogs={data.logs}
      />
    </div>
  );
}
