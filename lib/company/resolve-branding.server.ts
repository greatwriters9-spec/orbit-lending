import { getProfile } from "@/lib/auth/profile";
import { companyToBrandingConfig } from "@/lib/company/branding";
import { fetchCompanyById } from "@/lib/company/queries";
import { getCurrentCompany } from "@/lib/company/server";
import type { BrandingConfig } from "@/types/branding-config";

export async function resolveBrandingForUserId(
  userId: string,
): Promise<BrandingConfig> {
  const profile = await getProfile(userId);

  if (profile?.company_id) {
    const company = await fetchCompanyById(profile.company_id);
    if (company) {
      return companyToBrandingConfig(company);
    }
  }

  const company = await getCurrentCompany();
  return companyToBrandingConfig(company);
}

export async function resolveInstitutionNameForUserId(
  userId: string,
): Promise<string> {
  const branding = await resolveBrandingForUserId(userId);
  return branding.institutionName;
}
