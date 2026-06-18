/**
 * Canonical status badge colors (single source of truth).
 *
 * | Status         | Background | Text    |
 * | -------------- | ---------- | ------- |
 * | Pre-Qualified  | #DBEAFE    | #1D4ED8 |
 * | Approved       | #DCFCE7    | #166534 |
 * | Pending Review | #FEF3C7    | #92400E |
 * | Funded         | #DCFCE7    | #166534 |
 * | Closing        | #E0E7FF    | #4338CA |
 * | Rejected       | #FEE2E2    | #991B1B |
 */
export type StatusColorVariant =
  | "success"
  | "danger"
  | "pending"
  | "prequalified"
  | "closing"
  | "neutral";

export const STATUS_COLOR_TOKENS: Record<
  Exclude<StatusColorVariant, "neutral">,
  { background: string; text: string }
> = {
  prequalified: { background: "#DBEAFE", text: "#1D4ED8" },
  success: { background: "#DCFCE7", text: "#166534" },
  pending: { background: "#FEF3C7", text: "#92400E" },
  closing: { background: "#E0E7FF", text: "#4338CA" },
  danger: { background: "#FEE2E2", text: "#991B1B" },
};

export const STATUS_BADGE_BASE =
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide";

export const STATUS_BADGE_CLASSES: Record<StatusColorVariant, string> = {
  success:
    "border-[#166534]/20 bg-[#DCFCE7] text-[#166534]",
  danger:
    "border-[#991B1B]/20 bg-[#FEE2E2] text-[#991B1B]",
  pending:
    "border-[#92400E]/20 bg-[#FEF3C7] text-[#92400E]",
  prequalified:
    "border-[#1D4ED8]/20 bg-[#DBEAFE] text-[#1D4ED8]",
  closing:
    "border-[#4338CA]/20 bg-[#E0E7FF] text-[#4338CA]",
  neutral: "border-brand-border bg-brand-background text-muted-foreground",
};

export function statusBadgeClasses(variant: StatusColorVariant): string {
  return STATUS_BADGE_CLASSES[variant];
}

const EXACT_STATUS_VARIANT: Record<string, StatusColorVariant> = {
  "pre-qualified": "prequalified",
  eligible: "prequalified",
  approved: "success",
  "application approved": "success",
  funded: "success",
  "funds deposited": "success",
  active: "success",
  "ready for transfer": "success",
  "under review": "pending",
  "pending review": "pending",
  "pending approval": "pending",
  "transfer pending": "pending",
  "waiting setup": "pending",
  "waiting funding": "pending",
  "partially funded": "pending",
  "awaiting down payment": "pending",
  "awaiting funding": "pending",
  "n/a": "pending",
  closing: "closing",
  transferred: "closing",
  declined: "danger",
  rejected: "danger",
};

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

  if (EXACT_STATUS_VARIANT[normalized]) {
    return EXACT_STATUS_VARIANT[normalized];
  }

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
