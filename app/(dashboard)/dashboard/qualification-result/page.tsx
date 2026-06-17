import { redirect } from "next/navigation";

import { QualificationResultScreen } from "@/components/dashboard/qualification-result-screen";
import { ClearOnboardingDraft } from "@/components/dashboard/clear-onboarding-draft";
import { getSessionUser } from "@/lib/auth/actions";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { fetchClientDashboardData } from "@/lib/dashboard/queries";

export const metadata = {
  title: "Pre-Qualification Result | Orbit Mortgage",
  description: "Your Orbit Mortgage pre-qualification result.",
};

export default async function QualificationResultPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const data = await fetchClientDashboardData(user.id);
  const view = data?.mortgageView;

  if (!view || view.state !== "pre_qualified") {
    redirect(AUTH_ROUTES.dashboard);
  }

  return (
    <div className="space-y-8 md:space-y-9">
      <ClearOnboardingDraft />
      <QualificationResultScreen userId={user.id} view={view} />
    </div>
  );
}
