import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MortgageApplicationIntroClient } from "@/components/mortgage-application/mortgage-application-intro-client";
import { assertMortgageApplicationAccess } from "@/lib/mortgage-application/actions";
import { mapApplicationToFullMortgageApplication } from "@/lib/mortgage-application/map-from-application";
import { getCompanyContext } from "@/lib/company/server";
import { MORTGAGE_APPLICATION_ROUTES } from "@/types/mortgage-full-application";
import type { ApplicationStatus } from "@/types/application-details";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getCompanyContext();

  return {
    title: "Mortgage Application",
    description: `Complete your ${branding.institutionName} application.`,
  };
}

export default async function MortgageApplicationIntroPage({ params }: PageProps) {
  const { applicationId } = await params;
  const { application } = await assertMortgageApplicationAccess(applicationId);
  const status = application.status as ApplicationStatus;

  if (status !== "pre_qualified") {
    redirect("/dashboard");
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const progress = personalInfo.applicationProgress as
    | { startedAt?: string }
    | undefined;

  if (progress?.startedAt) {
    redirect(MORTGAGE_APPLICATION_ROUTES.apply(applicationId));
  }

  const initialApplication = mapApplicationToFullMortgageApplication({
    personalInfo,
    financialInfo: (application.financial_info ?? {}) as Record<string, unknown>,
    requestedAmount: application.requested_amount,
  });

  return (
    <MortgageApplicationIntroClient
      applicationId={applicationId}
      initialApplication={initialApplication}
    />
  );
}
