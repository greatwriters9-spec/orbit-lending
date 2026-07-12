"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getDefaultRouteForRole, isAdminStaff, isFinanceStaff } from "@/lib/auth/roles";
import { sanitizeRedirectPath } from "@/lib/auth/safe-redirect";
import {
  forgotPasswordSchema,
  loginSchema,
  profileCompletionSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas";
import { validateCityForState } from "@/lib/auth/validate-city";
import {
  buildAuthCallbackUrl,
  registerUserWithResendVerification,
  sendPasswordResetViaResend,
} from "@/lib/auth/resend-auth-delivery";
import { ensureOnboardingApplication } from "@/lib/onboarding/finalize-application";
import { getCurrentCompanyId } from "@/lib/company/server";
import { notifyAdmin } from "@/lib/notifications/notify";
import { createClient } from "@/lib/supabase/server";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

export type AuthActionState = {
  error?: string;
  success?: string;
};

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role, first_name, last_name, email").eq("id", user.id).maybeSingle()
    : { data: null };

  const redirectTo = sanitizeRedirectPath(
    formData.get("redirect")?.toString(),
    getDefaultRouteForRole(profile?.role),
  );

  if (user) {
    const { notifySecurityEvent } = await import("@/lib/notifications/service");
    const { resolveBrandingForUserId } = await import(
      "@/lib/company/resolve-branding"
    );
    const branding = await resolveBrandingForUserId(user.id);
    await notifySecurityEvent(
      user.id,
      "New Login Detected",
      `Your ${branding.institutionName} account was accessed. If this wasn't you, contact support immediately.`,
    );

    if (isAdminStaff(profile?.role) || isFinanceStaff(profile?.role)) {
      const staffName =
        `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
        profile?.email ||
        user.email ||
        "Staff";
      void notifyAdmin({
        event: "ADMIN_LOGIN",
        payload: {
          name: staffName,
          email: profile?.email ?? user.email,
        },
        entityType: "user",
        entityId: user.id,
        dashboardUrl: getDefaultRouteForRole(profile?.role),
      });
    }
  }

  redirect(redirectTo);
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    middleNameInitial: formData.get("middleNameInitial") || undefined,
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
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
      first_name: parsed.data.firstName,
      middle_name: parsed.data.middleNameInitial,
      last_name: parsed.data.lastName,
      company_id: companyId,
    },
    firstName: parsed.data.firstName,
  });

  if (!registration.ok) {
    return { error: registration.error };
  }

  const { user, needsEmailConfirmation } = registration;

  await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      middle_name: parsed.data.middleNameInitial ?? null,
      last_name: parsed.data.lastName,
      company_id: companyId,
    })
    .eq("id", user.id);

  void notifyAdmin({
    event: "NEW_USER_REGISTRATION",
    severity: "critical",
    payload: {
      name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
      email: parsed.data.email,
      timestamp: new Date().toISOString(),
    },
    entityType: "user",
    entityId: user.id,
    dashboardUrl: "/admin/users",
  });

  if (needsEmailConfirmation) {
    return {
      success:
        "Account created. Check your email to confirm your address, then sign in.",
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  redirect(AUTH_ROUTES.profileComplete);
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const origin = await getOrigin();
  const redirectTo = buildAuthCallbackUrl(origin, AUTH_ROUTES.resetPassword);

  const resetResult = await sendPasswordResetViaResend({
    email: parsed.data.email,
    redirectTo,
  });

  if (!resetResult.ok) {
    return { error: resetResult.error };
  }

  return {
    success: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(AUTH_ROUTES.login);
}

export async function completeProfileAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = profileCompletionSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    state: formData.get("state"),
    city: formData.get("city"),
    address: formData.get("address"),
    zipCode: formData.get("zipCode"),
    dateOfBirth: formData.get("dateOfBirth"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const cityError = validateCityForState(parsed.data.state, parsed.data.city);
  if (cityError) {
    return { error: cityError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to complete your profile." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone,
      country: parsed.data.country,
      state: parsed.data.state,
      city: parsed.data.city,
      address: parsed.data.address,
      zip_code: parsed.data.zipCode,
      date_of_birth: parsed.data.dateOfBirth,
      profile_status: "complete",
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  const draftRaw = formData.get("onboardingDraft")?.toString();
  let createdOnboardingApplication = false;

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("company_id, role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileRow?.company_id) {
    const companyId = await getCurrentCompanyId();
    await supabase
      .from("profiles")
      .update({ company_id: companyId })
      .eq("id", user.id);
  }

  if (draftRaw) {
    try {
      const draft = JSON.parse(draftRaw) as MortgageApplicationDraft;
      const applicationResult = await ensureOnboardingApplication(
        supabase,
        user.id,
        user.email,
        draft,
      );
      if (applicationResult.error) {
        return { error: applicationResult.error };
      }
      createdOnboardingApplication = true;
    } catch {
      return { error: "We couldn't save your information. Please try again." };
    }
  }

  void notifyAdmin({
    event: "PROFILE_COMPLETED",
    payload: {
      name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
      email: profileRow?.email ?? user.email,
    },
    entityType: "user",
    entityId: user.id,
    dashboardUrl: "/admin/users",
  });

  if (createdOnboardingApplication) {
    redirect(AUTH_ROUTES.qualificationResult);
  }

  redirect(getDefaultRouteForRole(profileRow?.role));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(AUTH_ROUTES.login);
}

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

