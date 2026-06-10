import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing";
import { getSessionUser } from "@/lib/auth/actions";
import { getDefaultRouteForRole } from "@/lib/auth/roles";
import { fetchDisplayCategoryCatalog } from "@/lib/loans/category-catalog";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Orbit Lending | Premium Digital Financing",
  description:
    "Apply for personal, business, property, and education financing with Orbit Lending. Fast decisions, transparent terms, and secure banking infrastructure powered by Pathward National Bank.",
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

  const categories = await fetchDisplayCategoryCatalog({ includeInactive: false });

  return <LandingPage categories={categories} />;
}
