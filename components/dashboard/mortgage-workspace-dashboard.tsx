"use client";

import { Check } from "lucide-react";

import { formatCurrency } from "@/lib/loans/queries";
import { formatApplicationDate } from "@/lib/applications/status-utils";
import { cn } from "@/lib/utils";
import type { DocumentChecklistItem } from "@/types/mortgage-full-application";
import type { MortgageDashboardView } from "@/types/mortgage-dashboard";

const JOURNEY_STAGES = [
  "Pre-Qualification",
  "Mortgage Application",
  "Document Verification",
  "Loan Processing",
  "Underwriting",
  "Conditional Approval",
  "Clear to Close",
  "Closing",
] as const;

const TIMELINE = [
  "Pre-Qualified",
  "Application Submitted",
  "Documents Requested",
  "Processing",
  "Underwriting",
  "Conditional Approval",
  "Clear to Close",
  "Closing",
] as const;

type MortgageWorkspaceDashboardProps = {
  firstName: string;
  view: MortgageDashboardView;
  documentChecklist: DocumentChecklistItem[];
  submittedAt?: string;
};

function formatChecklistStatus(status: DocumentChecklistItem["status"]): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MortgageWorkspaceDashboard({
  firstName,
  view,
  documentChecklist,
  submittedAt,
}: MortgageWorkspaceDashboardProps) {
  const completedStages = 2;

  return (
    <div className="space-y-8 md:space-y-10">
      <div>
        <h1 className="heading-primary text-2xl md:text-3xl">
          Welcome back, {firstName}.
        </h1>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-success/25 bg-brand-success/10 px-3 py-1.5 text-sm font-semibold text-brand-success">
          <span aria-hidden className="size-2 rounded-full bg-brand-success" />
          Mortgage Application Submitted
        </span>
      </div>

      <section className="dashboard-card px-6 py-8 md:px-10">
        <h2 className="text-lg font-semibold text-brand-navy md:text-xl">
          Your Mortgage Journey
        </h2>
        <ol className="mt-6 flex flex-wrap gap-3">
          {JOURNEY_STAGES.map((stage, index) => {
            const completed = index < completedStages;
            const current = index === completedStages;
            return (
              <li
                key={stage}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                  completed
                    ? "border-brand-blue/20 bg-brand-blue/5 font-semibold text-brand-navy"
                    : current
                      ? "border-brand-blue bg-white font-medium text-brand-blue"
                      : "border-brand-border text-muted-foreground",
                )}
              >
                {completed ? <Check className="size-3.5 text-brand-blue" /> : null}
                {stage}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="dashboard-card px-6 py-8 md:px-10">
          <h2 className="text-lg font-semibold text-brand-navy">Mortgage Status</h2>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Current Stage
              </dt>
              <dd className="mt-1 text-base font-semibold text-brand-navy">
                Application Submitted
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Application Number
              </dt>
              <dd className="mt-1 text-base font-semibold text-brand-navy">
                {view.applicationNumber ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Assigned Loan Officer
              </dt>
              <dd className="mt-1 text-base text-brand-navy">Pending assignment</dd>
            </div>
            {submittedAt ? (
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Application Submitted Date
                </dt>
                <dd className="mt-1 text-base font-semibold text-brand-navy">
                  {formatApplicationDate(submittedAt)}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="dashboard-card px-6 py-8 md:px-10">
          <h2 className="text-lg font-semibold text-brand-navy">Next Action</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Your application is under initial review. We&apos;ll notify you when
            additional documentation is needed.
          </p>
        </section>
      </div>

      <section className="dashboard-card px-6 py-8 md:px-10">
        <h2 className="text-lg font-semibold text-brand-navy">
          Personalized Document Checklist
        </h2>
        <ul className="mt-6 space-y-3">
          {documentChecklist.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-brand-border px-4 py-3"
            >
              <div>
                <p className="font-medium text-brand-navy">{item.name}</p>
                {item.description ? (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                ) : null}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {formatChecklistStatus(
                  item.status === "required_later" || item.status === "pending"
                    ? "not_requested"
                    : item.status,
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-card px-6 py-8 md:px-10">
        <h2 className="text-lg font-semibold text-brand-navy">Application Summary</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Estimated Loan Amount",
              value: formatCurrency(view.summary.approvedMortgageAmount),
            },
            {
              label: "Estimated Home Price",
              value: formatCurrency(view.summary.maximumHomePrice),
            },
            {
              label: "Requested Loan Amount",
              value: formatCurrency(view.summary.approvedMortgageAmount),
            },
            {
              label: "Down Payment",
              value: formatCurrency(view.summary.requiredDownPayment),
            },
            {
              label: "Property Address",
              value: view.propertyAddressLine ?? "To be added",
            },
            {
              label: "Application Status",
              value: "Submitted",
            },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {row.label}
              </p>
              <p className="mt-1.5 text-base font-semibold text-brand-navy">{row.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-card px-6 py-8 md:px-10">
        <h2 className="text-lg font-semibold text-brand-navy">Timeline</h2>
        <ol className="mt-6 space-y-3">
          {TIMELINE.map((step, index) => {
            const completed = index < 2;
            return (
              <li key={step} className="flex items-center gap-3 text-sm md:text-base">
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold",
                    completed
                      ? "bg-brand-success/15 text-brand-success"
                      : "bg-brand-border/40 text-muted-foreground",
                  )}
                >
                  {completed ? "✓" : "○"}
                </span>
                <span
                  className={
                    completed ? "font-semibold text-brand-navy" : "text-muted-foreground"
                  }
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
