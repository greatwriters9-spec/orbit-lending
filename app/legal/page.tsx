import type { Metadata } from "next";

import { LegalHubPage } from "@/components/legal/legal-hub";
import { applyCompanyBrandingToLegalCopy } from "@/lib/legal/apply-company-branding";
import { getCompanyContext } from "@/lib/company/server";

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getCompanyContext();

  return {
    title: "Legal Center",
    description: applyCompanyBrandingToLegalCopy(
      "Terms, privacy, disclosures, and contact information for Orbit Mortgage digital mortgage services.",
      branding,
    ),
  };
}

export default async function LegalIndexPage() {
  const { branding } = await getCompanyContext();
  return <LegalHubPage branding={branding} />;
}
