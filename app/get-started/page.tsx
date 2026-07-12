import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { BuyingPowerAssessmentWizard } from "@/components/onboarding/buying-power-assessment-wizard";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getSessionUser } from "@/lib/auth/actions";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import { getCompanyContext } from "@/lib/company/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getCompanyContext();

  return {
    title: "Buying Power Assessment",
    description: `Answer a few quick questions to estimate your home buying power with ${branding.institutionName}.`,
  };
}

export default async function GetStartedPage() {
  const user = await getSessionUser();

  if (user) {
    const supabase = await createClient();
    const { data: application } = await supabase
      .from("loan_applications")
      .select("status")
      .eq("user_id", user.id)
      .neq("status", "draft")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (application?.status === "pre_qualified") {
      redirect(AUTH_ROUTES.dashboard);
    }
  }

  const mortgageConfig = await fetchMortgageConfig();

  return (
    <Suspense fallback={null}>
      <BuyingPowerAssessmentWizard
        isLoggedIn={Boolean(user)}
        mortgageConfig={mortgageConfig}
      />
    </Suspense>
  );
}
