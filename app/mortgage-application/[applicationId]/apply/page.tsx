import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MortgageApplicationWizard } from "@/components/mortgage-application/mortgage-application-wizard";
import { assertMortgageApplicationAccess } from "@/lib/mortgage-application/actions";
import { mapApplicationToFullMortgageApplication } from "@/lib/mortgage-application/map-from-application";
import {
  enrichApplicationFromProfile,
  prepareApplicationForWizard,
} from "@/lib/mortgage-application/prepare-application";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import { getProfile, isProfileComplete } from "@/lib/auth/profile";
import { getCompanyContext } from "@/lib/company/server";
import { MORTGAGE_APPLICATION_ROUTES } from "@/types/mortgage-full-application";
import type { ApplicationStatus } from "@/types/application-details";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getCompanyContext();

  return {
    title: "Complete Application",
    description: `Complete your ${branding.institutionName} application.`,
  };
}

export default async function MortgageApplicationApplyPage({ params }: PageProps) {
  const { applicationId } = await params;
  const { user, application } = await assertMortgageApplicationAccess(applicationId);
  const status = application.status as ApplicationStatus;

  if (status !== "pre_qualified") {
    redirect("/dashboard");
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const progress = personalInfo.applicationProgress as
    | { startedAt?: string; locked?: boolean }
    | undefined;

  if (!progress?.startedAt) {
    redirect(MORTGAGE_APPLICATION_ROUTES.intro(applicationId));
  }

  if (progress.locked) {
    redirect("/dashboard");
  }

  const profile = await getProfile(user.id);
  const skipPersonalSection = isProfileComplete(profile);

  let initialApplication = mapApplicationToFullMortgageApplication({
    personalInfo,
    financialInfo: (application.financial_info ?? {}) as Record<string, unknown>,
    requestedAmount: application.requested_amount,
  });

  if (profile) {
    initialApplication = enrichApplicationFromProfile(
      initialApplication,
      profile,
      user.email ?? "",
    );
  }

  initialApplication = prepareApplicationForWizard({
    application: initialApplication,
    skipPersonalSection,
  });

  const mortgageConfig = await fetchMortgageConfig();

  return (
    <MortgageApplicationWizard
      applicationId={applicationId}
      initialApplication={initialApplication}
      mortgageConfig={mortgageConfig}
      skipPersonalSection={skipPersonalSection}
    />
  );
}
