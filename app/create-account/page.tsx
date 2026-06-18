"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import {
  AskAssistantButton,
  OnboardingFooter,
  OnboardingStepFaq,
  OnboardingTestimonials,
} from "@/components/onboarding/onboarding-chrome";
import { createAccountFromOnboardingAction } from "@/lib/onboarding/actions";
import {
  readMortgageApplicationDraft,
} from "@/lib/onboarding/draft-storage";
import { ONBOARDING_ROUTES } from "@/types/mortgage-onboarding";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui-kit/button";
import { OrbitLogo } from "@/components/brand/orbit-logo";
import { onboardingInputClassName } from "@/components/onboarding/onboarding-shell";

export default function CreateAccountPage() {
  const [draft, setDraft] = useState<MortgageApplicationDraft | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = readMortgageApplicationDraft();
    if (!stored?.email) {
      window.location.href = ONBOARDING_ROUTES.getStarted;
      return;
    }
    setDraft(stored);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft?.email) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createAccountFromOnboardingAction({
        email: draft.email!,
        password,
        confirmPassword,
        draft,
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

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 pb-36 md:px-6 md:py-16 md:pb-40">
        <div className="card-surface p-6 md:p-10">
          <h1 className="heading-primary text-3xl md:text-4xl">
            Create Your Orbit Mortgage Account
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
            Your pre-qualification answers are saved. Create a password to view
            your results.
          </p>

          {error ? (
            <div className="mt-6 rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
              {error}
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
                  readOnly
                  value={draft.email ?? ""}
                  className={`${onboardingInputClassName()} bg-[#F8FAFC] text-muted-foreground`}
                />
              </label>

              <label className="block space-y-3">
                <span className="text-base font-semibold text-brand-navy md:text-lg">Password</span>
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

              <Button
                type="submit"
                disabled={isPending}
                className="h-14 w-full rounded-xl bg-brand-blue text-base font-semibold text-white hover:bg-brand-blue/90 md:text-lg"
              >
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}
        </div>

        <OnboardingStepFaq stepKey="create-account" />
        <OnboardingTestimonials step={12} />
      </main>

      <AskAssistantButton
        className="bottom-[4.75rem] md:bottom-[5rem]"
        source="create-account"
      />
      <OnboardingFooter />
    </div>
  );
}
