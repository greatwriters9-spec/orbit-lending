import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing";
import { fetchBrandingConfig } from "@/lib/admin/branding/fetch-config.server";
import { getCompanyContext } from "@/lib/company/server";
import { getSessionUser } from "@/lib/auth/actions";
import { getDefaultRouteForRole } from "@/lib/auth/roles";
import { getLandingContent } from "@/lib/landing/get-landing-content";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { company, branding } = await getCompanyContext();
  return {
    title: `${company.companyName} | ${branding.tagline}`,
    description:
      company.heroSubtitle?.replace(/\n/g, " ") ??
      `Get pre-qualified for a mortgage with ${company.companyName}.`,
  };
}

export default async function Home() {
  const user = await getSessionUser();

  if (user) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    redirect(getDefaultRouteForRole(profile?.role));
  }

  const branding = await fetchBrandingConfig();
  const companyContext = await getCompanyContext();
  const content = getLandingContent(companyContext.company, branding);

  return (
    <LandingPage
      branding={branding}
      company={companyContext.company}
      content={content}
    />
  );
}

