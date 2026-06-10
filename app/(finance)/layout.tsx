import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import { FinanceShell } from "@/components/layout/finance-shell";
import { SuperAdminShell } from "@/components/layout/super-admin-shell";
import {
  buildDashboardUser,
  requireFinanceStaff,
} from "@/lib/auth/guards";
import {
  getDisplayName,
  getInitials,
} from "@/lib/auth/profile";
import { getProfileRouteForRole } from "@/lib/auth/navigation";
import { getRoleLabel, USER_ROLES } from "@/lib/auth/roles";

export default async function FinanceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await requireFinanceStaff();

  const userDisplay = buildDashboardUser(ctx, {
    name: getDisplayName(ctx.profile, ctx.user.email),
    firstName: getDisplayName(ctx.profile, ctx.user.email),
    initials: getInitials(ctx.profile, ctx.user.email),
    roleLabel: getRoleLabel(ctx.role),
    profileHref: getProfileRouteForRole(ctx.role),
  });

  if (ctx.role === USER_ROLES.superAdmin) {
    return (
      <SuperAdminShell user={userDisplay}>{children}</SuperAdminShell>
    );
  }

  if (ctx.role === USER_ROLES.admin) {
    return <AdminShell user={userDisplay}>{children}</AdminShell>;
  }

  return <FinanceShell user={userDisplay}>{children}</FinanceShell>;
}
