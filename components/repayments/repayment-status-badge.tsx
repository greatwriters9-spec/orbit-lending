import { cn } from "@/lib/utils";
import {
  STATUS_BADGE_BASE,
  statusBadgeClasses,
  type StatusColorVariant,
} from "@/lib/status-colors";
import {
  LOAN_HEALTH_LABELS,
  REPAYMENT_STATUS_LABELS,
} from "@/lib/repayments/constants";
import type { LoanHealthRating, LoanRepaymentStatus } from "@/types/repayments";

const statusVariants: Record<LoanRepaymentStatus, StatusColorVariant> = {
  upcoming: "neutral",
  due_today: "pending",
  pending_verification: "pending",
  paid: "success",
  rejected: "danger",
  late: "danger",
  overdue: "danger",
  waived: "neutral",
};

export function RepaymentStatusBadge({
  status,
  className,
}: {
  status: LoanRepaymentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        STATUS_BADGE_BASE,
        "rounded-full uppercase",
        statusBadgeClasses(statusVariants[status]),
        className,
      )}
    >
      {REPAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

const healthStyles: Record<LoanHealthRating, string> = {
  excellent: "text-[#166534]",
  good: "text-[#1D4ED8]",
  warning: "text-[#92400E]",
  critical: "text-[#991B1B]",
};

export function LoanHealthBadge({
  rating,
  score,
  className,
}: {
  rating: LoanHealthRating;
  score: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("text-sm font-semibold", healthStyles[rating])}>
        {LOAN_HEALTH_LABELS[rating]}
      </span>
      <span className="text-xs text-muted-foreground">({score}/100)</span>
    </div>
  );
}
