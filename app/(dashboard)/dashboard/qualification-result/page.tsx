import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QualificationResultScreen } from "@/components/dashboard/qualification-result-screen";
import { ClearOnboardingDraft } from "@/components/dashboard/clear-onboarding-draft";
import { getSessionUser } from "@/lib/auth/actions";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getCompanyContext } from "@/lib/company/server";
import { fetchClientDashboardData } from "@/lib/dashboard/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getCompanyContext();

  return {
    title: "Pre-Qualification Result",
    description: `Your ${branding.institutionName} pre-qualification result.`,
  };
}

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
