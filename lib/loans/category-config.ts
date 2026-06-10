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
    label: "Personal Financing",
    description:
      "Flexible consumer lending for personal expenses, emergencies, and major life purchases.",
    iconName: "Wallet",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 1,
    active: true,
  },
  business: {
    label: "Business Financing",
    description:
      "Working capital, startup funding, and growth financing for businesses of every size.",
    iconName: "Briefcase",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 2,
    active: true,
  },
  asset_financing: {
    label: "Asset Financing",
    description:
      "Vehicle, equipment, and asset-backed loans with competitive terms.",
    iconName: "Truck",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 3,
    active: true,
  },
  property: {
    label: "Property Financing",
    description:
      "Home mortgages, refinancing, and real estate lending solutions.",
    iconName: "Home",
    illustrationUrl: null,
    illustrationTransform: DEFAULT_ILLUSTRATION_TRANSFORM,
    sortOrder: 4,
    active: true,
  },
  education: {
    label: "Education Financing",
    description:
      "Tuition, training programs, and educational expense financing.",
    iconName: "GraduationCap",
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
