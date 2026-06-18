import type { AuthError, User } from "@supabase/supabase-js";

export const EMAIL_ALREADY_REGISTERED_MESSAGE =
  "This email is already registered.";

function isDuplicateEmailAuthError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("user already exists") ||
    normalized.includes("email address is already") ||
    normalized.includes("email already in use")
  );
}

export function isDuplicateEmailSignUpUser(user: User | null | undefined): boolean {
  return Boolean(user && user.identities?.length === 0);
}

export function resolveSignUpError(
  user: User | null | undefined,
  error: AuthError | null,
): string | null {
  if (error) {
    return isDuplicateEmailAuthError(error.message)
      ? EMAIL_ALREADY_REGISTERED_MESSAGE
      : error.message;
  }

  if (isDuplicateEmailSignUpUser(user)) {
    return EMAIL_ALREADY_REGISTERED_MESSAGE;
  }

  return null;
}
