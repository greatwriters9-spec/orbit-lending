"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getDefaultRouteForRole } from "@/lib/auth/roles";
import {
  forgotPasswordSchema,
  loginSchema,
  profileCompletionSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas";
import { validateCityForState } from "@/lib/auth/validate-city";
import { resolveSignUpError } from "@/lib/auth/sign-up";
import { ensureOnboardingApplication } from "@/lib/onboarding/finalize-application";
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
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  const redirectTo =
    formData.get("redirect")?.toString() ||
    getDefaultRouteForRole(profile?.role);

  if (user) {
    const { notifySecurityEvent } = await import("@/lib/notifications/service");
    await notifySecurityEvent(
      user.id,
      "New Login Detected",
      "Your Orbit Mortgage account was accessed. If this wasn't you, contact support immediately.",
    );
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

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        middle_name: parsed.data.middleNameInitial,
        last_name: parsed.data.lastName,
      },
      emailRedirectTo: `${origin}${AUTH_ROUTES.callback}`,
    },
  });

  const signUpError = resolveSignUpError(data.user, error);
  if (signUpError) {
    return { error: signUpError };
  }

  if (!data.user) {
    return { error: "Account could not be created. Please try again." };
  }
  await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      middle_name: parsed.data.middleNameInitial ?? null,
      last_name: parsed.data.lastName,
    })
    .eq("id", data.user.id);

  if (!data.session) {
    return {
      success:
        "Account created. Check your email to confirm your address, then sign in.",
    };
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
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}${AUTH_ROUTES.callback}?next=${AUTH_ROUTES.resetPassword}`,
  });

  if (error) {
    return { error: error.message };
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
      return { error: "Could not apply your onboarding answers. Try again." };
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (createdOnboardingApplication) {
    redirect(AUTH_ROUTES.qualificationResult);
  }

  redirect(getDefaultRouteForRole(profile?.role));
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

