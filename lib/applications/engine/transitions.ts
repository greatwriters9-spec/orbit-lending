import type { ApplicationStatus } from "@/types/application-details";

import { TERMINAL_STATUSES } from "./statuses";

const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["submitted"],
  submitted: [
    "under_review",
    "pre_qualified",
    "information_required",
    "approved",
    "rejected",
  ],
  under_review: [
    "pre_qualified",
    "information_required",
    "rejected",
    "pre_approved",
    "approved",
  ],
  pre_qualified: ["submitted", "offer_sent", "information_required", "rejected", "approved"],
  pre_approved: ["offer_sent", "pending_finance_approval", "rejected", "approved"],
  information_required: [
    "under_review",
    "pre_qualified",
    "rejected",
    "approved",
  ],
  offer_sent: [
    "offer_accepted",
    "offer_declined",
    "approved",
    "rejected",
    "information_required",
  ],
  offer_accepted: [
    "pending_finance_approval",
    "approved",
    "information_required",
  ],
  offer_declined: [
    "under_review",
    "rejected",
    "offer_sent",
    "approved",
    "information_required",
  ],
  pending_finance_approval: ["approved", "information_required", "rejected"],
  approved: ["funded", "information_required"],
  funded: ["active"],
  active: ["completed", "defaulted"],
  completed: [],
  rejected: [],
  defaulted: [],
};

export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  if (from === to) {
    return true;
  }

  if (TERMINAL_STATUSES.includes(from)) {
    return false;
  }

  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedTransitions(
  from: ApplicationStatus,
): ApplicationStatus[] {
  if (TERMINAL_STATUSES.includes(from)) {
    return [];
  }

  return TRANSITIONS[from] ?? [];
}

export function assertTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
): string | null {
  if (from === to) {
    return null;
  }

  if (!canTransition(from, to)) {
    return `Cannot move application from "${from.replace(/_/g, " ")}" to "${to.replace(/_/g, " ")}".`;
  }

  return null;
}
