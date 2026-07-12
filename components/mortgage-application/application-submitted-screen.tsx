"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { CompanyLogo } from "@/components/company/company-logo";
import { formatApplicationDate } from "@/lib/applications/status-utils";

type ApplicationSubmittedScreenProps = {
  applicationNumber: string;
  submittedAt: string;
};

export function ApplicationSubmittedScreen({
  applicationNumber,
  submittedAt,
}: ApplicationSubmittedScreenProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-[72px] max-w-3xl items-center px-4 md:px-6">
          <CompanyLogo href="/dashboard" size="sm" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6 md:py-14">
        <div className="card-surface px-6 py-10 text-center md:px-10 md:py-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-success/10">
            <CheckCircle2 className="size-9 text-brand-success" strokeWidth={1.75} />
          </div>

          <h1 className="heading-primary mt-6 text-3xl md:text-4xl">
            Your Mortgage Application Has Been Submitted
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Thank you for completing your application. Our processing team will begin
            reviewing your information. You&apos;ll be notified if we require
            additional documentation.
          </p>

          <div className="mt-8 rounded-2xl border border-brand-border bg-brand-background/50 p-5 text-left">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Application Number
                </p>
                <p className="mt-1 text-lg font-semibold text-brand-navy">
                  {applicationNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Submission Date
                </p>
                <p className="mt-1 text-lg font-semibold text-brand-navy">
                  {formatApplicationDate(submittedAt)}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Estimated Review Timeline
                </p>
                <p className="mt-1 text-lg font-semibold text-brand-navy">
                  2–3 business days for initial review
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-xl bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue/90"
          >
            Return to Dashboard
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
