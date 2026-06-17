import { SectionHeader } from "@/components/ui-kit/section-header";
import { UsersTable, UserSearchForm } from "@/components/admin/user-management";
import { fetchAdminUsers } from "@/lib/admin/users/queries";
import { requireSuperAdmin } from "@/lib/auth/guards";

export const metadata = {
  title: "Users | Orbit Mortgage",
};

type PageProps = {
  searchParams: Promise<{
    search?: string;
    role?: string;
    accountStatus?: string;
  }>;
};

export default async function SuperAdminUsersPage({ searchParams }: PageProps) {
  await requireSuperAdmin();
  const params = await searchParams;
  const users = await fetchAdminUsers({
    search: params.search,
    role: params.role,
    accountStatus: params.accountStatus,
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Users"
        description="Institution-wide user directory with account governance controls."
      />
      <UserSearchForm basePath="/super-admin/users" />
      <UsersTable users={users} basePath="/super-admin/users" />
    </div>
  );
}

