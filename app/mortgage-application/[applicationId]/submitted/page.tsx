import { redirect } from "next/navigation";

import { assertMortgageApplicationAccess } from "@/lib/mortgage-application/actions";
import type { ApplicationStatus } from "@/types/application-details";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export const metadata = {
  title: "Application Submitted",
  description: "Your mortgage application has been submitted.",
};

export default async function MortgageApplicationSubmittedPage({
  params,
}: PageProps) {
  const { applicationId } = await params;
  const { application } = await assertMortgageApplicationAccess(applicationId);
  const status = application.status as ApplicationStatus;

  if (status === "pre_qualified") {
    redirect(`/mortgage-application/${applicationId}`);
  }

  redirect("/dashboard");
}
