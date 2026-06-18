export async function register() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  // Local dev on some Windows setups cannot verify Supabase TLS certificates.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
