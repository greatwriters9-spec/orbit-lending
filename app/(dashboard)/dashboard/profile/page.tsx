import { UserCommunicationHistory } from "@/components/admin/user-communication-history";
import { ClientProfilePage } from "@/components/profile/client-profile-page";
import { fetchCompanyById } from "@/lib/company/queries";
import { companyToBrandingConfig } from "@/lib/company/branding";
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
  const company = ctx.profile.company_id
    ? await fetchCompanyById(ctx.profile.company_id)
    : null;
  const institutionName = company
    ? companyToBrandingConfig(company).institutionName
    : null;

  return (
    <div className="space-y-8">
      <ClientProfilePage
        profile={ctx.profile}
        email={ctx.user.email ?? ""}
        institutionName={institutionName}
      />
      <UserCommunicationHistory logs={emailLogs} variant="client" />
    </div>
  );
}

