import { AUTH_ROUTES } from "@/lib/auth/routes";
import { sendBrandedAuthEmail } from "@/lib/auth/auth-email-delivery";
import {
  EMAIL_ALREADY_REGISTERED_MESSAGE,
  isDuplicateEmailSignUpUser,
  resolveSignUpError,
} from "@/lib/auth/sign-up";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { User } from "@supabase/supabase-js";

type RegisterWithResendInput = {
  email: string;
  password: string;
  emailRedirectTo: string;
  metadata?: Record<string, string | undefined>;
  firstName?: string;
};

export type RegisterWithResendResult =
  | {
      ok: true;
      user: User;
      needsEmailConfirmation: boolean;
    }
  | { ok: false; error: string };

function isMissingUserError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("user not found") ||
    normalized.includes("no user found") ||
    normalized.includes("not able to find")
  );
}

export async function registerUserWithResendVerification(
  input: RegisterWithResendInput,
): Promise<RegisterWithResendResult> {
  const admin = createServiceRoleClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email: input.email,
    password: input.password,
    options: {
      redirectTo: input.emailRedirectTo,
      data: input.metadata,
    },
  });

  const signUpError = resolveSignUpError(data?.user, error);
  if (signUpError) {
    return { ok: false, error: signUpError };
  }

  if (!data?.user) {
    return { ok: false, error: "Account could not be created. Please try again." };
  }

  if (isDuplicateEmailSignUpUser(data.user)) {
    return { ok: false, error: EMAIL_ALREADY_REGISTERED_MESSAGE };
  }

  const verifyUrl = data.properties?.action_link;
  if (!verifyUrl) {
    return {
      ok: false,
      error: "Account was created but the verification link could not be generated.",
    };
  }

  const emailResult = await sendBrandedAuthEmail({
    userId: data.user.id,
    recipient: input.email,
    actionType: "signup",
    actionUrl: verifyUrl,
    firstName: input.firstName,
    metadata: { source: "register_action" },
  });

  if (!emailResult.ok) {
    console.error("[registerUserWithResendVerification] Verification email failed:", {
      userId: data.user.id,
      email: input.email,
      error: emailResult.error,
    });
    return {
      ok: false,
      error:
        "Your account was created, but we couldn't send the verification email. Please contact support.",
    };
  }

  return {
    ok: true,
    user: data.user,
    needsEmailConfirmation: !data.user.email_confirmed_at,
  };
}

export async function sendPasswordResetViaResend(input: {
  email: string;
  redirectTo: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createServiceRoleClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: input.email,
    options: {
      redirectTo: input.redirectTo,
    },
  });

  if (error) {
    if (isMissingUserError(error.message)) {
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  const resetUrl = data.properties?.action_link;
  if (!resetUrl) {
    return { ok: true };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, first_name")
    .eq("email", input.email)
    .maybeSingle();

  const emailResult = await sendBrandedAuthEmail({
    userId: (profile?.id as string | undefined) ?? data.user?.id,
    recipient: input.email,
    actionType: "recovery",
    actionUrl: resetUrl,
    firstName:
      typeof profile?.first_name === "string" ? profile.first_name : undefined,
    metadata: { source: "forgot_password_action" },
  });

  if (!emailResult.ok) {
    console.error("[sendPasswordResetViaResend] Reset email failed:", {
      email: input.email,
      error: emailResult.error,
    });
    return { ok: false, error: "Unable to send password reset email. Try again." };
  }

  return { ok: true };
}

export function buildAuthCallbackUrl(origin: string, nextPath?: string): string {
  if (!nextPath) {
    return `${origin}${AUTH_ROUTES.callback}`;
  }

  const params = new URLSearchParams({ next: nextPath });
  return `${origin}${AUTH_ROUTES.callback}?${params.toString()}`;
}
