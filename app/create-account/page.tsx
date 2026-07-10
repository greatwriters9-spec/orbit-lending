"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { createAccountFromOnboardingAction } from "@/lib/onboarding/actions";
import { EMAIL_ALREADY_REGISTERED_MESSAGE } from "@/lib/auth/sign-up";
import { readMortgageApplicationDraft } from "@/lib/onboarding/draft-storage";
import { ONBOARDING_ROUTES } from "@/types/mortgage-onboarding";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui-kit/button";
import { OrbitLogo } from "@/components/brand/orbit-logo";
import { onboardingInputClassName } from "@/components/onboarding/onboarding-shell";

export default function CreateAccountPage() {
  const [draft, setDraft] = useState<MortgageApplicationDraft | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = readMortgageApplicationDraft();
    if (!stored?.preQualification) {
      window.location.href = ONBOARDING_ROUTES.getStarted;
      return;
    }
    setDraft(stored);
    if (stored.email) {
      setEmail(stored.email);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft?.preQualification) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createAccountFromOnboardingAction({
        email,
        password,
        confirmPassword,
        acceptTerms,
        draft: { ...draft, email },
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success) {
        setSuccess(result.success);
        return;
      }
    });
  };

  if (!draft) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-[72px] max-w-lg items-center px-4 md:px-6">
          <OrbitLogo href="/" size="sm" aria-label="Orbit Mortgage home" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 pb-16 md:px-6 md:py-16">
        <div className="card-surface p-6 md:p-10">
          <h1 className="heading-primary text-3xl md:text-4xl">
            Create Your Orbit Mortgage Account
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
            Your estimated buying power will be securely saved to your account so
            you can continue your mortgage journey at any time.
          </p>

          {error ? (
            <div className="mt-6 rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
              <p>{error}</p>
              {error === EMAIL_ALREADY_REGISTERED_MESSAGE ? (
                <Link
                  href="/login"
                  className="mt-2 inline-block font-semibold text-brand-blue hover:text-brand-blue/80"
                >
                  Sign in instead
                </Link>
              ) : null}
            </div>
          ) : null}

          {success ? (
            <div className="mt-6 space-y-4 rounded-xl border border-brand-success/20 bg-brand-success/5 px-4 py-4 text-sm text-brand-navy">
              <p>{success}</p>
              <Link
                href="/login"
                className="font-semibold text-brand-blue hover:text-brand-blue/80"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block space-y-3">
                <span className="text-base font-semibold text-brand-navy md:text-lg">
                  Email Address
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={onboardingInputClassName()}
                  autoComplete="email"
                />
              </label>

              <label className="block space-y-3">
                <span className="text-base font-semibold text-brand-navy md:text-lg">
                  Password
                </span>
                <PasswordInput
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={onboardingInputClassName()}
                  autoComplete="new-password"
                />
              </label>

              <label className="block space-y-3">
                <span className="text-base font-semibold text-brand-navy md:text-lg">
                  Confirm Password
                </span>
                <PasswordInput
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={onboardingInputClassName()}
                  autoComplete="new-password"
                />
              </label>

              <label className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="mt-1 size-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-sm leading-relaxed text-muted-foreground">
                  I accept the{" "}
                  <Link href="/terms" className="font-semibold text-brand-blue hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-semibold text-brand-blue hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <Button
                type="submit"
                disabled={isPending || !acceptTerms}
                className="h-14 w-full rounded-xl bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue/90 md:text-lg"
              >
                {isPending ? "Creating Account..." : "Create My Account"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
