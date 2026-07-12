"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

import { AUTH_ROUTES } from "@/lib/auth/routes";
import {
  buildAuthCallbackUrl,
  registerUserWithResendVerification,
} from "@/lib/auth/resend-auth-delivery";
import { getCurrentCompanyId } from "@/lib/company/server";
import { createClient } from "@/lib/supabase/server";
import { ensureOnboardingApplication } from "@/lib/onboarding/finalize-application";
import { updateOnboardingApplication } from "@/lib/onboarding/update-application";
import { computePreQualification } from "@/lib/onboarding/pre-qualification";
import { fetchMortgageConfig } from "@/lib/admin/mortgage/config";
import {
  enrichOnboardingDraft,
  syncProfileFromOnboardingDraft,
} from "@/lib/onboarding/sync-profile";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

export type OnboardingActionState = {
  error?: string;
  success?: string;
  needsAccount?: boolean;
};

const onboardingDraftSchema = z.custom<MortgageApplicationDraft>();

const createAccountSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "You must accept the Terms and Privacy Policy.",
    }),
    draft: z.custom<MortgageApplicationDraft>(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

async function finalizePreQualificationForUser(
  userId: string,
  email: string | undefined,
  draft: MortgageApplicationDraft,
): Promise<OnboardingActionState> {
  if (!draft.preQualification) {
    const mortgageConfig = await fetchMortgageConfig();
    const preQual = computePreQualification(draft, mortgageConfig);
    if (!preQual) {
      return { error: "Unable to calculate pre-qualification. Try again." };
    }
    draft = { ...draft, preQualification: preQual };
  }

  const supabase = await createClient();
  const enrichedDraft = enrichOnboardingDraft(draft, email);

  await syncProfileFromOnboardingDraft(supabase, userId, enrichedDraft);

  const applicationResult = await ensureOnboardingApplication(
    supabase,
    userId,
    email,
    enrichedDraft,
    { mode: "pre_qualification" },
  );

  if (applicationResult.error) {
    return { error: applicationResult.error };
  }

  return {};
}

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

async function finalizeOnboardingForUser(
  userId: string,
  email: string | undefined,
  draft: MortgageApplicationDraft,
): Promise<OnboardingActionState> {
  if (!draft.firstName || !draft.lastName) {
    return { error: "Complete the onboarding questions before continuing." };
  }

  const mortgageConfig = await fetchMortgageConfig();
  const preQual =
    draft.preQualification ?? computePreQualification(draft, mortgageConfig);
  if (!preQual) {
    return { error: "Unable to calculate pre-qualification. Try again." };
  }

  const supabase = await createClient();
  const enrichedDraft = {
    ...enrichOnboardingDraft(draft, email),
    preQualification: preQual,
  };

  await syncProfileFromOnboardingDraft(supabase, userId, enrichedDraft);

  const applicationResult = await ensureOnboardingApplication(
    supabase,
    userId,
    email,
    enrichedDraft,
    { mode: "full_application" },
  );

  if (applicationResult.error) {
    return { error: applicationResult.error };
  }

  return {};
}

export async function finalizePreQualificationAction(
  draft: MortgageApplicationDraft,
): Promise<OnboardingActionState> {
  const parsed = onboardingDraftSchema.safeParse(draft);
  if (!parsed.success) {
    return { error: "Invalid assessment data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { needsAccount: true };
  }

  const result = await finalizePreQualificationForUser(
    user.id,
    user.email,
    parsed.data,
  );

  if (result.error) {
    return result;
  }

  redirect(AUTH_ROUTES.dashboard);
}

export async function finalizeOnboardingAction(
  draft: MortgageApplicationDraft,
): Promise<OnboardingActionState> {
  const parsed = onboardingDraftSchema.safeParse(draft);
  if (!parsed.success) {
    return { error: "Invalid onboarding data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { needsAccount: true };
  }

  const result = await finalizeOnboardingForUser(
    user.id,
    user.email,
    parsed.data,
  );

  if (result.error) {
    return result;
  }

  redirect(AUTH_ROUTES.qualificationResult);
}

export async function createAccountFromOnboardingAction(
  input: z.infer<typeof createAccountSchema>,
): Promise<OnboardingActionState> {
  const parsed = createAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const draft = parsed.data.draft;
  if (!draft.preQualification) {
    return { error: "Complete the buying power assessment before creating an account." };
  }

  const origin = await getOrigin();
  const supabase = await createClient();
  const emailRedirectTo = buildAuthCallbackUrl(origin);
  const companyId = await getCurrentCompanyId();

  const registration = await registerUserWithResendVerification({
    email: parsed.data.email,
    password: parsed.data.password,
    emailRedirectTo,
    metadata: {
      company_id: companyId,
      first_name: draft.firstName ?? undefined,
      last_name: draft.lastName ?? undefined,
    },
    firstName: draft.firstName ?? parsed.data.email.split("@")[0],
  });

  if (!registration.ok) {
    return { error: registration.error };
  }

  const { user, needsEmailConfirmation } = registration;

  await supabase
    .from("profiles")
    .update({
      company_id: companyId,
      first_name: draft.firstName ?? null,
      last_name: draft.lastName ?? null,
    })
    .eq("id", user.id);

  if (needsEmailConfirmation) {
    return {
      success:
        "Account created. Check your email to confirm your address, then sign in to view your pre-qualification.",
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  const userId = user.id;
  const result = await finalizePreQualificationForUser(
    userId,
    parsed.data.email,
    {
      ...draft,
      email: parsed.data.email,
      completedAt: new Date().toISOString(),
    },
  );

  if (result.error) {
    return { error: result.error };
  }

  redirect(AUTH_ROUTES.dashboard);
}

export async function updateApplicationFromOnboardingAction(
  applicationId: string,
  draft: MortgageApplicationDraft,
): Promise<OnboardingActionState> {
  const parsed = onboardingDraftSchema.safeParse(draft);
  if (!parsed.success) {
    return { error: "Invalid application data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update your application." };
  }

  await syncProfileFromOnboardingDraft(
    supabase,
    user.id,
    enrichOnboardingDraft(parsed.data, user.email),
  );

  const result = await updateOnboardingApplication(
    supabase,
    user.id,
    applicationId,
    user.email,
    parsed.data,
  );

  if (result.error) {
    return { error: result.error };
  }

  redirect(`/dashboard/loans/${applicationId}`);
}
