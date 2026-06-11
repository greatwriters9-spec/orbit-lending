/**
 * Normalize env vars copied into Vercel/Supabase dashboards.
 * Trailing newlines or surrounding quotes break HTTP Authorization headers.
 */
export function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

export function requireEnv(name: string): string {
  const value = cleanEnv(process.env[name]);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
