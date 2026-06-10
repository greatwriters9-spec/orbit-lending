import type { ApplicationStatus } from "@/types/application-details";

export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "pre_qualified",
  "information_required",
  "pending_finance_approval",
  "approved",
  "offer_sent",
  "offer_accepted",
  "offer_declined",
  "pre_approved",
  "funded",
  "active",
  "completed",
  "rejected",
  "defaulted",
] as const satisfies readonly ApplicationStatus[];

export const TERMINAL_STATUSES: ApplicationStatus[] = [
  "completed",
  "rejected",
  "defaulted",
];

export const FINANCE_QUEUE_STATUSES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "pre_qualified",
  "pre_approved",
  "information_required",
  "offer_sent",
  "offer_accepted",
  "offer_declined",
  "pending_finance_approval",
  "approved",
];
