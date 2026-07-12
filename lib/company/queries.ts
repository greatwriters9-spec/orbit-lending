import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ORBIT_COMPANY_ID, type CompanyRecord } from "@/types/company";

import { mapCompanyRow, type CompanyRow } from "@/lib/company/mapper";

const COMPANY_SELECT = "*";

function normalizeHost(host: string | null | undefined): string {
  if (!host) return "localhost";
  return host.split(":")[0]?.toLowerCase().replace(/^www\./, "") ?? "localhost";
}

export function normalizeCompanyHost(host: string | null | undefined): string {
  return normalizeHost(host);
}

export async function fetchCompanyById(id: string): Promise<CompanyRecord | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("companies")
    .select(COMPANY_SELECT)
    .eq("id", id)
    .maybeSingle();

  return data ? mapCompanyRow(data as CompanyRow) : null;
}

export async function fetchCompanyByDomain(host: string): Promise<CompanyRecord | null> {
  const normalized = normalizeHost(host);
  const supabase = createServiceRoleClient();

  const { data: directMatch } = await supabase
    .from("companies")
    .select(COMPANY_SELECT)
    .eq("domain", normalized)
    .eq("company_status", "active")
    .maybeSingle();

  if (directMatch) {
    return mapCompanyRow(directMatch as CompanyRow);
  }

  const { data: companies } = await supabase
    .from("companies")
    .select(COMPANY_SELECT)
    .eq("company_status", "active");

  const alternateMatch = (companies ?? []).find((row) => {
    const record = mapCompanyRow(row as CompanyRow);
    return record.alternateDomains.some(
      (domain) => normalizeHost(domain) === normalized,
    );
  });

  return alternateMatch ? mapCompanyRow(alternateMatch as CompanyRow) : null;
}

export async function fetchDefaultCompany(): Promise<CompanyRecord> {
  const orbit = await fetchCompanyById(ORBIT_COMPANY_ID);
  if (orbit) return orbit;

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("companies")
    .select(COMPANY_SELECT)
    .eq("slug", "orbit")
    .maybeSingle();

  if (data) {
    return mapCompanyRow(data as CompanyRow);
  }

  throw new Error("Default company is not configured.");
}

export async function resolveCompanyFromHost(host: string): Promise<CompanyRecord> {
  const company = await fetchCompanyByDomain(host);
  return company ?? fetchDefaultCompany();
}

export async function listCompanies(): Promise<CompanyRecord[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("companies")
    .select(COMPANY_SELECT)
    .order("company_name", { ascending: true });

  return (data ?? []).map((row) => mapCompanyRow(row as CompanyRow));
}
