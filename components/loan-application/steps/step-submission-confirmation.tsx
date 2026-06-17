"use client";

import Link from "next/link";
import { CheckCircle2, FileText, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui-kit/button";
import { WizardShell } from "@/components/loan-application/wizard-shell";

type StepSubmissionConfirmationProps = {
  applicationNumber: string;
  applicationId?: string;
  productName: string;
};

export function StepSubmissionConfirmation({
  applicationNumber,
  applicationId,
  productName,
}: StepSubmissionConfirmationProps) {
  return (
    <WizardShell
      title="Submission Confirmation"
      description="Your mortgage application has been received and is now in the review queue."
    >
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-success/10 text-brand-success">
          <CheckCircle2 className="size-8" strokeWidth={1.75} />
        </div>

        <h3 className="heading-primary mt-6 text-2xl">
          Application Submitted
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your {productName} application has been submitted successfully. Our
          team will review your information and contact you with next steps.
        </p>

        <div className="mt-8 rounded-xl border border-brand-border bg-brand-background/60 p-5">
          <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Application Number
          </p>
          <p className="mt-2 text-xl font-bold tracking-tight text-brand-navy">
            {applicationNumber}
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {applicationId ? (
            <Button
              className="h-10 bg-brand-blue px-5 text-white hover:bg-brand-blue/90"
              render={<Link href={`/dashboard/loans/${applicationId}`} />}
            >
              <FileText className="size-4" />
              Track Application
            </Button>
          ) : null}
          <Button
            className="h-10 bg-brand-blue px-5 text-white hover:bg-brand-blue/90"
            render={<Link href="/dashboard/loans" />}
          >
            <LayoutDashboard className="size-4" />
            My Applications
          </Button>
          <Button
            variant="outline"
            className="h-10 border-brand-border px-5 text-brand-navy"
            render={<Link href="/get-started" />}
          >
            <FileText className="size-4" />
            Get Pre-Qualified
          </Button>
        </div>
      </div>
    </WizardShell>
  );
}
