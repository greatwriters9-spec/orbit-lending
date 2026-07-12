import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/actions";
import { getProfile, isProfileComplete } from "@/lib/auth/profile";
import { resolveRole } from "@/lib/auth/navigation";
import {
  canAccountPerform,
  requiresAccountStatusPage,
} from "@/lib/auth/account-status";
import {
  getDefaultRouteForRole,
  isAdminStaff,
  isFinanceStaff,
  isSuperAdmin,
  USER_ROLES,
  type UserRole,
} from "@/lib/auth/roles";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import type { AccountStatus, UserProfile } from "@/types/profile";
import type { AccountRestriction } from "@/lib/auth/account-status";

export type AuthContext = {
  user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;
  profile: UserProfile | null;
  role: UserRole;
  accountStatus: AccountStatus;
};

async function getAuthContext(): Promise<AuthContext> {
  const user = await getSessionUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const profile = await getProfile(user.id);

  if (!isProfileComplete(profile) && !isFinanceStaff(profile?.role)) {
    redirect(AUTH_ROUTES.profileComplete);
  }

  const accountStatus = (profile?.account_status ?? "active") as AccountStatus;

  if (
    profile?.role === USER_ROLES.client &&
    requiresAccountStatusPage(accountStatus)
  ) {
    redirect(AUTH_ROUTES.accountStatus);
  }

  return {
    user,
    profile,
    role: resolveRole(profile?.role),
    accountStatus,
  };
}

function denyAccess(role: UserRole, useUnauthorizedPage = false) {
  if (useUnauthorizedPage) {
    redirect(AUTH_ROUTES.unauthorized);
  }
  redirect(getDefaultRouteForRole(role));
}

export async function requireAuthenticated(): Promise<AuthContext> {
  return getAuthContext();
}

export async function requireClient(): Promise<AuthContext> {
  const ctx = await getAuthContext();

  if (ctx.role !== USER_ROLES.client) {
    denyAccess(ctx.role);
  }

  return ctx;
}

export async function requireClientCapability(
  restriction: AccountRestriction,
): Promise<AuthContext> {
  const ctx = await requireClient();

  if (!canAccountPerform(ctx.accountStatus, restriction)) {
    redirect(AUTH_ROUTES.accountStatus);
  }

  return ctx;
}

export async function requireFinanceOfficer(): Promise<AuthContext> {
  const ctx = await getAuthContext();

  if (ctx.role !== USER_ROLES.financeOfficer) {
    denyAccess(ctx.role);
  }

  return ctx;
}

export async function requireFinanceStaff(): Promise<AuthContext> {
  const ctx = await getAuthContext();

  if (!isFinanceStaff(ctx.role)) {
    denyAccess(ctx.role);
  }

  return ctx;
}

export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await getAuthContext();

  if (!isAdminStaff(ctx.role)) {
    denyAccess(ctx.role);
  }

  return ctx;
}

export async function requireSuperAdmin(): Promise<AuthContext> {
  const ctx = await getAuthContext();

  if (!isSuperAdmin(ctx.role)) {
    denyAccess(ctx.role);
  }

  return ctx;
}

export async function requireRoles(
  allowedRoles: UserRole[],
): Promise<AuthContext> {
  const ctx = await getAuthContext();

  if (!allowedRoles.includes(ctx.role)) {
    denyAccess(ctx.role);
  }

  return ctx;
}

export function buildDashboardUser(
  ctx: AuthContext,
  display: {
    name: string;
    firstName: string;
    initials: string;
    roleLabel: string;
    profileHref: string;
  },
) {
  return {
    name: display.name,
    firstName: display.firstName,
    initials: display.initials,
    avatarUrl: ctx.profile?.avatar_url ?? null,
    email: ctx.user.email ?? "",
    role: display.roleLabel,
    roleKey: ctx.role,
    profileHref: display.profileHref,
    homeHref: getDefaultRouteForRole(ctx.role),
  };
}
