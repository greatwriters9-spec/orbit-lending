import {
  ADMIN_PORTAL,
  adminNavSections,
} from "@/components/navigation/admin-nav-config";
import {
  CLIENT_PORTAL,
  clientNavSections,
} from "@/components/navigation/nav-config";
import {
  FINANCE_PORTAL,
  financeNavSections,
} from "@/components/navigation/finance-nav-config";
import {
  SUPER_ADMIN_PORTAL,
  superAdminNavSections,
} from "@/components/navigation/super-admin-nav-config";
import { USER_ROLES, type UserRole } from "@/lib/auth/roles";
import type { NavSection } from "@/types/navigation";

export type PortalNavConfig = {
  sections: NavSection[];
  subtitle: string;
};

export function getNavForRole(role?: string | null): PortalNavConfig {
  switch (role) {
    case USER_ROLES.superAdmin:
      return {
        sections: superAdminNavSections,
        subtitle: SUPER_ADMIN_PORTAL.subtitle,
      };
    case USER_ROLES.admin:
      return {
        sections: adminNavSections,
        subtitle: ADMIN_PORTAL.subtitle,
      };
    case USER_ROLES.financeOfficer:
      return {
        sections: financeNavSections,
        subtitle: FINANCE_PORTAL.subtitle,
      };
    default:
      return {
        sections: clientNavSections,
        subtitle: CLIENT_PORTAL.subtitle,
      };
  }
}

export function getNavForRoleKey(role: UserRole): PortalNavConfig {
  return getNavForRole(role);
}
