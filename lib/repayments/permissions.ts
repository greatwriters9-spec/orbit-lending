import { isFinanceStaff, isSuperAdmin, type UserRole } from "@/lib/auth/roles";

export function canManageRepayments(role: UserRole): boolean {
  return isFinanceStaff(role);
}

export function canApprovePayments(role: UserRole): boolean {
  return isFinanceStaff(role);
}

export function canOverrideRepaymentSchedule(role: UserRole): boolean {
  return isSuperAdmin(role);
}

export function canApplyCreditsOrPenalties(role: UserRole): boolean {
  return isSuperAdmin(role);
}

export function canCloseLoanManually(role: UserRole): boolean {
  return isSuperAdmin(role);
}
