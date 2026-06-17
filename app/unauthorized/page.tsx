import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { Button } from "@/components/ui-kit/button";
import { getSessionUser } from "@/lib/auth/actions";
import { getProfile } from "@/lib/auth/profile";
import { getDefaultRouteForRole } from "@/lib/auth/roles";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Access Denied | Orbit Mortgage",
};

export default async function UnauthorizedPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const profile = await getProfile(user.id);
  const homeHref = getDefaultRouteForRole(profile?.role);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-background px-4 py-12">
      <OrbitLogo href="/" size="sm" className="mb-8" aria-label="Orbit Mortgage home" />
      <div className="card-surface w-full max-w-md p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-brand-warning/10 text-brand-warning">
          <ShieldAlert className="size-7" strokeWidth={1.75} />
        </div>
        <h1 className="heading-primary mt-6 text-2xl">
          Access Denied
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You do not have permission to access this area. Your account is
          authorized for a different portal based on your assigned role.
        </p>
        <Button
          render={<Link href={homeHref} />}
          className="mt-8 h-11 w-full bg-brand-navy text-white hover:bg-brand-navy/90"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

