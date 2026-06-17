import type { StatusColorVariant } from "@/lib/status-colors";
import type { ApplicationStatus } from "@/types/application-details";
import type { ProgressStep } from "@/types/dashboard";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  pre_qualified: "Pre-Qualified",
  pre_approved: "Pre-Approved",
  information_required: "Information Required",
  pending_finance_approval: "Pending Credit Manager Review",
  approved: "Approved",
  offer_sent: "Offer Sent",
  offer_accepted: "Offer Accepted",
  offer_declined: "Offer Declined",
  funded: "Funded",
  active: "Active",
  completed: "Completed",
  rejected: "Rejected",
  defaulted: "Defaulted",
};

export const APPLICATION_STATUS_TONE: Record<ApplicationStatus, StatusColorVariant> = {
  draft: "pending",
  submitted: "pending",
  under_review: "pending",
  pre_qualified: "prequalified",
  pre_approved: "success",
  information_required: "pending",
  pending_finance_approval: "pending",
  approved: "success",
  offer_sent: "pending",
  offer_accepted: "success",
  offer_declined: "danger",
  funded: "success",
  active: "success",
  completed: "success",
  rejected: "danger",
  defaulted: "danger",
};

const LIFECYCLE_STEPS = [
  { id: "submitted", label: "Application Submitted" },
  { id: "review", label: "Initial Review" },
  { id: "verification", label: "Documentation" },
  { id: "offer", label: "Offer & Approval" },
  { id: "funding", label: "Funding" },
] as const;

const STATUS_STEP_INDEX: Record<ApplicationStatus, number> = {
  draft: -1,
  submitted: 0,
  under_review: 1,
  pre_qualified: 2,
  information_required: 2,
  offer_sent: 3,
  offer_accepted: 3,
  offer_declined: 3,
  pre_approved: 3,
  pending_finance_approval: 3,
  approved: 4,
  funded: 4,
  active: 4,
  completed: 4,
  rejected: 1,
  defaulted: 4,
};

export function buildProgressSteps(status: ApplicationStatus): ProgressStep[] {
  const currentIndex = STATUS_STEP_INDEX[status];

  return LIFECYCLE_STEPS.map((step, index) => ({
    id: step.id,
    label: step.label,
    status:
      status === "rejected" && index > currentIndex
        ? "upcoming"
        : index < currentIndex
          ? "completed"
          : index === currentIndex
            ? "current"
            : "upcoming",
  }));
}

export function formatApplicationDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
