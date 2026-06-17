import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";
import { MORTGAGE_APPLICATION_DRAFT_KEY } from "@/types/mortgage-onboarding";

export function readMortgageApplicationDraft(): MortgageApplicationDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(MORTGAGE_APPLICATION_DRAFT_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as MortgageApplicationDraft;
  } catch {
    return null;
  }
}

export function writeMortgageApplicationDraft(draft: MortgageApplicationDraft) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(MORTGAGE_APPLICATION_DRAFT_KEY, JSON.stringify(draft));
}

export function clearMortgageApplicationDraft() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(MORTGAGE_APPLICATION_DRAFT_KEY);
}

export function mergeMortgageApplicationDraft(
  patch: Partial<MortgageApplicationDraft>,
): MortgageApplicationDraft {
  const current = readMortgageApplicationDraft() ?? {};
  const next = { ...current, ...patch };
  writeMortgageApplicationDraft(next);
  return next;
}
