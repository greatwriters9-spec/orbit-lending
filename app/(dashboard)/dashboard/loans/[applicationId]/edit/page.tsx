import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { canClientEditApplication } from "@/lib/applications/client-edit";
import { fetchApplicationDetail } from "@/lib/applications/queries";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import { mapApplicationToMortgageDraft } from "@/lib/onboarding/map-application-to-draft";
import type { ApplicationStatus } from "@/types/application-details";

type EditApplicationPageProps = {
  params: Promise<{ applicationId: string }>;
};

export async function generateMetadata({ params }: EditApplicationPageProps) {
  const { applicationId } = await params;
  const application = await fetchApplicationDetail(applicationId);

  return {
    title: application
      ? `Edit ${application.applicationNumber}`
      : "Application Not Found",
  };
}

export default async function EditApplicationPage({
  params,
}: EditApplicationPageProps) {
  const { applicationId } = await params;
  const application = await fetchApplicationDetail(applicationId);

  if (!application) {
    notFound();
  }

  if (!canClientEditApplication(application.status as ApplicationStatus)) {
    redirect(`/dashboard/loans/${applicationId}`);
  }

  const initialDraft = mapApplicationToMortgageDraft({
    personalInfo: application.personalInfo,
    financialInfo: application.financialInfo,
  });
  const mortgageConfig = await fetchMortgageConfig();

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/loans/${applicationId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand-blue"
      >
        <ArrowLeft className="size-4" strokeWidth={1.75} />
        Back to Application
      </Link>

      <section className="card-surface border-brand-border px-6 py-6 md:px-8">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {application.applicationNumber}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">
          Edit Your Application
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Update your answers before your application is approved. Changes are
          saved to your submitted application.
        </p>
      </section>

      <Suspense fallback={null}>
        <OnboardingWizard
          isLoggedIn
          mode="edit"
          applicationId={applicationId}
          initialDraft={initialDraft}
          mortgageConfig={mortgageConfig}
        />
      </Suspense>
    </div>
  );
}
