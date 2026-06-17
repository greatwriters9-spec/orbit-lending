"use server";

import { revalidatePath } from "next/cache";

import { requireRoles } from "@/lib/auth/guards";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { logAuditEntry } from "@/lib/finance/audit";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { mortgageConfigSchema } from "@/lib/admin/mortgage/config";
import { USER_ROLES } from "@/lib/auth/roles";
import type { AdminActionState } from "@/types/admin";
import { MORTGAGE_SETTINGS_KEY } from "@/types/mortgage-config";

export async function updateMortgageConfigAction(
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireRoles([USER_ROLES.admin, USER_ROLES.superAdmin]);

  if (!hasAdminPermission(ctx.role, "products:manage")) {
    return { error: "You do not have permission to manage mortgage settings." };
  }

  const raw = formData.get("config");
  if (typeof raw !== "string") {
    return { error: "Missing mortgage configuration payload." };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { error: "Mortgage configuration must be valid JSON." };
  }

  const parsed = mortgageConfigSchema.safeParse(json);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid mortgage settings." };
  }

  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", MORTGAGE_SETTINGS_KEY)
    .maybeSingle();

  const row = {
    key: MORTGAGE_SETTINGS_KEY,
    value: parsed.data,
    updated_at: new Date().toISOString(),
    updated_by: ctx.user.id,
  };

  const { error } = existing
    ? await supabase
        .from("platform_settings")
        .update(row)
        .eq("key", MORTGAGE_SETTINGS_KEY)
    : await supabase.from("platform_settings").insert(row);

  if (error) {
    return { error: error.message };
  }

  await logAuditEntry({
    action: "mortgage.settings_updated",
    entityType: "platform_settings",
    entityId: MORTGAGE_SETTINGS_KEY,
    oldValues: existing?.value as Record<string, unknown> | undefined,
    newValues: parsed.data,
  });

  revalidatePath("/super-admin/loan-products");
  revalidatePath("/admin/loan-products");
  revalidatePath("/get-started");

  return { success: "Mortgage settings updated successfully." };
}
