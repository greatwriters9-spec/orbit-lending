export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  createAccount: "/create-account",
  getStarted: "/get-started",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  callback: "/auth/callback",
  profileComplete: "/profile/complete",
  dashboard: "/dashboard",
  qualificationResult: "/dashboard/qualification-result",
  financePortal: "/finance",
  financeDashboard: "/finance/dashboard",
  adminPortal: "/admin",
  superAdminPortal: "/super-admin",
  unauthorized: "/unauthorized",
  accountStatus: "/account-status",
} as const;

export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/loans",
  "/finance",
  "/wallet",
  "/admin",
  "/super-admin",
  "/account-status",
] as const;

export const AUTH_PREFIXES = [
  "/login",
  "/register",
  "/create-account",
  "/forgot-password",
  "/reset-password",
] as const;

export const PUBLIC_ONBOARDING_PREFIXES = ["/get-started"] as const;

export const FINANCE_PREFIXES = ["/finance"] as const;
export const ADMIN_PREFIXES = ["/admin"] as const;
export const SUPER_ADMIN_PREFIXES = ["/super-admin"] as const;
