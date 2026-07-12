"use client";

import { useOptionalCompany } from "@/components/providers/company-provider";

type InstitutionNameProps = {
  fallback?: string;
};

export function InstitutionName({ fallback = "your mortgage company" }: InstitutionNameProps) {
  const companyContext = useOptionalCompany();
  return <>{companyContext?.branding.institutionName ?? fallback}</>;
}
