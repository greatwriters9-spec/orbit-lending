"use server";

import { processApplicationSubmission } from "@/lib/applications/engine/processor";
import { assertClientAccountAllows } from "@/lib/auth/account-enforcement";
import { createClient } from "@/lib/supabase/server";
import {
  financialInformationSchema,
  loanConfigurationSchema,
  personalInformationSchema,
} from "@/lib/loans/application-schemas";
import { generateApplicationNumber } from "@/lib/loans/wizard-config";
import {
  ACTIVE_LOAN_BLOCK_MESSAGE,
  userHasActiveLoan,
} from "@/lib/wallet/active-loan";
import type {
  LoanApplicationActionState,
  LoanApplicationDraft,
} from "@/types/loan-application";

function mapDraftToRow(draft: LoanApplicationDraft, userId: string) {
  return {
    user_id: userId,
    loan_product_slug: draft.loanProductSlug,
    requested_amount: draft.configuration.requestedAmount || null,
    selected_term_id: draft.configuration.selectedTermId || null,
    purpose: draft.configuration.purpose || null,
    status: "draft" as const,
    personal_info: draft.personalInfo,
    financial_info: draft.financialInfo,
    requirement_documents: draft.documents,
    current_step: draft.currentStep,
  };
}

export async function fetchApplicationDraft(
  slug: string,
): Promise<LoanApplicationDraft | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("user_id", user.id)
    .eq("loan_product_slug", slug)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    applicationId: data.id,
    applicationNumber: data.application_number ?? undefined,
    currentStep: data.current_step,
    loanProductSlug: data.loan_product_slug,
    configuration: {
      requestedAmount: Number(data.requested_amount ?? 0),
      selectedTermId: data.selected_term_id ?? "",
      repaymentFrequency: "",
      purpose: data.purpose ?? "",
    },
    personalInfo: data.personal_info as LoanApplicationDraft["personalInfo"],
    financialInfo: data.financial_info as LoanApplicationDraft["financialInfo"],
    documents: data.requirement_documents as LoanApplicationDraft["documents"],
  };
}

export async function saveApplicationDraftAction(
  draft: LoanApplicationDraft,
): Promise<LoanApplicationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to save a draft." };
  }

  if (!draft.applicationId && (await userHasActiveLoan(user.id))) {
    return { error: ACTIVE_LOAN_BLOCK_MESSAGE };
  }

  const row = mapDraftToRow(draft, user.id);

  if (draft.applicationId) {
    const { error } = await supabase
      .from("loan_applications")
      .update(row)
      .eq("id", draft.applicationId)
      .eq("user_id", user.id)
      .eq("status", "draft");

    if (error) {
      return { error: error.message };
    }

    return {
      success: "Draft saved successfully.",
      applicationId: draft.applicationId,
      applicationNumber: draft.applicationNumber,
    };
  }

  const applicationNumber = generateApplicationNumber();
  const { data, error } = await supabase
    .from("loan_applications")
    .insert({
      ...row,
      application_number: applicationNumber,
    })
    .select("id, application_number")
    .single();

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Draft saved successfully.",
    applicationId: data.id,
    applicationNumber: data.application_number,
  };
}

export async function submitApplicationAction(
  draft: LoanApplicationDraft,
): Promise<LoanApplicationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to submit an application." };
  }

  const accountBlock = await assertClientAccountAllows(user.id, "apply_loan");
  if (accountBlock) {
    return { error: accountBlock };
  }

  if (await userHasActiveLoan(user.id)) {
    return { error: ACTIVE_LOAN_BLOCK_MESSAGE };
  }

  const configResult = loanConfigurationSchema.safeParse(draft.configuration);
  if (!configResult.success) {
    return { error: configResult.error.issues[0]?.message ?? "Invalid loan configuration." };
  }

  const personalResult = personalInformationSchema.safeParse(draft.personalInfo);
  if (!personalResult.success) {
    return { error: personalResult.error.issues[0]?.message ?? "Invalid personal information." };
  }

  const financialResult = financialInformationSchema.safeParse(draft.financialInfo);
  if (!financialResult.success) {
    return { error: financialResult.error.issues[0]?.message ?? "Invalid financial information." };
  }

  const applicationNumber =
    draft.applicationNumber ?? generateApplicationNumber();

  const payload = {
    ...mapDraftToRow(draft, user.id),
    application_number: applicationNumber,
    status: "submitted" as const,
    current_step: 7,
    submitted_at: new Date().toISOString(),
  };

  if (draft.applicationId) {
    const { error } = await supabase
      .from("loan_applications")
      .update(payload)
      .eq("id", draft.applicationId)
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }

    await syncApplicationDocuments(supabase, draft.applicationId, draft.documents);
    await processApplicationSubmission(draft.applicationId);

    return {
      success: "Application submitted successfully.",
      applicationId: draft.applicationId,
      applicationNumber,
    };
  }

  const { data, error } = await supabase
    .from("loan_applications")
    .insert(payload)
    .select("id, application_number")
    .single();

  if (error) {
    return { error: error.message };
  }

  await syncApplicationDocuments(supabase, data.id, draft.documents);
  await processApplicationSubmission(data.id);

  return {
    success: "Application submitted successfully.",
    applicationId: data.id,
    applicationNumber: data.application_number,
  };
}


async function syncApplicationDocuments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  applicationId: string,
  documents: LoanApplicationDraft["documents"],
) {
  await supabase
    .from("loan_application_documents")
    .delete()
    .eq("application_id", applicationId);

  const rows = Object.values(documents).map((doc) => ({
    application_id: applicationId,
    requirement_id: doc.requirementId,
    document_name: doc.documentName,
    file_name: doc.fileName,
    file_url: doc.storagePath ?? doc.fileUrl ?? null,
  }));

  if (rows.length > 0) {
    await supabase.from("loan_application_documents").insert(rows);
  }
}
