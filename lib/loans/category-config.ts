import type { CategoryIllustrationTransform } from "@/lib/loans/category-illustration-transform";
import { DEFAULT_ILLUSTRATION_TRANSFORM } from "@/lib/loans/category-illustration-transform";
import type { LoanProductCategory } from "@/types/loans";

export type CategoryConfigEntry = {
  category: LoanProductCategory;
  label: string;
  description: string;
  iconName: string;
  illustrationUrl: string | null;
  illustrationTransform: CategoryIllustrationTransform;
  sortOrder: number;
  active: boolean;
};

export const LOAN_PRODUCT_CATEGORIES: LoanProductCategory[] = [
  "personal",
  "business",
  "asset_financing",
  "property",
  "education",
];

export const DEFAULT_CATEGORY_CONFIG: Record<
  LoanProductCategory,
  Omit<CategoryConfigEntry, "category">
> = {
  personal: {
    label: "Fixed-Rate Mortgage",
    description:
      "Predictable monthly payments with a fixed mortgage rate for the life of your loan.",
    iconName: "Home",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 1,
    active: true,
  },
  business: {
    label: "Investment Property Mortgage",
    description:
      "Financing for rental properties, multi-unit homes, and real estate investments.",
    iconName: "Building2",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 2,
    active: true,
  },
  asset_financing: {
    label: "Construction Financing",
    description:
      "Build your dream home with structured draws and milestone-based funding.",
    iconName: "Landmark",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 3,
    active: true,
  },
  property: {
    label: "Mortgage Refinance",
    description:
      "Refinance your existing mortgage to lower your rate or access home equity.",
    iconName: "Home",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 4,
    active: true,
  },
  education: {
    label: "Home Equity Loan",
    description:
      "Borrow against your home equity for renovations, consolidation, or major expenses.",
    iconName: "PiggyBank",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 5,
    active: true,
  },
};

export const CATEGORY_ICON_OPTIONS = [
  "Wallet",
  "Briefcase",
  "Truck",
  "Car",
  "Home",
  "GraduationCap",
  "Building2",
  "Landmark",
  "CreditCard",
  "PiggyBank",
  "Banknote",
  "ShieldCheck",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number];

export function getDefaultCategoryConfig(
  category: LoanProductCategory,
): CategoryConfigEntry {
  const defaults = DEFAULT_CATEGORY_CONFIG[category];
  return { category, ...defaults };
}

export function getAllDefaultCategoryConfig(): CategoryConfigEntry[] {
  return LOAN_PRODUCT_CATEGORIES.map(getDefaultCategoryConfig).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getCategoryLabel(category: LoanProductCategory | string): string {
  return (
    DEFAULT_CATEGORY_CONFIG[category as LoanProductCategory]?.label ?? category
  );
}
