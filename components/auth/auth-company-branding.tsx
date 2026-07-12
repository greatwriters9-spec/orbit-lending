"use client";

import { CompanyLogo } from "@/components/company/company-logo";
import { useOptionalCompany } from "@/components/providers/company-provider";
import { getBootstrapCompanyFromDom } from "@/lib/company/bootstrap-company";

function useResolvedCompanyName(): string {
  const companyContext = useOptionalCompany();
  if (companyContext) {
    return companyContext.company.companyName;
  }

  const bootstrap = getBootstrapCompanyFromDom();
  return bootstrap?.companyName ?? "";
}

export function AuthCompanyLogo() {
  return <CompanyLogo href="/" />;
}

export function AuthCompanyCopyright() {
  const companyName = useResolvedCompanyName();

  if (!companyName) {
    return null;
  }

  return (
    <p className="mt-8 text-center text-[11px] text-[#9aa3af]">
      © {new Date().getFullYear()} {companyName}
    </p>
  );
}

export function OnboardingCompanyCopyright() {
  const companyName = useResolvedCompanyName();

  if (!companyName) {
    return null;
  }

  return (
    <p className="shrink-0 text-xs font-medium text-brand-navy/65 sm:text-sm">
      © {new Date().getFullYear()} {companyName}
    </p>
  );
}
