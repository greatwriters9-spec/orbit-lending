import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing";
import { fetchBrandingConfig } from "@/lib/admin/branding/config";
import { getSessionUser } from "@/lib/auth/actions";
import { getDefaultRouteForRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Orbit Mortgage | Home Financing Made Simple",
  description:
    "Get pre-qualified for a mortgage with Orbit Mortgage. Simple, modern home financing with transparent terms and secure banking infrastructure powered by Pathward National Bank.",
};

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

  return <LandingPage branding={branding} />;
}

