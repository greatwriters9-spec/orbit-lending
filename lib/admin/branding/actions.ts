"use server";

import { revalidatePath } from "next/cache";

import { brandingConfigSchema, parseBrandingConfig } from "@/lib/admin/branding/config";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { logAuditEntry } from "@/lib/finance/audit";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminActionState } from "@/types/admin";
import { BRANDING_SETTINGS_KEY, type BrandingConfig } from "@/types/branding-config";

export async function updateBrandingConfigAction(
  input: BrandingConfig,
): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();

  if (!hasAdminPermission(ctx.role, "settings:manage")) {
    return { error: "You do not have permission to update branding settings." };
  }

  const parsed = brandingConfigSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid branding settings." };
  }

  const supabase = createServiceRoleClient();
  const { data: existing } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", BRANDING_SETTINGS_KEY)
    .maybeSingle();

  const row = {
    key: BRANDING_SETTINGS_KEY,
    value: parsed.data,
    updated_at: new Date().toISOString(),
    updated_by: ctx.user.id,
  };

  const { error } = existing
    ? await supabase.from("platform_settings").update(row).eq("key", BRANDING_SETTINGS_KEY)
    : await supabase.from("platform_settings").insert(row);

  if (error) {
    return { error: error.message };
  }

  await logAuditEntry({
    action: "settings.branding_updated",
    entityType: "platform_settings",
    entityId: BRANDING_SETTINGS_KEY,
    oldValues: existing?.value ? parseBrandingConfig(existing.value) : {},
    newValues: parsed.data,
  });

  revalidatePath("/");
  revalidatePath("/super-admin/settings");

  return { success: "Brand and contact settings saved." };
}
