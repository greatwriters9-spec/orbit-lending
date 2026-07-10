import { sendPreQualifiedNoticeEmail } from "@/lib/email/hooks";
import { mapMortgageDraftToLoanApplication } from "@/lib/onboarding/map-draft";
import { computePreQualification } from "@/lib/onboarding/pre-qualification";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import { generateApplicationNumber } from "@/lib/loans/wizard-config";
import { notifyAdmin } from "@/lib/notifications/notify";
import { createNotification } from "@/lib/wallet/notifications";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

type EnsureApplicationOptions = {
  mode?: "pre_qualification" | "full_application";
};

export async function ensureOnboardingApplication(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined,
  draft: MortgageApplicationDraft,
  options: EnsureApplicationOptions = {},
): Promise<{ error?: string }> {
  const mode = options.mode ?? "pre_qualification";

  const { count } = await supabase
    .from("loan_applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count > 0) {
    return {};
  }

  if (mode === "full_application" && (!draft.firstName || !draft.lastName)) {
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
  const isPreQualification = mode === "pre_qualification";
  const status = isPreQualification ? "pre_qualified" : "submitted";

  const { data: application, error: applicationError } = await supabase
    .from("loan_applications")
    .insert({
      user_id: userId,
      loan_product_slug: loanDraft.loanProductSlug,
      requested_amount: loanDraft.configuration.requestedAmount,
      selected_term_id: loanDraft.configuration.selectedTermId,
      purpose: loanDraft.configuration.purpose,
      status,
      personal_info: loanDraft.personalInfo,
      financial_info: loanDraft.financialInfo,
      requirement_documents: loanDraft.documents,
      current_step: loanDraft.currentStep,
      application_number: applicationNumber,
      submitted_at: isPreQualification ? null : new Date().toISOString(),
    })
    .select("id")
    .single();

  if (applicationError || !application) {
    return { error: applicationError?.message ?? "Failed to create application." };
  }

  await supabase.from("application_status_history").insert({
    application_id: application.id,
    status,
    note: isPreQualification
      ? "Buying power assessment completed through Orbit Mortgage pre-qualification."
      : "Mortgage application submitted through Orbit Mortgage onboarding.",
    changed_by: userId,
  });

  const applicantName =
    `${enrichedDraft.firstName ?? ""} ${enrichedDraft.lastName ?? ""}`.trim() ||
    enrichedDraft.email?.split("@")[0] ||
    "Applicant";

  if (isPreQualification) {
    await createNotification({
      userId,
      title: "Pre-Qualification Complete",
      message:
        "Your estimated buying power has been saved. Complete your mortgage application when you're ready to move forward.",
      type: "application_update",
      metadata: {
        applicationId: application.id,
        preQualification: preQual,
      },
    });

    void sendPreQualifiedNoticeEmail(userId, {
      mortgageAmount: preQual.estimatedMortgageAmount,
      maxHomePrice: preQual.maximumHomePrice,
      actionUrl: "/dashboard",
    });

    return {};
  }

  const { scoreApplication } = await import("@/lib/applications/engine/processor");
  await scoreApplication(application.id, userId);

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
