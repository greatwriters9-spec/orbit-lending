import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { ApplicationProgressPanel } from "@/components/applications/application-progress-panel";
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { FinanceApplicationReview } from "@/components/finance/finance-application-review";
import { buildProgressSteps } from "@/lib/applications/status-utils";
import { fetchFinanceApplicationDetail } from "@/lib/finance/queries";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { applicationId } = await params;
  const application = await fetchFinanceApplicationDetail(applicationId);
  return {
    title: application
      ? `Review ${application.applicationNumber} | Loan Officer`
      : "Application Not Found",
  };
}

export default async function FinanceApplicationReviewPage({ params }: PageProps) {
  const { applicationId } = await params;
  const application = await fetchFinanceApplicationDetail(applicationId);

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href="/finance/applications"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-brand-blue"
      >
        <ArrowLeft className="size-4" />
        Back to Applications Queue
      </Link>

      <section className="card-surface overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-border px-6 py-6 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {application.applicationNumber}
            </p>
            <h1 className="heading-primary mt-1 text-2xl md:text-3xl">
              {application.productName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Applicant: {application.applicantName}
            </p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
      </section>

      <ApplicationProgressPanel steps={buildProgressSteps(application.status)} />

      <FinanceApplicationReview application={application} />
    </div>
  );
}
