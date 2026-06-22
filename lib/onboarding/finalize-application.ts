import { scoreApplication } from "@/lib/applications/engine/processor";
import { mapMortgageDraftToLoanApplication } from "@/lib/onboarding/map-draft";
import { computePreQualification } from "@/lib/onboarding/pre-qualification";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import { generateApplicationNumber } from "@/lib/loans/wizard-config";
import { notifyAdmin } from "@/lib/notifications/notify";
import { createNotification } from "@/lib/wallet/notifications";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

export async function ensureOnboardingApplication(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined,
  draft: MortgageApplicationDraft,
): Promise<{ error?: string }> {
  const { count } = await supabase
    .from("loan_applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count > 0) {
    return {};
  }

  if (!draft.firstName || !draft.lastName) {
    return {};
  }

  const enrichedDraft: MortgageApplicationDraft = {
    ...draft,
    email: draft.email ?? email ?? "",
  };

  const preQual =
    enrichedDraft.preQualification ??
    computePreQualification(enrichedDraft, await fetchMortgageConfig());
  if (!preQual) {
    return {};
  }

  const loanDraft = mapMortgageDraftToLoanApplication(enrichedDraft, preQual);
  const applicationNumber = generateApplicationNumber();

  const { data: application, error: applicationError } = await supabase
    .from("loan_applications")
    .insert({
      user_id: userId,
      loan_product_slug: loanDraft.loanProductSlug,
      requested_amount: loanDraft.configuration.requestedAmount,
      selected_term_id: loanDraft.configuration.selectedTermId,
      purpose: loanDraft.configuration.purpose,
      status: "submitted",
      personal_info: loanDraft.personalInfo,
      financial_info: loanDraft.financialInfo,
      requirement_documents: loanDraft.documents,
      current_step: loanDraft.currentStep,
      application_number: applicationNumber,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (applicationError || !application) {
    return { error: applicationError?.message ?? "Failed to create application." };
  }

  await supabase.from("application_status_history").insert({
    application_id: application.id,
    status: "submitted",
    note: "Mortgage application submitted through Orbit Mortgage onboarding.",
    changed_by: userId,
  });

  await scoreApplication(application.id, userId);

  const applicantName =
    `${enrichedDraft.firstName ?? ""} ${enrichedDraft.lastName ?? ""}`.trim() ||
    enrichedDraft.email ||
    "Applicant";

  void notifyAdmin({
    event: "NEW_MORTGAGE_APPLICATION",
    severity: "critical",
    payload: {
      name: applicantName,
      amount: loanDraft.configuration.requestedAmount,
      applicationId: applicationNumber,
      timestamp: new Date().toISOString(),
    },
    entityType: "application",
    entityId: application.id,
    dashboardUrl: `/finance/applications/${application.id}`,
  });

  await createNotification({
    userId,
    title: "Application Submitted",
    message:
      "Your mortgage application has been submitted. Orbit Mortgage will review your information and confirm your eligible loan amount by email.",
    type: "application_update",
    metadata: {
      applicationId: application.id,
      preQualification: preQual,
    },
  });

  return {};
}
