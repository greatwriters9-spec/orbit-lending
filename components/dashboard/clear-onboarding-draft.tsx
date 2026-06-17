"use client";

import { useEffect } from "react";

import { clearMortgageApplicationDraft } from "@/lib/onboarding/draft-storage";

export function ClearOnboardingDraft() {
  useEffect(() => {
    clearMortgageApplicationDraft();
  }, []);

  return null;
}
