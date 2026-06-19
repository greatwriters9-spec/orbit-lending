import { Suspense } from "react";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getSessionUser } from "@/lib/auth/actions";
import { getProfile, isProfileComplete } from "@/lib/auth/profile";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import { mapProfileToOnboardingDraft } from "@/lib/onboarding/map-profile-to-draft";
import { createClient } from "@/lib/supabase/server";
export const metadata = {
  title: "Get Pre-Qualified | Orbit Mortgage",
  description:
    "Answer a few simple questions to get pre-qualified for your Orbit Mortgage.",
};

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
  const profile = user ? await getProfile(user.id) : null;
  const confirmProfileDetails = isProfileComplete(profile);
  const profileDraft =
    profile && user ? mapProfileToOnboardingDraft(profile, user.email) : undefined;

  return (
    <Suspense fallback={null}>
      <OnboardingWizard
        isLoggedIn={Boolean(user)}
        mortgageConfig={mortgageConfig}
        confirmProfileDetails={confirmProfileDetails}
        profileDraft={profileDraft}
      />
    </Suspense>
  );
}
