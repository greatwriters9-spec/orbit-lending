/**
 * Validates same-origin relative redirect paths to prevent open redirects.
 */
export function sanitizeRedirectPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("\\") || trimmed.includes(":")) {
    return fallback;
  }

  return trimmed;
}
