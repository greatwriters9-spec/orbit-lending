import { type NextRequest, NextResponse } from "next/server";

import { resolveCompanyIdForMiddleware } from "@/lib/company/middleware-resolve";
import { updateSession } from "@/lib/supabase/middleware";
import { COMPANY_COOKIE_NAME } from "@/types/company";

function attachCompanyContext(response: NextResponse, companyId: string) {
  response.cookies.set(COMPANY_COOKIE_NAME, companyId, {
    path: "/",
    sameSite: "lax",
  });
  response.headers.set("x-company-id", companyId);
  return response;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "localhost";
  const companyId = await resolveCompanyIdForMiddleware(host);
  const response = await updateSession(request);
  return attachCompanyContext(response, companyId);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
