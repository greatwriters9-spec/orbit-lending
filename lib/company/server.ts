import { cookies, headers } from "next/headers";

import { companyToBrandingConfig, companyToTheme } from "@/lib/company/branding";
import {
  fetchCompanyById,
  resolveCompanyFromHost,
} from "@/lib/company/queries";
import {
  COMPANY_COOKIE_NAME,
  type CompanyContextValue,
  type CompanyRecord,
} from "@/types/company";

export async function getCurrentCompany(): Promise<CompanyRecord> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const hostCompany = await resolveCompanyFromHost(host ?? "localhost");

  // Host is authoritative for white-label domains. A stale cookie from a prior
  // visit or wrong domain must never override the active host's company.
  const cookieStore = await cookies();
  const cookieCompanyId = cookieStore.get(COMPANY_COOKIE_NAME)?.value;

  if (cookieCompanyId && cookieCompanyId === hostCompany.id) {
    return hostCompany;
  }

  if (cookieCompanyId && cookieCompanyId !== hostCompany.id) {
    const cookieCompany = await fetchCompanyById(cookieCompanyId);
    if (cookieCompany && cookieCompany.id !== hostCompany.id) {
      return hostCompany;
    }
  }

  if (cookieCompanyId) {
    const company = await fetchCompanyById(cookieCompanyId);
    if (company && company.companyStatus === "active") {
      return company;
    }
  }

  return hostCompany;
}

export async function getCompanyContext(): Promise<CompanyContextValue> {
  const company = await getCurrentCompany();
  return {
    company,
    branding: companyToBrandingConfig(company),
    theme: companyToTheme(company),
  };
}

export async function getCurrentCompanyId(): Promise<string> {
  const company = await getCurrentCompany();
  return company.id;
}
