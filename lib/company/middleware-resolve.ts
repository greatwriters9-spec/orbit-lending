import { createClient } from "@supabase/supabase-js";

import { mapCompanyRow, type CompanyRow } from "@/lib/company/mapper";
import { normalizeCompanyHost } from "@/lib/company/queries";
import { ORBIT_COMPANY_ID } from "@/types/company";

export async function resolveCompanyIdForMiddleware(host: string): Promise<string> {
  const normalized = normalizeCompanyHost(host);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return ORBIT_COMPANY_ID;
  }

  try {
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: directMatch } = await supabase
      .from("companies")
      .select("id, domain, alternate_domains")
      .eq("domain", normalized)
      .eq("company_status", "active")
      .maybeSingle();

    if (directMatch?.id) {
      return directMatch.id;
    }

    const { data: companies } = await supabase
      .from("companies")
      .select("id, domain, alternate_domains")
      .eq("company_status", "active");

    const alternateMatch = (companies ?? []).find((row) => {
      const domains = (row.alternate_domains ?? []) as string[];
      return domains.some((domain) => normalizeCompanyHost(domain) === normalized);
    });

    if (alternateMatch?.id) {
      return alternateMatch.id;
    }
  } catch {
    return ORBIT_COMPANY_ID;
  }

  return ORBIT_COMPANY_ID;
}

export async function resolveCompanyForMiddleware(host: string) {
  const companyId = await resolveCompanyIdForMiddleware(host);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
  return data ? mapCompanyRow(data as CompanyRow) : null;
}
