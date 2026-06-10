"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRoles } from "@/lib/auth/guards";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { logProductAudit } from "@/lib/admin/audit/actions";
import { resolveAdminProductRecord } from "@/lib/admin/products/queries";
import { createClient } from "@/lib/supabase/server";
import { USER_ROLES } from "@/lib/auth/roles";
import type { AdminActionState, LoanProductStatus } from "@/types/admin";

const productSchema = z
  .object({
    name: z.string().min(2, "Product name is required."),
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens."),
    category: z.enum([
      "personal",
      "business",
      "asset_financing",
      "property",
      "education",
    ]),
    description: z.string().min(10, "Description must be at least 10 characters."),
    minAmount: z.coerce.number().min(0),
    maxAmount: z.coerce.number().min(0),
    defaultApr: z.coerce.number().min(0).max(100),
    minApr: z.coerce.number().min(0).max(100),
    maxApr: z.coerce.number().min(0).max(100),
    minTerm: z.coerce.number().int().min(1),
    maxTerm: z.coerce.number().int().min(1),
    weeklyRepaymentSupported: z.coerce.boolean(),
    monthlyRepaymentSupported: z.coerce.boolean(),
    productStatus: z.enum(["draft", "active", "hidden", "archived"]),
    country: z.string().min(2).default("US"),
    eligibilitySummary: z.string().optional(),
  })
  .refine((data) => data.maxAmount >= data.minAmount, {
    message: "Max amount must be greater than or equal to min amount.",
    path: ["maxAmount"],
  })
  .refine((data) => data.maxApr >= data.minApr, {
    message: "Max APR must be greater than or equal to min APR.",
    path: ["maxApr"],
  })
  .refine((data) => data.maxTerm >= data.minTerm, {
    message: "Max term must be greater than or equal to min term.",
    path: ["maxTerm"],
  })
  .refine(
    (data) => data.weeklyRepaymentSupported || data.monthlyRepaymentSupported,
    {
      message: "At least one repayment frequency must be supported.",
      path: ["monthlyRepaymentSupported"],
    },
  );

function revalidateProductPaths() {
  revalidatePath("/admin/loan-products");
  revalidatePath("/super-admin/loan-products");
  revalidatePath("/loans");
  revalidatePath("/dashboard/loans");
}

function toDbRow(parsed: z.infer<typeof productSchema>) {
  return {
    name: parsed.name,
    slug: parsed.slug,
    category: parsed.category,
    description: parsed.description,
    min_amount: parsed.minAmount,
    max_amount: parsed.maxAmount,
    default_apr: parsed.defaultApr,
    min_apr: parsed.minApr,
    max_apr: parsed.maxApr,
    min_term: parsed.minTerm,
    max_term: parsed.maxTerm,
    weekly_repayment_supported: parsed.weeklyRepaymentSupported,
    monthly_repayment_supported: parsed.monthlyRepaymentSupported,
    product_status: parsed.productStatus,
    active: parsed.productStatus === "active",
    country: parsed.country,
    eligibility_summary: parsed.eligibilitySummary ?? null,
    updated_at: new Date().toISOString(),
  };
}

function parseProductForm(formData: FormData) {
  const entries = Object.fromEntries(formData.entries());
  return {
    ...entries,
    weeklyRepaymentSupported:
      formData.get("weeklyRepaymentSupported") === "on" ? "true" : "false",
    monthlyRepaymentSupported:
      formData.get("monthlyRepaymentSupported") === "on" ? "true" : "false",
  };
}

async function requireProductManager() {
  return requireRoles([USER_ROLES.admin, USER_ROLES.superAdmin]);
}

export async function createProductAction(
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireProductManager();

  if (!hasAdminPermission(ctx.role, "products:manage")) {
    return { error: "You do not have permission to manage products." };
  }

  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const row = toDbRow(parsed.data);

  const { data, error } = await supabase
    .from("loan_products")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logProductAudit({
    action: "product.created",
    productId: data.id,
    newValues: row,
  });

  revalidateProductPaths();
  return { success: "Product created successfully." };
}

