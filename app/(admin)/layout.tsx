import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import {
  buildDashboardUser,
  requireAdmin,
} from "@/lib/auth/guards";
import {
  getDisplayName,
  getInitials,
} from "@/lib/auth/profile";
import { getProfileRouteForRole } from "@/lib/auth/navigation";
import { getRoleLabel } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await requireAdmin();

  const userDisplay = buildDashboardUser(ctx, {
    name: getDisplayName(ctx.profile, ctx.user.email),
    firstName: getDisplayName(ctx.profile, ctx.user.email),
    initials: getInitials(ctx.profile, ctx.user.email),
    roleLabel: getRoleLabel(ctx.role),
    profileHref: getProfileRouteForRole(ctx.role),
  });

  return <AdminShell user={userDisplay}>{children}</AdminShell>;
}
