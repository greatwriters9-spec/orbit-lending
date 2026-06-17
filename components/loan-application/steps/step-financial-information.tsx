"use client";

import { FormField } from "@/components/auth/form-field";
import { useWizard } from "@/components/loan-application/wizard-context";
import {
  WizardShell,
  WizardStepError,
} from "@/components/loan-application/wizard-shell";
import { Input } from "@/components/ui-kit/input";
import { cn } from "@/lib/utils";

const inputClassName = cn(
  "h-11 border-brand-border bg-brand-background text-sm shadow-none",
  "focus-visible:border-brand-blue/50 focus-visible:ring-brand-blue/15",
);

const employmentOptions = [
  "Employed Full-Time",
  "Employed Part-Time",
  "Self-Employed",
  "Business Owner",
  "Retired",
  "Student",
];

export function StepFinancialInformation() {
  const { draft, updateFinancialInfo, stepErrors, currentStep } = useWizard();
  const { financialInfo } = draft;

  return (
    <WizardShell
      title="Financial Information"
      description="Provide employment and income details to support your mortgage assessment."
    >
      <WizardStepError message={stepErrors[currentStep]} />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Employment status" htmlFor="employmentStatus">
          <select
            id="employmentStatus"
            value={financialInfo.employmentStatus}
            onChange={(event) =>
              updateFinancialInfo({ employmentStatus: event.target.value })
            }
            className={cn(inputClassName, "w-full rounded-lg px-3")}
          >
            <option value="">Select status</option>
            {employmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Employer / business name" htmlFor="employerName">
          <Input
            id="employerName"
            value={financialInfo.employerName}
            onChange={(event) =>
              updateFinancialInfo({ employerName: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Job title" htmlFor="jobTitle">
          <Input
            id="jobTitle"
            value={financialInfo.jobTitle}
            onChange={(event) =>
              updateFinancialInfo({ jobTitle: event.target.value })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Monthly income (USD)" htmlFor="monthlyIncome">
          <Input
            id="monthlyIncome"
            type="number"
            min={0}
            step={100}
            value={financialInfo.monthlyIncome || ""}
            onChange={(event) =>
              updateFinancialInfo({
                monthlyIncome: Number(event.target.value),
              })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Monthly expenses (USD)" htmlFor="monthlyExpenses">
          <Input
            id="monthlyExpenses"
            type="number"
            min={0}
            step={100}
            value={financialInfo.monthlyExpenses || ""}
            onChange={(event) =>
              updateFinancialInfo({
                monthlyExpenses: Number(event.target.value),
              })
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Existing debt (USD)" htmlFor="existingDebt">
          <Input
            id="existingDebt"
            type="number"
            min={0}
            step={100}
            value={financialInfo.existingDebt || ""}
            onChange={(event) =>
              updateFinancialInfo({
                existingDebt: Number(event.target.value),
              })
            }
            className={inputClassName}
          />
        </FormField>
      </div>
    </WizardShell>
  );
}
