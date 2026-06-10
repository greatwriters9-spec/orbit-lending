import { fetchDisplayCategoryCatalog } from "@/lib/loans/category-catalog";
import { fetchCatalogProducts } from "@/lib/admin/products/queries";
import {
  getLoanProductBySlug,
  getLoanProducts,
  getLowestApr,
} from "@/lib/loans/mock-data";
import type { LoanCategoryGroup, LoanProduct } from "@/types/loans";

function applyCatalogOverrides(
  mock: LoanProduct,
  catalog: {
    name: string;
    description: string;
    minAmount: number;
    maxAmount: number;
    minApr: number | null;
    maxApr: number | null;
    defaultApr: number | null;
    active: boolean;
  },
): LoanProduct {
  return {
    ...mock,
    name: catalog.name,
    description: catalog.description,
    minAmount: catalog.minAmount,
    maxAmount: catalog.maxAmount,
    active: catalog.active,
    terms: mock.terms.map((term, index) =>
      index === 0 && catalog.minApr !== null
        ? { ...term, interestRate: catalog.minApr }
        : term,
    ),
  };
}

async function fetchMergedLoanProducts(): Promise<LoanProduct[]> {
  const catalog = await fetchCatalogProducts();
  const hasSavedProducts = catalog.some((product) => !product.catalogOnly);

  if (!hasSavedProducts) {
    return getLoanProducts();
  }

  return catalog
    .filter((product) => product.active)
    .map((catalogProduct) => {
      const mock = getLoanProductBySlug(catalogProduct.slug);
      if (mock) {
        return applyCatalogOverrides(mock, catalogProduct);
      }

      return {
        id: catalogProduct.id,
        name: catalogProduct.name,
        slug: catalogProduct.slug,
        category: catalogProduct.category as LoanProduct["category"],
        description: catalogProduct.description,
        minAmount: catalogProduct.minAmount,
        maxAmount: catalogProduct.maxAmount,
        active: catalogProduct.active,
        country: catalogProduct.country,
        eligibilitySummary: catalogProduct.eligibilitySummary ?? "",
        eligibilityCriteria: [],
        requirements: [],
        terms: [
          {
            id: `${catalogProduct.slug}-term`,
            repaymentFrequency: catalogProduct.monthlyRepaymentSupported
              ? "Monthly"
              : "Weekly",
            repaymentPeriod: catalogProduct.minTerm ?? 12,
            interestRate:
              catalogProduct.minApr ?? catalogProduct.defaultApr ?? 10,
            active: true,
          },
        ],
      } satisfies LoanProduct;
    });
}

function buildCategoryGroups(
  products: LoanProduct[],
  metaList: Awaited<ReturnType<typeof fetchDisplayCategoryCatalog>>,
): LoanCategoryGroup[] {
  const productsByCategory = new Map<string, LoanProduct[]>();
  for (const product of products) {
    const list = productsByCategory.get(product.category) ?? [];
    list.push(product);
    productsByCategory.set(product.category, list);
  }

  return metaList
    .filter((meta) => meta.active)
    .map((meta) => ({
      category: meta.category,
      label: meta.label,
      description: meta.description,
      iconName: meta.iconName,
      illustrationUrl: meta.illustrationUrl,
      illustrationTransform: meta.illustrationTransform,
      sortOrder: meta.sortOrder,
      active: meta.active,
      products: productsByCategory.get(meta.category) ?? [],
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchLoanProductsForClient(): Promise<LoanProduct[]> {
  return fetchMergedLoanProducts();
}

export async function fetchLoanProductsByCategoryForClient(): Promise<
  LoanCategoryGroup[]
> {
  const [categoryMeta, catalog] = await Promise.all([
    fetchDisplayCategoryCatalog(),
    fetchCatalogProducts(),
  ]);

  const hasSavedProducts = catalog.some((product) => !product.catalogOnly);

  if (!hasSavedProducts) {
    return buildCategoryGroups(getLoanProducts(), categoryMeta);
  }

  const products = await fetchMergedLoanProducts();
  return buildCategoryGroups(products, categoryMeta);
}

export async function fetchLoanProductBySlugForClient(
  slug: string,
): Promise<LoanProduct | null> {
  const products = await fetchMergedLoanProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export { getLowestApr };
