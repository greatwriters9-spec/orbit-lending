import { canClientEditApplication } from "@/lib/applications/client-edit";
import { scoreApplication } from "@/lib/applications/engine/processor";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import { companyToBrandingConfig } from "@/lib/company/branding";
import { fetchCompanyById } from "@/lib/company/queries";
import { getCurrentCompany } from "@/lib/company/server";
import { mapMortgageDraftToLoanApplication } from "@/lib/onboarding/map-draft";
import { computePreQualification } from "@/lib/onboarding/pre-qualification";
import { enrichOnboardingDraft } from "@/lib/onboarding/sync-profile";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationStatus } from "@/types/application-details";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

export async function updateOnboardingApplication(
  supabase: SupabaseClient,
  userId: string,
  applicationId: string,
  email: string | undefined,
  draft: MortgageApplicationDraft,
): Promise<{ error?: string }> {
  const { data: existing } = await supabase
    .from("loan_applications")
    .select("id, user_id, status, personal_info")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    return { error: "Application not found." };
  }

  const status = existing.status as ApplicationStatus;
  if (!canClientEditApplication(status)) {
    return {
      error: "This application can no longer be edited.",
    };
  }

  if (!draft.firstName || !draft.lastName) {
    return { error: "Complete the application questions before saving." };
  }

  const mortgageConfig = await fetchMortgageConfig();
  const preQual =
    draft.preQualification ?? computePreQualification(draft, mortgageConfig);
  if (!preQual) {
    return { error: "Unable to calculate pre-qualification. Try again." };
  }

  const enrichedDraft = {
    ...enrichOnboardingDraft(draft, email),
    preQualification: preQual,
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();

  const company =
    (profile?.company_id
      ? await fetchCompanyById(profile.company_id)
      : null) ?? (await getCurrentCompany());
  const institutionName = companyToBrandingConfig(company).institutionName;

  const loanDraft = mapMortgageDraftToLoanApplication(enrichedDraft, preQual, {
    institutionName,
  });
  const existingPersonalInfo = (existing.personal_info ?? {}) as Record<
    string,
    unknown
  >;

  const personalInfo = {
    ...loanDraft.personalInfo,
    ...(existingPersonalInfo.downPayment
      ? { downPayment: existingPersonalInfo.downPayment }
      : {}),
  };

  const { error: updateError } = await supabase
    .from("loan_applications")
    .update({
      loan_product_slug: loanDraft.loanProductSlug,
      requested_amount: loanDraft.configuration.requestedAmount,
      selected_term_id: loanDraft.configuration.selectedTermId,
      purpose: loanDraft.configuration.purpose,
      personal_info: personalInfo,
      financial_info: loanDraft.financialInfo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateError) {
    return { error: updateError.message };
  }

  await scoreApplication(applicationId, userId);

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status,
    note: "Applicant updated application details.",
    changed_by: userId,
  });

  return {};
}
