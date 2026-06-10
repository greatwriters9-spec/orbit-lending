"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logProductAudit } from "@/lib/admin/audit/actions";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { requireRoles } from "@/lib/auth/guards";
import { USER_ROLES } from "@/lib/auth/roles";
import {
  CATEGORY_ICON_OPTIONS,
  LOAN_PRODUCT_CATEGORIES,
  getDefaultCategoryConfig,
} from "@/lib/loans/category-config";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/types/admin";
import {
  normalizeIllustrationTransform,
} from "@/lib/loans/category-illustration-transform";

import type { LoanProductCategory } from "@/types/loans";

const framingSchema = z.object({
  illustrationFocalX: z.coerce.number().min(0).max(100),
  illustrationFocalY: z.coerce.number().min(0).max(100),
  illustrationScale: z.coerce.number().min(50).max(200),
});

const categorySchema = z.object({
  label: z.string().min(2, "Category title is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  iconName: z.enum(CATEGORY_ICON_OPTIONS),
  illustrationUrl: z.union([z.literal(""), z.string().url()]).optional(),
  sortOrder: z.coerce.number().int().min(0).max(99),
  active: z.coerce.boolean(),
  illustrationFocalX: z.coerce.number().min(0).max(100).optional(),
  illustrationFocalY: z.coerce.number().min(0).max(100).optional(),
  illustrationScale: z.coerce.number().min(50).max(200).optional(),
});

function revalidateCategoryPaths() {
  revalidatePath("/loans");
  revalidatePath("/admin/loan-products");
  revalidatePath("/super-admin/loan-products");
}

async function requireCategoryManager() {
  const ctx = await requireRoles([USER_ROLES.admin, USER_ROLES.superAdmin]);
  if (!hasAdminPermission(ctx.role, "products:manage")) {
    throw new Error("You do not have permission to manage categories.");
  }
  return ctx;
}

async function safeAudit(
  action: string,
  category: LoanProductCategory,
  newValues: Record<string, unknown>,
) {
  try {
    await logProductAudit({
      action,
      productId: category,
      newValues,
    });
  } catch {
    // Audit logging must not block category saves.
  }
}

export async function updateCategoryAction(
  category: LoanProductCategory,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireCategoryManager();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "You do not have permission to manage categories.",
    };
  }

  if (!LOAN_PRODUCT_CATEGORIES.includes(category)) {
    return { error: "Invalid category." };
  }

  const parsed = categorySchema.safeParse({
    label: formData.get("label"),
    description: formData.get("description"),
    iconName: formData.get("iconName"),
    illustrationUrl: (formData.get("illustrationUrl") as string | null) ?? "",
    sortOrder: formData.get("sortOrder"),
    active: formData.get("active") === "on",
    ...(formData.get("illustrationFocalX") !== null &&
    formData.get("illustrationFocalX") !== ""
      ? {
          illustrationFocalX: formData.get("illustrationFocalX"),
          illustrationFocalY: formData.get("illustrationFocalY"),
          illustrationScale: formData.get("illustrationScale"),
        }
      : {}),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const supabase = await createClient();
    const framing = normalizeIllustrationTransform({
      focalX: parsed.data.illustrationFocalX,
      focalY: parsed.data.illustrationFocalY,
      scale: parsed.data.illustrationScale,
    });

    const row: Record<string, unknown> = {
      category,
      label: parsed.data.label,
      description: parsed.data.description,
      icon_name: parsed.data.iconName,
      illustration_url: parsed.data.illustrationUrl || null,
      sort_order: parsed.data.sortOrder,
      active: parsed.data.active,
      updated_at: new Date().toISOString(),
    };

    if (
      parsed.data.illustrationFocalX !== undefined &&
      parsed.data.illustrationFocalY !== undefined &&
      parsed.data.illustrationScale !== undefined
    ) {
      row.illustration_focal_x = framing.focalX;
      row.illustration_focal_y = framing.focalY;
      row.illustration_scale = framing.scale;
    }

    const { error } = await supabase
      .from("loan_product_category_meta")
      .upsert(row, { onConflict: "category" });

    if (error) {
      return { error: error.message };
    }

    await safeAudit("category.updated", category, row as Record<string, unknown>);
    revalidateCategoryPaths();
    return { success: "Category updated successfully." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save category. Please try again.",
    };
  }
}

export async function updateIllustrationFramingAction(
  category: LoanProductCategory,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireCategoryManager();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "You do not have permission to manage categories.",
    };
  }

  if (!LOAN_PRODUCT_CATEGORIES.includes(category)) {
    return { error: "Invalid category." };
  }

  const parsed = framingSchema.safeParse({
    illustrationFocalX: formData.get("illustrationFocalX"),
    illustrationFocalY: formData.get("illustrationFocalY"),
    illustrationScale: formData.get("illustrationScale"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid framing values." };
  }

  const framing = normalizeIllustrationTransform({
    focalX: parsed.data.illustrationFocalX,
    focalY: parsed.data.illustrationFocalY,
    scale: parsed.data.illustrationScale,
  });

  try {
    const supabase = await createClient();
    const { data: existing, error: readError } = await supabase
      .from("loan_product_category_meta")
      .select("category")
      .eq("category", category)
      .maybeSingle();

    if (readError) {
      return { error: readError.message };
    }

    if (existing) {
      const { error } = await supabase
        .from("loan_product_category_meta")
        .update({
          illustration_focal_x: framing.focalX,
          illustration_focal_y: framing.focalY,
          illustration_scale: framing.scale,
          updated_at: new Date().toISOString(),
        })
        .eq("category", category);

      if (error) {
        return { error: error.message };
      }
    } else {
      const defaults = getDefaultCategoryConfig(category);
      const { error } = await supabase.from("loan_product_category_meta").insert({
        category,
        label: defaults.label,
        description: defaults.description,
        icon_name: defaults.iconName,
        illustration_url: defaults.illustrationUrl,
        illustration_focal_x: framing.focalX,
        illustration_focal_y: framing.focalY,
        illustration_scale: framing.scale,
        sort_order: defaults.sortOrder,
        active: defaults.active,
      });

      if (error) {
        return { error: error.message };
      }
    }

    await safeAudit("category.framing.updated", category, {
      illustration_focal_x: framing.focalX,
      illustration_focal_y: framing.focalY,
      illustration_scale: framing.scale,
    });
    revalidateCategoryPaths();
    return { success: "Illustration framing saved." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save illustration framing.",
    };
  }
}

export async function setCategoryStatusAction(
  category: LoanProductCategory,
  active: boolean,
): Promise<AdminActionState> {
  try {
    await requireCategoryManager();
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "You do not have permission to manage categories.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("loan_product_category_meta")
      .update({
        active,
        updated_at: new Date().toISOString(),
      })
      .eq("category", category);

    if (error) {
      return { error: error.message };
    }

    revalidateCategoryPaths();
    return {
      success: active ? "Category activated." : "Category deactivated.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to update category status.",
    };
  }
}
