import { AUTH_ROUTES } from "@/lib/auth/routes";

export const USER_ROLES = {
  client: "client",
  financeOfficer: "finance_officer",
  admin: "admin",
  superAdmin: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** @deprecated Use USER_ROLES instead */
export const STAFF_ROLES = {
  financeOfficer: USER_ROLES.financeOfficer,
  loanOfficer: "loan_officer",
  complianceOfficer: "compliance_officer",
  admin: USER_ROLES.admin,
  superAdmin: USER_ROLES.superAdmin,
  client: USER_ROLES.client,
} as const;

export type StaffRole = UserRole | "loan_officer" | "compliance_officer";

export const FINANCE_PORTAL_ROLES = [
  USER_ROLES.financeOfficer,
  USER_ROLES.admin,
  USER_ROLES.superAdmin,
] as const;

export const ADMIN_PORTAL_ROLES = [
  USER_ROLES.admin,
  USER_ROLES.superAdmin,
] as const;

export const SUPER_ADMIN_PORTAL_ROLES = [USER_ROLES.superAdmin] as const;

export const SUPPORTED_ROLES: UserRole[] = [
  USER_ROLES.client,
  USER_ROLES.financeOfficer,
  USER_ROLES.admin,
  USER_ROLES.superAdmin,
];

export function isSupportedRole(role?: string | null): role is UserRole {
  return SUPPORTED_ROLES.includes(role as UserRole);
}

export function isFinanceStaff(role?: string | null): boolean {
  return FINANCE_PORTAL_ROLES.includes(
    role as (typeof FINANCE_PORTAL_ROLES)[number],
  );
}

export function isAdminStaff(role?: string | null): boolean {
  return ADMIN_PORTAL_ROLES.includes(
    role as (typeof ADMIN_PORTAL_ROLES)[number],
  );
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === USER_ROLES.superAdmin;
}

export function getDefaultRouteForRole(role?: string | null): string {
  switch (role) {
    case USER_ROLES.superAdmin:
      return AUTH_ROUTES.superAdminPortal;
    case USER_ROLES.admin:
      return AUTH_ROUTES.adminPortal;
    case USER_ROLES.financeOfficer:
      return AUTH_ROUTES.financePortal;
    default:
      return AUTH_ROUTES.dashboard;
  }
}

export function getRoleLabel(role?: string | null): string {
  switch (role) {
    case USER_ROLES.financeOfficer:
      return "Loan Officer";
    case STAFF_ROLES.loanOfficer:
      return "Loan Officer";
    case STAFF_ROLES.complianceOfficer:
      return "Compliance Officer";
    case USER_ROLES.admin:
      return "Credit Manager";
    case USER_ROLES.superAdmin:
      return "Chief Lending Officer";
    default:
      return "Client";
  }
}

/** User-facing labels for application message sender roles (not auth role values). */
export function getMessageSenderRoleLabel(senderRole?: string | null): string {
  switch (senderRole) {
    case "officer":
    case "finance":
      return "Loan Officer";
    case "client":
      return "Client";
    case "system":
      return "System";
    default:
      return senderRole ?? "Staff";
  }
}

export function isClient(role?: string | null): boolean {
  return !role || role === USER_ROLES.client;
}
