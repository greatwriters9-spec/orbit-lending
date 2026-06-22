import type { ReactNode } from "react";

import { SuperAdminShell } from "@/components/layout/super-admin-shell";
import {
  buildDashboardUser,
  requireSuperAdmin,
} from "@/lib/auth/guards";
import {
  getDisplayName,
  getInitials,
} from "@/lib/auth/profile";
import { getProfileRouteForRole } from "@/lib/auth/navigation";
import { getRoleLabel } from "@/lib/auth/roles";
import { fetchUnreadAdminNotificationCount } from "@/lib/notifications/admin-queries";

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await requireSuperAdmin();
  const unreadNotifications = await fetchUnreadAdminNotificationCount();

  const userDisplay = buildDashboardUser(ctx, {
    name: getDisplayName(ctx.profile, ctx.user.email),
    firstName: getDisplayName(ctx.profile, ctx.user.email),
    initials: getInitials(ctx.profile, ctx.user.email),
    roleLabel: getRoleLabel(ctx.role),
    profileHref: getProfileRouteForRole(ctx.role),
  });

  return (
    <SuperAdminShell user={userDisplay} unreadNotifications={unreadNotifications}>
      {children}
    </SuperAdminShell>
  );
}
