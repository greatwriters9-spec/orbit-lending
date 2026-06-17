/**
 * Shared status badge colors.
 * success = green, danger = red, pending = amber, prequalified = blue, closing = indigo
 */
export type StatusColorVariant =
  | "success"
  | "danger"
  | "pending"
  | "prequalified"
  | "closing"
  | "neutral";

export const STATUS_BADGE_BASE =
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide";

export const STATUS_BADGE_CLASSES: Record<StatusColorVariant, string> = {
  success: "border-[#166534]/20 bg-[#DCFCE7] text-[#166534]",
  danger: "border-[#991B1B]/20 bg-[#FEE2E2] text-[#991B1B]",
  pending: "border-[#92400E]/20 bg-[#FEF3C7] text-[#92400E]",
  prequalified: "border-[#1D4ED8]/20 bg-[#DBEAFE] text-[#1D4ED8]",
  closing: "border-[#4338CA]/20 bg-[#E0E7FF] text-[#4338CA]",
  neutral: "border-brand-border bg-brand-background text-muted-foreground",
};

export function statusBadgeClasses(variant: StatusColorVariant): string {
  return STATUS_BADGE_CLASSES[variant];
}

const SUCCESS_PATTERNS = [
  "approved",
  "confirmed",
  "transferred",
  "transfer",
  "funded",
  "verified",
  "active",
  "completed",
  "accepted",
  "deposited",
  "ready to transfer",
  "paid",
  "resolved",
  "received",
  "success",
  "complete",
];

const DANGER_PATTERNS = [
  "rejected",
  "denied",
  "declined",
  "locked",
  "defaulted",
  "failed",
  "overdue",
  "escalated",
  "critical",
  "not linked",
];

const PENDING_PATTERNS = [
  "pending",
  "review",
  "awaiting",
  "submitted",
  "information required",
  "info required",
  "setup pending",
  "partially",
  "processing",
  "in progress",
  "waiting",
  "open",
  "assigned",
  "due today",
  "offer sent",
  "offer pending",
];

const PREQUALIFIED_PATTERNS = [
  "pre-qualified",
  "pre qualified",
  "pre_qualified",
  "eligible",
];

const CLOSING_PATTERNS = ["closing", "pending release"];

export function resolveStatusColorVariant(label: string): StatusColorVariant {
  const normalized = label.toLowerCase().trim();
  if (!normalized) return "neutral";

  if (PREQUALIFIED_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return "prequalified";
  }

  if (CLOSING_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return "closing";
  }

  if (DANGER_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return "danger";
  }

  if (PENDING_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return "pending";
  }

  if (SUCCESS_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return "success";
  }

  return "neutral";
}