export async function updateProductAction(
  productId: string,
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireProductManager();

  if (!hasAdminPermission(ctx.role, "products:manage")) {
    return { error: "You do not have permission to manage products." };
  }

  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const row = toDbRow(parsed.data);

  const resolved = await resolveAdminProductRecord(productId);
  if (!resolved.product) {
    return { error: "Product not found." };
  }

  if (resolved.dbId) {
    const { data: existing } = await supabase
      .from("loan_products")
      .select("*")
      .eq("id", resolved.dbId)
      .maybeSingle();

    const { error } = await supabase
      .from("loan_products")
      .update(row)
      .eq("id", resolved.dbId);

    if (error) {
      return { error: error.message };
    }

    await logProductAudit({
      action: "product.updated",
      productId: resolved.dbId,
      oldValues: (existing ?? resolved.product) as Record<string, unknown>,
      newValues: row,
    });

    revalidateProductPaths();
    return { success: "Product updated successfully." };
  }

  const { data: inserted, error } = await supabase
    .from("loan_products")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await logProductAudit({
    action: "product.catalog_synced",
    productId: inserted.id,
    oldValues: resolved.product as unknown as Record<string, unknown>,
    newValues: row,
  });

  revalidateProductPaths();
  return { success: "Catalog product saved and updated successfully." };
}

async function setProductStatus(
  productId: string,
  productStatus: LoanProductStatus,
  reason?: string,
): Promise<AdminActionState> {
  const ctx = await requireProductManager();

  if (!hasAdminPermission(ctx.role, "products:manage")) {
    return { error: "You do not have permission to manage products." };
  }

  const supabase = await createClient();
  const resolved = await resolveAdminProductRecord(productId);

  if (!resolved.product) {
    return { error: "Product not found." };
  }

  let dbId = resolved.dbId;

  if (!dbId) {
    const catalog = resolved.product;
    const { data: inserted, error: insertError } = await supabase
      .from("loan_products")
      .insert({
        name: catalog.name,
        slug: catalog.slug,
        category: catalog.category,
        description: catalog.description,
        min_amount: catalog.minAmount,
        max_amount: catalog.maxAmount,
        default_apr: catalog.defaultApr,
        min_apr: catalog.minApr,
        max_apr: catalog.maxApr,
        min_term: catalog.minTerm,
        max_term: catalog.maxTerm,
        weekly_repayment_supported: catalog.weeklyRepaymentSupported,
        monthly_repayment_supported: catalog.monthlyRepaymentSupported,
        product_status: productStatus,
        active: productStatus === "active",
        country: catalog.country,
        eligibility_summary: catalog.eligibilitySummary,
      })
      .select("id, product_status, active")
      .single();

    if (insertError || !inserted) {
      return { error: insertError?.message ?? "Failed to save catalog product." };
    }

    await logProductAudit({
      action: `product.status_${productStatus}`,
      productId: inserted.id,
      oldValues: catalog as unknown as Record<string, unknown>,
      newValues: { product_status: productStatus, reason },
      reason,
    });

    revalidateProductPaths();
    return { success: `Product status set to ${productStatus}.` };
  }

  const { data: existing } = await supabase
    .from("loan_products")
    .select("product_status, active")
    .eq("id", dbId)
    .maybeSingle();

  if (!existing) {
    return { error: "Product not found." };
  }

  const { error } = await supabase
    .from("loan_products")
    .update({
      product_status: productStatus,
      active: productStatus === "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dbId);

  if (error) {
    return { error: error.message };
  }

  await logProductAudit({
    action: `product.status_${productStatus}`,
    productId: dbId,
    oldValues: existing as Record<string, unknown>,
    newValues: { product_status: productStatus, reason },
    reason,
  });

  revalidateProductPaths();
  return { success: `Product status set to ${productStatus}.` };
}

export async function activateProductAction(
  productId: string,
): Promise<AdminActionState> {
  return setProductStatus(productId, "active");
}

export async function deactivateProductAction(
  productId: string,
): Promise<AdminActionState> {
  return setProductStatus(productId, "hidden");
}

export async function archiveProductAction(
  productId: string,
  reason?: string,
): Promise<AdminActionState> {
  return setProductStatus(productId, "archived", reason);
}

export async function draftProductAction(
  productId: string,
): Promise<AdminActionState> {
  return setProductStatus(productId, "draft");
}
