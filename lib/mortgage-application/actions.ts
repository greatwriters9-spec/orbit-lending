"use server";

import { redirect } from "next/navigation";

import { canClientEditApplication } from "@/lib/applications/client-edit";
import { processApplicationSubmission } from "@/lib/applications/engine/processor";
import { notifyAdmin } from "@/lib/notifications/notify";
import { extractPreQualification } from "@/lib/onboarding/parse-application";
import { syncProfileFromOnboardingDraft } from "@/lib/onboarding/sync-profile";
import { mapFullApplicationToDbPayload } from "@/lib/mortgage-application/map-to-db";
import { generateDocumentChecklist } from "@/lib/mortgage-application/document-checklist";
import { resolveBrandingForUserId } from "@/lib/company/resolve-branding";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/wallet/notifications";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import {
  type ApplicationSectionKey,
  type FullMortgageApplication,
} from "@/types/mortgage-full-application";
import type { ApplicationStatus } from "@/types/application-details";

export type MortgageApplicationActionState = {
  error?: string;
  savedAt?: string;
};

async function loadOwnedApplication(applicationId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return { error: "Application not found.", application: null, supabase };
  }

  return { error: null, application: data, supabase };
}

export async function saveMortgageApplicationAction(
  applicationId: string,
  application: FullMortgageApplication,
  completedSection?: ApplicationSectionKey,
): Promise<MortgageApplicationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error, application: existing } = await loadOwnedApplication(
    applicationId,
    user.id,
  );
  if (error || !existing) {
    return { error: error ?? "Application not found." };
  }

  const status = existing.status as ApplicationStatus;
  if (status !== "pre_qualified" && !canClientEditApplication(status)) {
    return { error: "This application can no longer be edited." };
  }

  if (application.progress.locked) {
    return { error: "This application has been submitted and is locked." };
  }

  const personalInfo = (existing.personal_info ?? {}) as Record<string, unknown>;
  const preQualification = extractPreQualification(personalInfo);

  const nextApplication: FullMortgageApplication = {
    ...application,
    progress: {
      ...application.progress,
      lastSavedAt: new Date().toISOString(),
      completedSections: completedSection
        ? Array.from(
            new Set([...application.progress.completedSections, completedSection]),
          )
        : application.progress.completedSections,
    },
    documentChecklist:
      application.documentChecklist.length > 0
        ? application.documentChecklist
        : generateDocumentChecklist(application),
  };

  const branding = await resolveBrandingForUserId(user.id);

  const payload = mapFullApplicationToDbPayload({
    application: nextApplication,
    preQualification,
    existingPersonalInfo: personalInfo,
    institutionName: branding.institutionName,
  });

  const { error: updateError } = await supabase
    .from("loan_applications")
    .update({
      personal_info: payload.personalInfo,
      financial_info: payload.financialInfo,
      requested_amount: payload.requestedAmount,
      selected_term_id: payload.selectedTermId ?? existing.selected_term_id,
      loan_product_slug: payload.loanProductSlug ?? existing.loan_product_slug,
      purpose: payload.purpose,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateError) {
    return { error: updateError.message };
  }

  await syncProfileFromOnboardingDraft(supabase, user.id, {
    firstName: nextApplication.personal.firstName,
    middleName: nextApplication.personal.middleName,
    lastName: nextApplication.personal.lastName,
    email: nextApplication.personal.email,
    phone: nextApplication.personal.phone,
    dateOfBirth: nextApplication.personal.dateOfBirth,
    address: {
      street: nextApplication.residence.current.street,
      city: nextApplication.residence.current.city,
      state: nextApplication.residence.current.state,
      zip: nextApplication.residence.current.zip,
      yearsAtAddress: nextApplication.residence.current.moveInDate,
    },
    targetLocation: {
      city: nextApplication.property.city,
      state: nextApplication.property.state,
      zip: nextApplication.property.zip,
    },
  });

  return { savedAt: nextApplication.progress.lastSavedAt };
}

