import { notFound } from "next/navigation";

import { UserDetailView } from "@/components/admin/user-detail-view";
import {
  canChangeUserRole,
  canManageAccountStatus,
} from "@/lib/admin/permissions";
import {
  fetchAdminUserApplications,
  fetchAdminUserDetail,
  fetchAdminUserFundingApplication,
  fetchAdminUserLoans,
  fetchAdminUserMessages,
  fetchAdminUserTransactions,
  fetchAdminUserWallet,
} from "@/lib/admin/users/queries";
import { fetchUserEmailCommunicationLogs } from "@/lib/email/queries";
import { requireSuperAdmin } from "@/lib/auth/guards";

type PageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function SuperAdminUserDetailPage({
  params,
  searchParams,
}: PageProps) {
  const ctx = await requireSuperAdmin();
  const { userId } = await params;
  const { tab } = await searchParams;

  const user = await fetchAdminUserDetail(userId);
  if (!user) {
    notFound();
  }

  const [applications, loans, wallet, transactions, messages, fundingApplication, emailLogs] =
    await Promise.all([
      fetchAdminUserApplications(userId),
      fetchAdminUserLoans(userId),
      fetchAdminUserWallet(userId),
      fetchAdminUserTransactions(userId),
      fetchAdminUserMessages(userId),
      fetchAdminUserFundingApplication(userId),
      fetchUserEmailCommunicationLogs(userId),
    ]);

  return (
    <UserDetailView
      user={user}
      applications={applications}
      loans={loans}
      wallet={wallet}
      transactions={transactions}
      messages={messages}
      emailLogs={emailLogs}
      canManageStatus={canManageAccountStatus(ctx.role)}
      canChangeRole={canChangeUserRole(ctx.role)}
      usersBasePath="/super-admin/users"
      activeTab={tab ?? "profile"}
      fundingApplication={fundingApplication}
    />
  );
}
