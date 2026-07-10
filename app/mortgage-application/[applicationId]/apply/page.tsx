import { redirect } from "next/navigation";

import { MortgageApplicationWizard } from "@/components/mortgage-application/mortgage-application-wizard";
import { assertMortgageApplicationAccess } from "@/lib/mortgage-application/actions";
import { mapApplicationToFullMortgageApplication } from "@/lib/mortgage-application/map-from-application";
import { MORTGAGE_APPLICATION_ROUTES } from "@/types/mortgage-full-application";
import type { ApplicationStatus } from "@/types/application-details";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export const metadata = {
  title: "Complete Application | Orbit Mortgage",
  description: "Complete your Orbit Mortgage application.",
};

export default async function MortgageApplicationApplyPage({ params }: PageProps) {
  const { applicationId } = await params;
  const { application } = await assertMortgageApplicationAccess(applicationId);
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

  const initialApplication = mapApplicationToFullMortgageApplication({
    personalInfo,
    financialInfo: (application.financial_info ?? {}) as Record<string, unknown>,
    requestedAmount: application.requested_amount,
  });

  return (
    <MortgageApplicationWizard
      applicationId={applicationId}
      initialApplication={initialApplication}
    />
  );
}