export async function submitMortgageApplicationAction(
  applicationId: string,
  application: FullMortgageApplication,
): Promise<MortgageApplicationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error, application: existing } = await loadOwnedApplication(
    applicationId,
    user.id,
  );
  if (error || !existing) {
    return { error: error ?? "Application not found." };
  }

  if (existing.status !== "pre_qualified") {
    return { error: "This application has already been submitted." };
  }

  const requiredConsents = [
    application.consents.identityVerification,
    application.consents.creditAuthorization,
    application.consents.employmentVerification,
    application.consents.incomeVerification,
    application.consents.assetVerification,
    application.consents.fraudPrevention,
    application.consents.electronicConsent,
    application.consents.privacyPolicy,
    application.consents.termsOfService,
  ];

  if (!requiredConsents.every(Boolean)) {
    return { error: "Please acknowledge all required authorizations." };
  }

  if (!application.personal.firstName || !application.personal.lastName) {
    return { error: "Complete your personal information before submitting." };
  }

  if (
    !application.signature.value.trim() ||
    !application.signature.method ||
    !application.signature.signedAt
  ) {
    return { error: "Please provide your electronic signature before submitting." };
  }

  for (const key of [
    "bankruptcy",
    "foreclosure",
    "judgments",
    "lawsuits",
    "coSigner",
    "otherPropertyOwnership",
  ] as const) {
    if (application.declarations[key] === null) {
      return { error: "Please answer all declaration questions before submitting." };
    }
  }

  const personalInfo = (existing.personal_info ?? {}) as Record<string, unknown>;
  const preQualification = extractPreQualification(personalInfo);
  const submittedAt = new Date().toISOString();

  const finalApplication: FullMortgageApplication = {
    ...application,
    documentChecklist: generateDocumentChecklist(application),
    consents: {
      ...application.consents,
      acknowledgedAt: submittedAt,
    },
    progress: {
      ...application.progress,
      locked: true,
      completedSections: [
        "personal",
        "residence",
        "employment",
        "income",
        "assets",
        "liabilities",
        "property",
        "loan-details",
        "declarations",
        "documents",
        "review",
        "e-sign",
        "consent",
      ],
      lastSavedAt: submittedAt,
    },
  };

  const payload = mapFullApplicationToDbPayload({
    application: finalApplication,
    preQualification,
    existingPersonalInfo: personalInfo,
  });

  const { error: updateError } = await supabase
    .from("loan_applications")
    .update({
      status: "submitted",
      submitted_at: submittedAt,
      personal_info: payload.personalInfo,
      financial_info: payload.financialInfo,
      requested_amount: payload.requestedAmount,
      selected_term_id: payload.selectedTermId ?? existing.selected_term_id,
      loan_product_slug: payload.loanProductSlug ?? existing.loan_product_slug,
      purpose: payload.purpose,
      current_step: 7,
      updated_at: submittedAt,
    })
    .eq("id", applicationId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status: "submitted",
    note: "Full mortgage application submitted by applicant.",
    changed_by: user.id,
  });

  await processApplicationSubmission(applicationId);

  const applicantName =
    `${finalApplication.personal.firstName} ${finalApplication.personal.lastName}`.trim();

  void notifyAdmin({
    event: "NEW_MORTGAGE_APPLICATION",
    severity: "critical",
    payload: {
      name: applicantName,
      amount: payload.requestedAmount,
      applicationId: existing.application_number,
      timestamp: submittedAt,
    },
    entityType: "application",
    entityId: applicationId,
    dashboardUrl: `/finance/applications/${applicationId}`,
  });

  await createNotification({
    userId: user.id,
    title: "Application Submitted",
    message:
      "Your mortgage application has been submitted. Our processing team will begin reviewing your information.",
    type: "application_update",
    metadata: {
      applicationId,
      applicationNumber: existing.application_number,
    },
  });

  redirect(AUTH_ROUTES.dashboard);
}

export async function assertMortgageApplicationAccess(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const { error, application } = await loadOwnedApplication(applicationId, user.id);
  if (error || !application) {
    redirect(AUTH_ROUTES.dashboard);
  }

  return { user, application };
}
