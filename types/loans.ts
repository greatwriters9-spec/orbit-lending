import type { CategoryIllustrationTransform } from "@/lib/loans/category-illustration-transform";

export type LoanProductCategory =
  | "personal"
  | "business"
  | "asset_financing"
  | "property"
  | "education";

export type LoanProductRequirement = {
  id: string;
  requirementName: string;
  description: string;
  required: boolean;
};

export type LoanProductTerm = {
  id: string;
  repaymentFrequency: string;
  repaymentPeriod: number;
  interestRate: number;
  active: boolean;
};

export type LoanProduct = {
  id: string;
  name: string;
  slug: string;
  category: LoanProductCategory;
  description: string;
  minAmount: number;
  maxAmount: number;
  active: boolean;
  country: string;
  eligibilitySummary: string;
  eligibilityCriteria: string[];
  requirements: LoanProductRequirement[];
  terms: LoanProductTerm[];
};

export type LoanCategoryGroup = {
  category: LoanProductCategory;
  label: string;
  description: string;
  iconName: string;
  illustrationUrl: string | null;
  illustrationTransform: CategoryIllustrationTransform;
  sortOrder: number;
  active: boolean;
  products: LoanProduct[];
};
