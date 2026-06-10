"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSuperAdmin } from "@/lib/auth/guards";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { logAuditEntry } from "@/lib/finance/audit";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionState, PlatformSetting } from "@/types/admin";

export async function fetchPlatformSettings(): Promise<PlatformSetting[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("platform_settings")
    .select("*")
    .order("key");

  return (data ?? []).map((row) => ({
    key: row.key,
    value: row.value as Record<string, unknown>,
    updatedAt: row.updated_at,
  }));
}

const settingsSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export async function updatePlatformSettingAction(
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();

  if (!hasAdminPermission(ctx.role, "settings:manage")) {
    return { error: "You do not have permission to manage platform settings." };
  }

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let valueJson: Record<string, unknown>;
  try {
    valueJson = JSON.parse(parsed.data.value) as Record<string, unknown>;
  } catch {
    return { error: "Settings value must be valid JSON." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", parsed.data.key)
    .maybeSingle();

  const { error } = await supabase
    .from("platform_settings")
    .update({
      value: valueJson,
      updated_at: new Date().toISOString(),
      updated_by: ctx.user.id,
    })
    .eq("key", parsed.data.key);

  if (error) {
    return { error: error.message };
  }

  await logAuditEntry({
    action: "platform.settings_updated",
    entityType: "platform_settings",
    entityId: parsed.data.key,
    oldValues: existing?.value as Record<string, unknown> | undefined,
    newValues: valueJson,
  });

  revalidatePath("/super-admin/settings");
  return { success: "Platform settings updated." };
}

export async function updatePlatformSettingFormAction(formData: FormData) {
  await updatePlatformSettingAction(formData);
}
