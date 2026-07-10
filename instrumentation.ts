export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  // Local Windows setups may fail Supabase TLS verification without system CAs.
  // Prefer `node --use-system-ca` in npm scripts; keep this as a dev fallback.
  if (process.env.NODE_ENV === "development") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }
}
