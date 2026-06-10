import { USER_ROLES, type UserRole } from "@/lib/auth/roles";

export type AdminPermission =
  | "products:manage"
  | "users:view"
  | "applications:manage"
  | "funding:manage"
  | "withdrawals:manage"
  | "repayments:manage"
  | "accounts:suspend"
  | "accounts:restrict"
  | "accounts:on_hold"
  | "accounts:reactivate"
  | "roles:change"
  | "admins:manage"
  | "audit:view"
  | "settings:manage";

const CREDIT_MANAGER_PERMISSIONS: AdminPermission[] = [
  "products:manage",
  "users:view",
  "applications:manage",
  "funding:manage",
  "withdrawals:manage",
  "repayments:manage",
];

const CHIEF_LENDING_OFFICER_PERMISSIONS: AdminPermission[] = [
  ...CREDIT_MANAGER_PERMISSIONS,
  "accounts:suspend",
  "accounts:restrict",
  "accounts:on_hold",
  "accounts:reactivate",
  "roles:change",
  "admins:manage",
  "audit:view",
  "settings:manage",
];

const ROLE_PERMISSIONS: Partial<Record<UserRole, AdminPermission[]>> = {
  [USER_ROLES.admin]: CREDIT_MANAGER_PERMISSIONS,
  [USER_ROLES.superAdmin]: CHIEF_LENDING_OFFICER_PERMISSIONS,
};

export function hasAdminPermission(
  role: UserRole | string | null | undefined,
  permission: AdminPermission,
): boolean {
  const permissions = ROLE_PERMISSIONS[role as UserRole];
  return permissions?.includes(permission) ?? false;
}

export function requireAdminPermission(
  role: UserRole | string | null | undefined,
  permission: AdminPermission,
): boolean {
  return hasAdminPermission(role, permission);
}

export function canManageAccountStatus(
  role: UserRole | string | null | undefined,
): boolean {
  return (
    hasAdminPermission(role, "accounts:suspend") ||
    hasAdminPermission(role, "accounts:reactivate")
  );
}

export function canChangeUserRole(
  role: UserRole | string | null | undefined,
): boolean {
  return hasAdminPermission(role, "roles:change");
}
