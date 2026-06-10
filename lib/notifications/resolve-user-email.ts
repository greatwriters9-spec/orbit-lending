import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * Resolves a user's email for outbound notifications.
 * Uses service role as fallback when RLS blocks cross-user reads
 * (e.g. finance officer triggering client notifications).
 */
export async function resolveUserEmail(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.email) {
    return profile.email;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  const admin = createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: adminProfile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (adminProfile?.email) {
    return adminProfile.email;
  }

  const { data: authData } = await admin.auth.admin.getUserById(userId);
  return authData.user?.email ?? null;
}
