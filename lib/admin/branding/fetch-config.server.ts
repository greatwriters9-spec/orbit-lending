import { companyToBrandingConfig } from "@/lib/company/branding";
import { fetchCompanyById } from "@/lib/company/queries";
import { getCompanyContext } from "@/lib/company/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  BRANDING_SETTINGS_KEY,
  DEFAULT_BRANDING_CONFIG,
  type BrandingConfig,
} from "@/types/branding-config";

import { parseBrandingConfig } from "@/lib/admin/branding/config";

export async function fetchBrandingConfig(
  companyId?: string,
): Promise<BrandingConfig> {
  try {
    if (companyId) {
      const company = await fetchCompanyById(companyId);
      if (company) {
        return companyToBrandingConfig(company);
      }
    }

    const { branding } = await getCompanyContext();
    return branding;
  } catch {
    // Legacy fallback while migrations roll out
  }

  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", BRANDING_SETTINGS_KEY)
      .maybeSingle();

    if (!data?.value) {
      return DEFAULT_BRANDING_CONFIG;
    }

    return parseBrandingConfig(data.value);
  } catch {
    return DEFAULT_BRANDING_CONFIG;
  }
}
