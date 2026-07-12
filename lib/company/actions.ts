"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSuperAdmin } from "@/lib/auth/guards";
import { logAuditEntry } from "@/lib/finance/audit";
import { mapCompanyRow, mapCompanyToRow, type CompanyRow } from "@/lib/company/mapper";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminActionState } from "@/types/admin";
import type { CompanyRecord, CompanyStatus } from "@/types/company";

const companyInputSchema = z.object({
  id: z.string().uuid().optional(),
  companyName: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  domain: z.string().trim().min(3),
  alternateDomains: z.array(z.string()).default([]),
  logo: z.string().nullable().optional(),
  favicon: z.string().nullable().optional(),
  primaryColor: z.string().trim().min(4),
  secondaryColor: z.string().trim().min(4),
  accentColor: z.string().trim().min(4),
  backgroundColor: z.string().trim().min(4),
  headquartersAddress: z.string().nullable().optional(),
  businessAddress: z.string().nullable().optional(),
  supportEmail: z.string().email().nullable().optional(),
  generalEmail: z.string().email().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  secondaryPhone: z.string().nullable().optional(),
  businessHours: z.string().nullable().optional(),
  bankingPartner: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  privacyPolicy: z.string().nullable().optional(),
  termsConditions: z.string().nullable().optional(),
  aboutUs: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  vision: z.string().nullable().optional(),
  whyChooseUs: z.string().nullable().optional(),
  footerText: z.string().nullable().optional(),
  copyrightText: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  tiktok: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
  threads: z.string().nullable().optional(),
  telegram: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  heroTitle: z.string().nullable().optional(),
  heroSubtitle: z.string().nullable().optional(),
  heroButtonText: z.string().nullable().optional(),
  heroBackground: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  companyStatus: z.enum(["active", "inactive"]),
});

export async function listCompaniesAction(): Promise<CompanyRecord[]> {
  await requireSuperAdmin();
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("company_name", { ascending: true });

  return (data ?? []).map((row) => mapCompanyRow(row as CompanyRow));
}

export async function getCompanyAction(id: string): Promise<CompanyRecord | null> {
  await requireSuperAdmin();
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("companies").select("*").eq("id", id).maybeSingle();
  return data ? mapCompanyRow(data as CompanyRow) : null;
}

export async function saveCompanyAction(
  input: z.infer<typeof companyInputSchema>,
): Promise<AdminActionState & { companyId?: string }> {
  const ctx = await requireSuperAdmin();
  const parsed = companyInputSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid company data." };
  }

  const payload = mapCompanyToRow(parsed.data);
  const supabase = createServiceRoleClient();

  if (parsed.data.id) {
    const { data: existing } = await supabase
      .from("companies")
      .select("*")
      .eq("id", parsed.data.id)
      .maybeSingle();

    const { error } = await supabase
      .from("companies")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) {
      return { error: error.message };
    }

    await logAuditEntry({
      action: "company.updated",
      entityType: "company",
      entityId: parsed.data.id,
      oldValues: existing ?? {},
      newValues: payload,
    });
  } else {
    const { data, error } = await supabase
      .from("companies")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Failed to create company." };
    }

    parsed.data.id = data.id;

    await logAuditEntry({
      action: "company.created",
      entityType: "company",
      entityId: data.id,
      newValues: payload,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/super-admin/companies");
  revalidatePath(`/super-admin/companies/${parsed.data.id}`);

  return {
    success: parsed.data.id ? "Company updated." : "Company created.",
    companyId: parsed.data.id,
  };
}

export async function setCompanyStatusAction(
  id: string,
  companyStatus: CompanyStatus,
): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("companies")
    .update({ company_status: companyStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logAuditEntry({
    action: "company.status_updated",
    entityType: "company",
    entityId: id,
    newValues: { companyStatus },
  });

  revalidatePath("/super-admin/companies");
  revalidatePath("/", "layout");

  return {
    success: companyStatus === "active" ? "Company activated." : "Company deactivated.",
  };
}

export async function deleteCompanyAction(id: string): Promise<AdminActionState> {
  const ctx = await requireSuperAdmin();
  const supabase = createServiceRoleClient();

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("company_id", id);

  if (count && count > 0) {
    return { error: "Cannot delete a company that has assigned users." };
  }

  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  await logAuditEntry({
    action: "company.deleted",
    entityType: "company",
    entityId: id,
  });

  revalidatePath("/super-admin/companies");
  revalidatePath("/", "layout");

  return { success: "Company deleted." };
}
