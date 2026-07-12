"use server";

import { getProfile } from "@/lib/auth/profile";
import { companyToBrandingConfig } from "@/lib/company/branding";
import { fetchCompanyById } from "@/lib/company/queries";
import {
  canAccountPerform,
  type AccountRestriction,
} from "@/lib/auth/account-status";
import { USER_ROLES } from "@/lib/auth/roles";

export async function assertClientAccountAllows(
  userId: string,
  restriction: AccountRestriction,
): Promise<string | null> {
  const profile = await getProfile(userId);

  if (!profile || profile.role !== USER_ROLES.client) {
    return null;
  }

  if (!canAccountPerform(profile.account_status, restriction)) {
    let institutionName = "your mortgage company";
    if (profile.company_id) {
      const company = await fetchCompanyById(profile.company_id);
      if (company) {
        institutionName = companyToBrandingConfig(company).institutionName;
      }
    }
    return `This action is not available due to your current account status. Please contact ${institutionName} support.`;
  }

  return null;
}

