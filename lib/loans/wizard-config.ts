import type { WizardStepDefinition } from "@/types/loan-application";

export const WIZARD_STEPS: WizardStepDefinition[] = [
  {
    id: 1,
    key: "product-summary",
    label: "Loan Product Summary",
    shortLabel: "Product",
  },
  {
    id: 2,
    key: "loan-configuration",
    label: "Loan Configuration",
    shortLabel: "Configure",
  },
  {
    id: 3,
    key: "personal-information",
    label: "Personal Information",
    shortLabel: "Personal",
  },
  {
    id: 4,
    key: "financial-information",
    label: "Financial Information",
    shortLabel: "Financial",
  },
  {
    id: 5,
    key: "requirements-documents",
    label: "Requirements & Documents",
    shortLabel: "Documents",
  },
  {
    id: 6,
    key: "review",
    label: "Review Application",
    shortLabel: "Review",
  },
  {
    id: 7,
    key: "confirmation",
    label: "Submission Confirmation",
    shortLabel: "Confirm",
  },
];

export const TOTAL_WIZARD_STEPS = WIZARD_STEPS.length;

export function getDraftStorageKey(slug: string): string {
  return `orbit-loan-draft-${slug}`;
}

export function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `ORB-${year}-${suffix}`;
}
