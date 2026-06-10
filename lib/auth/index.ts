export {
  requireAuthenticated,
  requireClient,
  requireFinanceOfficer,
  requireFinanceStaff,
  requireAdmin,
  requireSuperAdmin,
  requireRoles,
  buildDashboardUser,
  type AuthContext,
} from "./guards";

export {
  getProfileRouteForRole,
  getMessagesRouteForRole,
  canAccessFinancePortal,
  canAccessAdminPortal,
  canAccessSuperAdminPortal,
  canAccessClientPortal,
  resolveRole,
} from "./navigation";

export {
  logAccountAuditEvent,
  logRoleChange,
  logPermissionChange,
  logAccountActivation,
  logAccountSuspension,
} from "./account-audit";

export {
  USER_ROLES,
  getDefaultRouteForRole,
  getRoleLabel,
  getMessageSenderRoleLabel,
  isFinanceStaff,
  isAdminStaff,
  isSuperAdmin,
  isClient,
  type UserRole,
} from "./roles";

export { AUTH_ROUTES } from "./routes";
