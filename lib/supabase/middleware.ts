import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { requireEnv } from "@/lib/env";
import {
  canAccessAdminPortal,
  canAccessFinancePortal,
  canAccessSuperAdminPortal,
} from "@/lib/auth/navigation";
import { requiresAccountStatusPage } from "@/lib/auth/account-status";
import { getDefaultRouteForRole, USER_ROLES } from "@/lib/auth/roles";
import {
  ADMIN_PREFIXES,
  AUTH_PREFIXES,
  AUTH_ROUTES,
  FINANCE_PREFIXES,
  PROTECTED_PREFIXES,
  SUPER_ADMIN_PREFIXES,
} from "@/lib/auth/routes";

function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

async function getUserProfile(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", userId)
    .maybeSingle();

  return {
    role: data?.role ?? "client",
    accountStatus: data?.account_status ?? "active",
  };
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = matchesPrefix(pathname, PROTECTED_PREFIXES);
  const isAuthRoute = matchesPrefix(pathname, AUTH_PREFIXES);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { role, accountStatus } = await getUserProfile(supabase, user.id);

    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = getDefaultRouteForRole(role);
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (
      role === USER_ROLES.client &&
      requiresAccountStatusPage(accountStatus) &&
      pathname !== AUTH_ROUTES.accountStatus &&
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/wallet") ||
        pathname.startsWith("/loans"))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = AUTH_ROUTES.accountStatus;
      return NextResponse.redirect(url);
    }

    if (
      matchesPrefix(pathname, FINANCE_PREFIXES) &&
      !canAccessFinancePortal(role)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = getDefaultRouteForRole(role);
      return NextResponse.redirect(url);
    }

    if (
      matchesPrefix(pathname, ADMIN_PREFIXES) &&
      !canAccessAdminPortal(role)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = getDefaultRouteForRole(role);
      return NextResponse.redirect(url);
    }

    if (
      matchesPrefix(pathname, SUPER_ADMIN_PREFIXES) &&
      !canAccessSuperAdminPortal(role)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = getDefaultRouteForRole(role);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
