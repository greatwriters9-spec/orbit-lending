import { notFound } from "next/navigation";

import { UserDetailView } from "@/components/admin/user-detail-view";
import {
  canChangeUserRole,
  canManageAccountStatus,
} from "@/lib/admin/permissions";
import {
  fetchAdminUserApplications,
  fetchAdminUserDetail,
  fetchAdminUserLoans,
  fetchAdminUserMessages,
  fetchAdminUserTransactions,
  fetchAdminUserWallet,
} from "@/lib/admin/users/queries";
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

  const [applications, loans, wallet, transactions, messages] =
    await Promise.all([
      fetchAdminUserApplications(userId),
      fetchAdminUserLoans(userId),
      fetchAdminUserWallet(userId),
      fetchAdminUserTransactions(userId),
      fetchAdminUserMessages(userId),
    ]);

  return (
    <UserDetailView
      user={user}
      applications={applications}
      loans={loans}
      wallet={wallet}
      transactions={transactions}
      messages={messages}
      canManageStatus={canManageAccountStatus(ctx.role)}
      canChangeRole={canChangeUserRole(ctx.role)}
      usersBasePath="/super-admin/users"
      activeTab={tab ?? "profile"}
    />
  );
}
