import { getLowestApr, loanProducts } from "@/lib/loans/mock-data";
import type { AdminLoanProduct } from "@/types/admin";
import type { LoanProduct } from "@/types/loans";

function deriveRatesFromTerms(product: LoanProduct) {
  const activeTerms = product.terms.filter((term) => term.active);
  const rates = activeTerms.map((term) => term.interestRate);
  const periods = activeTerms.map((term) => term.repaymentPeriod);

  const minApr = rates.length ? Math.min(...rates) : 10;
  const maxApr = rates.length ? Math.max(...rates) : minApr;
  const defaultApr =
    rates.length > 1
      ? Number(((minApr + maxApr) / 2).toFixed(2))
      : minApr;

  const weeklyRepaymentSupported = activeTerms.some(
    (term) => term.repaymentFrequency === "Weekly",
  );
  const monthlyRepaymentSupported = activeTerms.some(
    (term) => term.repaymentFrequency === "Monthly",
  );

  return {
    defaultApr,
    minApr,
    maxApr,
    minTerm: periods.length ? Math.min(...periods) : 6,
    maxTerm: periods.length ? Math.max(...periods) : 60,
    weeklyRepaymentSupported,
    monthlyRepaymentSupported,
  };
}

export function mockProductToAdmin(product: LoanProduct): AdminLoanProduct {
  const rates = deriveRatesFromTerms(product);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    minAmount: product.minAmount,
    maxAmount: product.maxAmount,
    defaultApr: rates.defaultApr,
    minApr: rates.minApr,
    maxApr: rates.maxApr,
    minTerm: rates.minTerm,
    maxTerm: rates.maxTerm,
    weeklyRepaymentSupported: rates.weeklyRepaymentSupported,
    monthlyRepaymentSupported: rates.monthlyRepaymentSupported,
    productStatus: product.active ? "active" : "draft",
    active: product.active,
    country: product.country,
    eligibilitySummary: product.eligibilitySummary,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    catalogOnly: true,
  };
}

export function getCatalogAdminProducts(): AdminLoanProduct[] {
  return loanProducts.map(mockProductToAdmin);
}

export function getCatalogAdminProduct(
  idOrSlug: string,
): AdminLoanProduct | null {
  const product =
    loanProducts.find((entry) => entry.id === idOrSlug) ??
    loanProducts.find((entry) => entry.slug === idOrSlug);

  return product ? mockProductToAdmin(product) : null;
}

export function getCatalogLowestApr(slug: string): number {
  const product = loanProducts.find((entry) => entry.slug === slug);
  return product ? getLowestApr(product) : 0;
}
