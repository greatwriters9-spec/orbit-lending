import { createClient } from "@/lib/supabase/server";
import {
  getCatalogAdminProduct,
  getCatalogAdminProducts,
} from "@/lib/admin/products/mock-catalog";
import type { AdminLoanProduct, LoanProductStatus } from "@/types/admin";
import { deriveProductRateDefaults } from "@/lib/admin/products/rate-defaults";

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  min_amount: number;
  max_amount: number;
  default_apr: number | null;
  min_apr: number | null;
  max_apr: number | null;
  min_term: number | null;
  max_term: number | null;
  weekly_repayment_supported: boolean;
  monthly_repayment_supported: boolean;
  product_status: LoanProductStatus;
  active: boolean;
  country: string;
  eligibility_summary: string | null;
  created_at: string;
  updated_at: string;
};

export function isDatabaseProductId(productId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    productId,
  );
}

function mapProduct(row: DbProduct): AdminLoanProduct {
  const rates = deriveProductRateDefaults({
    defaultApr: row.default_apr !== null ? Number(row.default_apr) : null,
    minApr: row.min_apr !== null ? Number(row.min_apr) : null,
    maxApr: row.max_apr !== null ? Number(row.max_apr) : null,
    minTerm: row.min_term,
    maxTerm: row.max_term,
    weeklyRepaymentSupported: row.weekly_repayment_supported,
    monthlyRepaymentSupported: row.monthly_repayment_supported,
  });

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    minAmount: Number(row.min_amount),
    maxAmount: Number(row.max_amount),
    defaultApr: rates.defaultApr,
    minApr: rates.minApr,
    maxApr: rates.maxApr,
    minTerm: rates.minTerm,
    maxTerm: rates.maxTerm,
    weeklyRepaymentSupported: row.weekly_repayment_supported,
    monthlyRepaymentSupported: row.monthly_repayment_supported,
    productStatus: row.product_status,
    active: row.active,
    country: row.country,
    eligibilitySummary: row.eligibility_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    catalogOnly: false,
  };
}

function mergeWithCatalog(dbProducts: AdminLoanProduct[]): AdminLoanProduct[] {
  const dbSlugs = new Set(dbProducts.map((product) => product.slug));
  const catalogOnly = getCatalogAdminProducts().filter(
    (product) => !dbSlugs.has(product.slug),
  );

  return [...dbProducts, ...catalogOnly].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function fetchAdminProducts(): Promise<AdminLoanProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("loan_products")
    .select("*")
    .order("name");

  if (error || !data) {
    return getCatalogAdminProducts();
  }

  return mergeWithCatalog((data as DbProduct[]).map(mapProduct));
}

export async function fetchAdminProductById(
  productId: string,
): Promise<AdminLoanProduct | null> {
  const supabase = await createClient();

  if (isDatabaseProductId(productId)) {
    const { data } = await supabase
      .from("loan_products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (data) {
      return mapProduct(data as DbProduct);
    }
  }

  const catalog = getCatalogAdminProduct(productId);
  if (!catalog) {
    return null;
  }

  const { data: bySlug } = await supabase
    .from("loan_products")
    .select("*")
    .eq("slug", catalog.slug)
    .maybeSingle();

  if (bySlug) {
    return mapProduct(bySlug as DbProduct);
  }

  return catalog;
}

export async function fetchAdminProductBySlug(
  slug: string,
): Promise<AdminLoanProduct | null> {
  return fetchAdminProductById(slug);
}

export async function resolveAdminProductRecord(
  productId: string,
): Promise<{ dbId: string | null; product: AdminLoanProduct | null }> {
  const product = await fetchAdminProductById(productId);
  if (!product) {
    return { dbId: null, product: null };
  }

  if (isDatabaseProductId(product.id) && !product.catalogOnly) {
    return { dbId: product.id, product };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("loan_products")
    .select("id")
    .eq("slug", product.slug)
    .maybeSingle();

  return { dbId: data?.id ?? null, product };
}

export async function fetchCatalogProducts(): Promise<AdminLoanProduct[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loan_products")
    .select("*")
    .eq("product_status", "active")
    .order("name");

  if (!data?.length) {
    return getCatalogAdminProducts().filter(
      (product) => product.productStatus === "active",
    );
  }

  return mergeWithCatalog((data as DbProduct[]).map(mapProduct)).filter(
    (product) => product.productStatus === "active",
  );
}
