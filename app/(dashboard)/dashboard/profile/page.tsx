import { UserCommunicationHistory } from "@/components/admin/user-communication-history";
import { ClientProfilePage } from "@/components/profile/client-profile-page";
import { requireClient } from "@/lib/auth/guards";
import { fetchUserEmailCommunicationLogs } from "@/lib/email/queries";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const ctx = await requireClient();

  if (!ctx.profile) {
    return null;
  }

  const emailLogs = await fetchUserEmailCommunicationLogs(ctx.user.id);

  return (
    <div className="space-y-8">
      <ClientProfilePage profile={ctx.profile} email={ctx.user.email ?? ""} />
      <UserCommunicationHistory logs={emailLogs} variant="client" />
    </div>
  );
}

