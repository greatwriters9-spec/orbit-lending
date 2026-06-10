"use client";

import { FormField } from "@/components/auth/form-field";
import { LoanCalculator } from "@/components/loan-application/loan-calculator";
import { useWizard } from "@/components/loan-application/wizard-context";
import {
  WizardShell,
  WizardStepError,
} from "@/components/loan-application/wizard-shell";
import { Input } from "@/components/ui-kit/input";
import { formatCurrency, formatTermLabel } from "@/lib/loans/queries";
import { cn } from "@/lib/utils";

const inputClassName = cn(
  "h-11 border-brand-border bg-brand-background text-sm shadow-none",
  "focus-visible:border-brand-blue/50 focus-visible:ring-brand-blue/15",
);

export function StepLoanConfiguration() {
  const { product, draft, updateConfiguration, stepErrors, currentStep } =
    useWizard();

  const activeTerms = product.terms.filter((term) => term.active);
  const frequencies = [...new Set(activeTerms.map((term) => term.repaymentFrequency))];
  const filteredTerms = activeTerms.filter(
    (term) => term.repaymentFrequency === draft.configuration.repaymentFrequency,
  );
  const selectedTerm = activeTerms.find(
    (term) => term.id === draft.configuration.selectedTermId,
  );

  return (
    <WizardShell
      title="Loan Configuration"
      description="Set your requested amount, repayment preferences, and review live payment estimates."
    >
      <WizardStepError message={stepErrors[currentStep]} />

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <FormField label="Requested Loan Amount" htmlFor="requestedAmount">
            <Input
              id="requestedAmount"
              type="number"
              min={product.minAmount}
              max={product.maxAmount}
              step={100}
              value={draft.configuration.requestedAmount || ""}
              onChange={(event) =>
                updateConfiguration({
                  requestedAmount: Number(event.target.value),
                })
              }
              className={inputClassName}
            />
            <p className="text-xs text-muted-foreground">
              Range: {formatCurrency(product.minAmount)} –{" "}
              {formatCurrency(product.maxAmount)}
            </p>
          </FormField>

          <FormField label="Repayment Frequency" htmlFor="repaymentFrequency">
            <select
              id="repaymentFrequency"
              value={draft.configuration.repaymentFrequency}
              onChange={(event) => {
                const frequency = event.target.value;
                const firstMatchingTerm = activeTerms.find(
                  (term) => term.repaymentFrequency === frequency,
                );
                updateConfiguration({
                  repaymentFrequency: frequency,
                  selectedTermId: firstMatchingTerm?.id ?? "",
                });
              }}
              className={cn(inputClassName, "w-full rounded-lg px-3")}
            >
              {frequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Repayment Term" htmlFor="selectedTermId">
            <select
              id="selectedTermId"
              value={draft.configuration.selectedTermId}
              onChange={(event) =>
                updateConfiguration({ selectedTermId: event.target.value })
              }
              className={cn(inputClassName, "w-full rounded-lg px-3")}
            >
              {filteredTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {formatTermLabel(term)} at {term.interestRate.toFixed(2)}% APR
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Loan Purpose" htmlFor="purpose">
            <textarea
              id="purpose"
              rows={4}
              value={draft.configuration.purpose}
              onChange={(event) =>
                updateConfiguration({ purpose: event.target.value })
              }
              placeholder="Describe how you plan to use these funds..."
              className={cn(
                inputClassName,
                "min-h-[120px] w-full resize-y rounded-lg px-3 py-2.5",
              )}
            />
          </FormField>
        </div>

        <LoanCalculator
          amount={draft.configuration.requestedAmount}
          term={selectedTerm}
        />
      </div>
    </WizardShell>
  );
}
