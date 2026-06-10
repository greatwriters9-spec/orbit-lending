import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui-kit/button";
import { ACCOUNT_STATUS_LABELS } from "@/lib/auth/account-status";
import { getSessionUser } from "@/lib/auth/actions";
import { getProfile } from "@/lib/auth/profile";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import type { AccountStatus } from "@/types/profile";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Account Status | Orbit Lending",
};

export default async function AccountStatusPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const profile = await getProfile(user.id);
  const status = (profile?.account_status ?? "active") as AccountStatus;

  if (status === "active") {
    redirect(AUTH_ROUTES.dashboard);
  }

  const reason = profile?.account_status_reason;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-background px-4 py-12">
      <div className="card-surface w-full max-w-lg p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-brand-warning/10 text-brand-warning">
          <AlertTriangle className="size-7" strokeWidth={1.75} />
        </div>
        <h1 className="heading-primary mt-6 text-center text-2xl">
          Account {ACCOUNT_STATUS_LABELS[status]}
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
          {status === "suspended"
            ? "Your Orbit Lending account has been suspended. Platform access is restricted until this matter is resolved."
            : status === "closed"
              ? "Your Orbit Lending account has been closed. No further activity is permitted on this account."
              : "Your account access is currently limited."}
        </p>
        {reason ? (
          <div className="mt-6 rounded-lg border border-brand-border bg-brand-background/60 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-semibold text-brand-navy">Reason provided</p>
            <p className="mt-1">{reason}</p>
          </div>
        ) : null}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Questions? Contact{" "}
          <Link href="mailto:support@orbitlending.com" className="text-brand-blue">
            support@orbitlending.com
          </Link>
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            render={<Link href="mailto:support@orbitlending.com" />}
            className="h-11 w-full bg-brand-navy text-white hover:bg-brand-navy/90"
          >
            Contact Support
          </Button>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
