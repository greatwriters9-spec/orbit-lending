import { NextResponse } from "next/server";

import { getDefaultRouteForRole } from "@/lib/auth/roles";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { sanitizeRedirectPath } from "@/lib/auth/safe-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let destination = sanitizeRedirectPath(next, AUTH_ROUTES.dashboard);

      if (!next && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, first_name")
          .eq("id", user.id)
          .maybeSingle();

        destination = getDefaultRouteForRole(profile?.role);

        if (user.email_confirmed_at) {
          const { sendVerificationSuccessEmail } = await import("@/lib/email/hooks");
          void sendVerificationSuccessEmail(
            user.id,
            profile?.first_name ?? undefined,
          );
        }
      }

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}${AUTH_ROUTES.login}`);
}
