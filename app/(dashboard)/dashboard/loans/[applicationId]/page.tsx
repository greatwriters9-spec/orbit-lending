import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import {
  ApplicationCommunicationCenter,
  ApplicationHeader,
  ApplicationOfferCard,
  ApplicationProgressPanel,
} from "@/components/applications";
import { fetchApplicationDetail } from "@/lib/applications/queries";
import { fetchApplicationActivity } from "@/lib/notifications/queries";

type ApplicationDetailPageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata({ params }: ApplicationDetailPageProps) {
  const { applicationId } = await params;
  const application = await fetchApplicationDetail(applicationId);

  return {
    title: application
      ? `${application.applicationNumber} | Orbit Lending`
      : "Application Not Found | Orbit Lending",
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

  return (
    <div className="space-y-8 md:space-y-9">
      <Link
        href="/dashboard/loans"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Back to My Applications
      </Link>

      <ApplicationHeader application={application} />

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
