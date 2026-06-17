import { SectionHeader } from "@/components/ui-kit/section-header";
import { UsersTable, UserSearchForm } from "@/components/admin/user-management";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { fetchAdminUsers } from "@/lib/admin/users/queries";
import { requireAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User Management | Orbit Mortgage",
};

type PageProps = {
  searchParams: Promise<{
    search?: string;
    role?: string;
    accountStatus?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const ctx = await requireAdmin();

  if (!hasAdminPermission(ctx.role, "users:view")) {
    redirect("/admin");
  }

  const params = await searchParams;
  const users = await fetchAdminUsers({
    search: params.search,
    role: params.role,
    accountStatus: params.accountStatus,
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="User Management"
        description="View client and staff accounts, applications, and account activity."
      />
      <UserSearchForm basePath="/admin/users" />
      <UsersTable users={users} basePath="/admin/users" />
    </div>
  );
}

