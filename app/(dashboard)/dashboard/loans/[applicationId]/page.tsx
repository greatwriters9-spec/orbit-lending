import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";

import {
  ApplicationCommunicationCenter,
  ApplicationHeader,
  ApplicationOfferCard,
  ApplicationProgressPanel,
} from "@/components/applications";
import { ApplicantDetailsPanel } from "@/components/finance/applicant-details-panel";
import { canClientEditApplication } from "@/lib/applications/client-edit";
import { fetchApplicationDetail } from "@/lib/applications/queries";
import { fetchApplicationActivity } from "@/lib/notifications/queries";
import { Button } from "@/components/ui-kit/button";
import type { ApplicationStatus } from "@/types/application-details";

type ApplicationDetailPageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata({ params }: ApplicationDetailPageProps) {
  const { applicationId } = await params;
  const application = await fetchApplicationDetail(applicationId);

  return {
    title: application
      ? `${application.applicationNumber} | Orbit Mortgage`
      : "Application Not Found | Orbit Mortgage",
  };
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { applicationId } = await params;
  const [application, activity] = await Promise.all([
    fetchApplicationDetail(applicationId),
    fetchApplicationActivity(applicationId),
  ]);

  if (!application) {
    notFound();
  }

  const canEdit = canClientEditApplication(application.status as ApplicationStatus);
  const applicantName = [
    application.personalInfo.firstName,
    application.personalInfo.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Applicant";

  return (
    <div className="space-y-8 md:space-y-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/loans"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Back to My Applications
        </Link>

        {canEdit ? (
          <Button
            className="h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
            render={
              <Link href={`/dashboard/loans/${applicationId}/edit`}>
                <Pencil className="size-4" />
                Edit Application
              </Link>
            }
          />
        ) : null}
      </div>

      <ApplicationHeader application={application} />

      <ApplicantDetailsPanel
        applicantName={applicantName}
        purpose={application.purpose}
        productName={application.productName}
        requestedAmount={application.requestedAmount}
        pathwardBalance={0}
        personalInfo={application.personalInfo}
        financialInfo={application.financialInfo}
      />

      <ApplicationProgressPanel steps={application.progressSteps} />

      <ApplicationCommunicationCenter
        application={application}
        activity={activity}
      />

      <ApplicationOfferCard
        applicationId={application.id}
        offers={application.offers}
      />
    </div>
  );
}
