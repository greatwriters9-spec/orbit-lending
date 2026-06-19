"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { finalizeOnboardingAction } from "@/lib/onboarding/actions";
import {
  clearMortgageApplicationDraft,
  readMortgageApplicationDraft,
} from "@/lib/onboarding/draft-storage";

export function OnboardingEmptyState() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "recovering" | "ready">(
    "checking",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = readMortgageApplicationDraft();
    const canRecover = Boolean(
      draft?.firstName &&
        draft?.lastName &&
        draft?.employment?.annualIncome &&
        (draft.completedAt || draft.creditProfile?.ssn),
    );

    if (!canRecover) {
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("recovering");

    finalizeOnboardingAction(draft!)
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.needsAccount) {
          setStatus("ready");
          return;
        }

        if (result.error) {
          setError(result.error);
          setStatus("ready");
          return;
        }

        clearMortgageApplicationDraft();
        router.refresh();
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load your pre-qualification. Try again.");
          setStatus("ready");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "checking" || status === "recovering") {
    return (
      <section className="card-surface px-6 py-12 text-center md:px-8">
        <h2 className="type-card-title text-brand-navy">Loading your pre-qualification</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          We&apos;re preparing your pre-qualification results.
        </p>
      </section>
    );
  }

  return (
    <section className="card-surface px-6 py-12 text-center md:px-8">
      <h2 className="type-card-title text-brand-navy">Start Your Mortgage Journey</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Get pre-qualified to see your buying power, mortgage estimate, funding
        instructions, and next steps on your dashboard.
      </p>
      {error ? (
        <p className="mx-auto mt-4 max-w-xl text-sm text-brand-danger">{error}</p>
      ) : null}
      <Link
        href="/get-started"
        className="mt-6 inline-flex h-11 items-center rounded-[10px] bg-brand-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
      >
        Get Pre-Qualified
      </Link>
    </section>
  );
}
