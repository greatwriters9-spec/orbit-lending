import { Suspense } from "react";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getSessionUser } from "@/lib/auth/actions";
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

  return (
    <Suspense fallback={null}>
      <OnboardingWizard isLoggedIn={Boolean(user)} />
    </Suspense>
  );
}
