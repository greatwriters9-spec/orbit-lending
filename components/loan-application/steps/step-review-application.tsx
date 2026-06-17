"use client";

import type { ReactNode } from "react";

import { CheckCircle2 } from "lucide-react";

import { LoanCalculator } from "@/components/loan-application/loan-calculator";
import { useWizard } from "@/components/loan-application/wizard-context";
import { WizardShell } from "@/components/loan-application/wizard-shell";
import {
  formatApr,
  formatCurrency,
  formatTermLabel,
} from "@/lib/loans/queries";

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-background/40 p-5">
      <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
      <span>{label}</span>
      <span className="font-medium text-brand-navy">{value}</span>
    </div>
  );
}

export function StepReviewApplication() {
  const { product, draft } = useWizard();
  const selectedTerm = product.terms.find(
    (term) => term.id === draft.configuration.selectedTermId,
  );

  return (
    <WizardShell
      title="Review Application"
      description="Review all details carefully before submitting your mortgage application."
    >
      <div className="space-y-5">
        <ReviewSection title="Mortgage Details">
          <ReviewRow label="Product" value={product.name} />
          <ReviewRow
            label="Amount"
            value={formatCurrency(draft.configuration.requestedAmount)}
          />
          <ReviewRow label="Purpose" value={draft.configuration.purpose} />
          {selectedTerm ? (
            <>
              <ReviewRow
                label="Term"
                value={formatTermLabel(selectedTerm)}
              />
              <ReviewRow
                label="APR"
                value={formatApr(selectedTerm.interestRate)}
              />
            </>
          ) : null}
        </ReviewSection>

        <ReviewSection title="Personal Information">
          <ReviewRow
            label="Name"
            value={`${draft.personalInfo.firstName} ${draft.personalInfo.lastName}`}
          />
          <ReviewRow label="Email" value={draft.personalInfo.email} />
          <ReviewRow label="Phone" value={draft.personalInfo.phone} />
          <ReviewRow
            label="Address"
            value={`${draft.personalInfo.address}, ${draft.personalInfo.city}, ${draft.personalInfo.state} ${draft.personalInfo.country}`}
          />
        </ReviewSection>

        <ReviewSection title="Financial Information">
          <ReviewRow
            label="Employment"
            value={draft.financialInfo.employmentStatus}
          />
          <ReviewRow
            label="Employer"
            value={draft.financialInfo.employerName}
          />
          <ReviewRow
            label="Monthly Income"
            value={formatCurrency(draft.financialInfo.monthlyIncome)}
          />
          <ReviewRow
            label="Monthly Expenses"
            value={formatCurrency(draft.financialInfo.monthlyExpenses)}
          />
          <ReviewRow
            label="Existing Debt"
            value={formatCurrency(draft.financialInfo.existingDebt)}
          />
        </ReviewSection>

        <ReviewSection title="Documents">
          {Object.values(draft.documents).length > 0 ? (
            Object.values(draft.documents).map((doc) => (
              <ReviewRow
                key={doc.requirementId}
                label={doc.documentName}
                value={doc.fileName}
              />
            ))
          ) : (
            <p>No documents uploaded.</p>
          )}
        </ReviewSection>

        <LoanCalculator
          amount={draft.configuration.requestedAmount}
          term={selectedTerm}
        />

        <div className="flex items-start gap-3 rounded-xl border border-brand-success/20 bg-brand-success/5 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-success" />
          <p className="text-sm leading-relaxed text-brand-navy/80">
            By submitting, you confirm that all information provided is accurate
            and complete. Your application will enter review — approval workflows
            are handled separately by our lending team.
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
