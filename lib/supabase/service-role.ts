import { createClient } from "@supabase/supabase-js";

import { requireEnv } from "@/lib/env";

/**
 * Server-only Supabase client that bypasses RLS.
 * Use only after verifying staff permissions in server actions.
 */
export function createServiceRoleClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
