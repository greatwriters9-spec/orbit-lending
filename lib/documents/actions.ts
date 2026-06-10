"use server";

import { revalidatePath } from "next/cache";

import {
  isAllowedDocumentFile,
  uploadApplicationDocumentFile,
} from "@/lib/documents/storage";
import { createClient } from "@/lib/supabase/server";

export async function uploadApplicationDocumentAction(
  formData: FormData,
): Promise<{ storagePath?: string; fileName?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to upload documents." };
  }

  const applicationId = formData.get("applicationId")?.toString();
  const requirementId = formData.get("requirementId")?.toString();
  const file = formData.get("file");

  if (!applicationId || !requirementId) {
    return { error: "Missing application context." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Select a file to upload." };
  }

  if (!isAllowedDocumentFile(file)) {
    return { error: "Unsupported file type. Use PDF, JPG, PNG, or Word documents." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found." };
  }

  const upload = await uploadApplicationDocumentFile({
    userId: user.id,
    applicationId,
    requirementId,
    file,
  });

  if (upload.error) {
    return { error: upload.error };
  }

  revalidatePath("/dashboard/documents");
  return {
    storagePath: upload.storagePath,
    fileName: file.name,
  };
}

export async function ensureApplicationDraftIdAction(input: {
  loanProductSlug: string;
}): Promise<{ applicationId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { data: existing } = await supabase
    .from("loan_applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("loan_product_slug", input.loanProductSlug)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { applicationId: existing.id };
  }

  const { generateApplicationNumber } = await import("@/lib/loans/wizard-config");
  const { data, error } = await supabase
    .from("loan_applications")
    .insert({
      user_id: user.id,
      loan_product_slug: input.loanProductSlug,
      status: "draft",
      application_number: generateApplicationNumber(),
      personal_info: {},
      financial_info: {},
      requirement_documents: {},
      current_step: 1,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Unable to create draft application." };
  }

  return { applicationId: data.id };
}
