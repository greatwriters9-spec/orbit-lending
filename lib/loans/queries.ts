import {
  formatApr,
  formatCurrency,
  formatTermLabel,
  getLoanProductBySlug,
  getLoanProducts,
  getLoanProductsByCategory,
  getLowestApr,
} from "@/lib/loans/mock-data";
import type { LoanCategoryGroup, LoanProduct } from "@/types/loans";

export {
  formatApr,
  formatCurrency,
  formatTermLabel,
  getLowestApr,
};

export async function fetchLoanProducts(): Promise<LoanProduct[]> {
  return getLoanProducts();
}

export async function fetchLoanProductsByCategory(): Promise<
  LoanCategoryGroup[]
> {
  return getLoanProductsByCategory();
}

export async function fetchLoanProductBySlug(
  slug: string,
): Promise<LoanProduct | null> {
  return getLoanProductBySlug(slug) ?? null;
}
