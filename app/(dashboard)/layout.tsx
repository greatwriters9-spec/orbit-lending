import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  buildDashboardUser,
  requireAuthenticated,
} from "@/lib/auth/guards";
import {
  getDisplayName,
  getInitials,
} from "@/lib/auth/profile";
import { getProfileRouteForRole } from "@/lib/auth/navigation";
import { getRoleLabel } from "@/lib/auth/roles";
import {
  fetchUnreadMessageCount,
  fetchUnreadNotificationCount,
} from "@/lib/notifications/queries";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await requireAuthenticated();

  const [unreadNotifications, unreadMessages] = await Promise.all([
    fetchUnreadNotificationCount(ctx.user.id),
    fetchUnreadMessageCount(ctx.user.id),
  ]);

  const userDisplay = buildDashboardUser(ctx, {
    name:
      ctx.profile?.first_name && ctx.profile?.last_name
        ? `${ctx.profile.first_name} ${ctx.profile.last_name}`
        : getDisplayName(ctx.profile, ctx.user.email),
    firstName: getDisplayName(ctx.profile, ctx.user.email),
    initials: getInitials(ctx.profile, ctx.user.email),
    roleLabel: getRoleLabel(ctx.role),
    profileHref: getProfileRouteForRole(ctx.role),
  });

  return (
    <DashboardShell
      user={userDisplay}
      unreadNotifications={unreadNotifications}
      unreadMessages={unreadMessages}
    >
      {children}
    </DashboardShell>
  );
}
