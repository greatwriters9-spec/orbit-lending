import { mapDbIllustrationTransform } from "@/lib/loans/category-illustration-transform";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CATEGORY_CONFIG,
  getAllDefaultCategoryConfig,
  getDefaultCategoryConfig,
  LOAN_PRODUCT_CATEGORIES,
  type CategoryConfigEntry,
} from "@/lib/loans/category-config";
import type { LoanProductCategory } from "@/types/loans";

type DbCategoryMeta = {
  category: LoanProductCategory;
  label: string;
  description: string;
  icon_name: string;
  illustration_url: string | null;
  illustration_focal_x?: number | null;
  illustration_focal_y?: number | null;
  illustration_scale?: number | null;
  sort_order: number;
  active: boolean;
  updated_at: string;
};

function mapCategoryMeta(row: DbCategoryMeta): CategoryConfigEntry {
  return {
    category: row.category,
    label: row.label,
    description: row.description,
    iconName: row.icon_name,
    illustrationUrl: row.illustration_url,
    illustrationTransform: mapDbIllustrationTransform(row),
    sortOrder: row.sort_order,
    active: row.active,
  };
}

function mergeWithDefaults(dbRows: CategoryConfigEntry[]): CategoryConfigEntry[] {
  const dbByCategory = new Map(dbRows.map((row) => [row.category, row]));

  return LOAN_PRODUCT_CATEGORIES.map((category) => {
    const db = dbByCategory.get(category);
    if (db) return db;
    return getDefaultCategoryConfig(category);
  }).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchCategoryMeta(options?: {
  includeInactive?: boolean;
}): Promise<CategoryConfigEntry[]> {
  const supabase = await createClient();
  const includeInactive = options?.includeInactive ?? false;

  const { data, error } = await supabase
    .from("loan_product_category_meta")
    .select("*")
    .order("sort_order");

  if (error || !data?.length) {
    const defaults = getAllDefaultCategoryConfig();
    return includeInactive
      ? defaults
      : defaults.filter((category) => category.active);
  }

  const merged = mergeWithDefaults((data as DbCategoryMeta[]).map(mapCategoryMeta));
  return includeInactive
    ? merged
    : merged.filter((category) => category.active);
}

export async function fetchCategoryMetaByKey(
  category: LoanProductCategory,
): Promise<CategoryConfigEntry> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loan_product_category_meta")
    .select("*")
    .eq("category", category)
    .maybeSingle();

  if (data) {
    return mapCategoryMeta(data as DbCategoryMeta);
  }

  return getDefaultCategoryConfig(category);
}

export type AdminCategoryMeta = CategoryConfigEntry & {
  updatedAt?: string;
};

export async function fetchAdminCategories(): Promise<AdminCategoryMeta[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("loan_product_category_meta")
    .select("*")
    .order("sort_order");

  if (error || !data?.length) {
    return getAllDefaultCategoryConfig();
  }

  return mergeWithDefaults((data as DbCategoryMeta[]).map(mapCategoryMeta)).map(
    (entry) => {
      const row = (data as DbCategoryMeta[]).find(
        (item) => item.category === entry.category,
      );
      return {
        ...entry,
        updatedAt: row?.updated_at,
      };
    },
  );
}

export async function fetchAdminCategoryByKey(
  category: LoanProductCategory,
): Promise<AdminCategoryMeta | null> {
  const categories = await fetchAdminCategories();
  return categories.find((entry) => entry.category === category) ?? null;
}

export function getCategoryDefaultsForAdmin(
  category: LoanProductCategory,
): CategoryConfigEntry {
  return {
    category,
    ...DEFAULT_CATEGORY_CONFIG[category],
  };
}
