"use client";

import {
  getNavForRole,
  type PortalNavConfig,
} from "@/components/navigation/get-nav-for-role";
import { USER_ROLES } from "@/lib/auth/roles";
import type { PortalKey } from "@/types/portal";

export function getPortalNav(portal: PortalKey): PortalNavConfig {
  switch (portal) {
    case "super_admin":
      return getNavForRole(USER_ROLES.superAdmin);
    case "admin":
      return getNavForRole(USER_ROLES.admin);
    case "finance":
      return getNavForRole(USER_ROLES.financeOfficer);
    default:
      return getNavForRole(USER_ROLES.client);
  }
}
