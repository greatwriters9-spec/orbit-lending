import { AUTH_ROUTES } from "@/lib/auth/routes";
import {
  isSupportedRole,
  USER_ROLES,
  type UserRole,
} from "@/lib/auth/roles";

export function getProfileRouteForRole(role?: string | null): string {
  switch (role) {
    case USER_ROLES.financeOfficer:
      return "/finance/profile";
    case USER_ROLES.admin:
      return "/admin/profile";
    case USER_ROLES.superAdmin:
      return "/super-admin/profile";
    default:
      return "/dashboard/profile";
  }
}

export function getMessagesRouteForRole(role?: string | null): string {
  switch (role) {
    case USER_ROLES.financeOfficer:
      return "/finance/messages";
    case USER_ROLES.admin:
      return "/admin/messages";
    case USER_ROLES.superAdmin:
      return "/super-admin/messages";
    default:
      return "/dashboard/messages";
  }
}

export function canAccessFinancePortal(role?: string | null): boolean {
  return (
    role === USER_ROLES.financeOfficer ||
    role === USER_ROLES.admin ||
    role === USER_ROLES.superAdmin
  );
}

export function canAccessAdminPortal(role?: string | null): boolean {
  return role === USER_ROLES.admin || role === USER_ROLES.superAdmin;
}

export function canAccessSuperAdminPortal(role?: string | null): boolean {
  return role === USER_ROLES.superAdmin;
}

export function canAccessClientPortal(role?: string | null): boolean {
  return !role || role === USER_ROLES.client;
}

export function resolveRole(role?: string | null): UserRole {
  if (isSupportedRole(role)) {
    return role;
  }
  return USER_ROLES.client;
}
