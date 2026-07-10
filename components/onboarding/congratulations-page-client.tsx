"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { CongratulationsScreen } from "@/components/onboarding/congratulations-screen";
import { finalizePreQualificationAction } from "@/lib/onboarding/actions";
import { readMortgageApplicationDraft } from "@/lib/onboarding/draft-storage";
import { ONBOARDING_ROUTES } from "@/types/mortgage-onboarding";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";

type CongratulationsPageClientProps = {
  isLoggedIn: boolean;
};

export function CongratulationsPageClient({
  isLoggedIn,
}: CongratulationsPageClientProps) {
  const router = useRouter();
  const [preQual, setPreQual] = useState<PreQualificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const draft = readMortgageApplicationDraft();
    if (!draft?.preQualification) {
      router.replace(ONBOARDING_ROUTES.getStarted);
      return;
    }
    setPreQual(draft.preQualification);
  }, [router]);

  const handleContinueLoggedIn = () => {
    const draft = readMortgageApplicationDraft();
    if (!draft) {
      router.replace(ONBOARDING_ROUTES.getStarted);
      return;
    }

    startTransition(async () => {
      const result = await finalizePreQualificationAction(draft);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
    });
  };

  if (!preQual) {
    return null;
  }

  return (
    <>
      {error ? (
        <p className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-brand-danger/20 bg-white px-4 py-2 text-sm text-brand-danger">
          {error}
        </p>
      ) : null}
      <CongratulationsScreen
        preQual={preQual}
        isLoggedIn={isLoggedIn}
        onContinueLoggedIn={handleContinueLoggedIn}
        isContinuing={isPending}
      />
    </>
  );
}
