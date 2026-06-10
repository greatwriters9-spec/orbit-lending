"use server";

import { getProfile } from "@/lib/auth/profile";
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
    return "This action is not available due to your current account status. Please contact Orbit Lending support.";
  }

  return null;
}
