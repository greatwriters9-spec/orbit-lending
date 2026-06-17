import type { ApplicationStatus } from "@/types/application-details";

const CLIENT_EDITABLE_STATUSES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "pre_qualified",
  "pre_approved",
  "information_required",
  "offer_sent",
  "offer_accepted",
  "offer_declined",
  "pending_finance_approval",
];

export function canClientEditApplication(status: ApplicationStatus): boolean {
  return CLIENT_EDITABLE_STATUSES.includes(status);
}
