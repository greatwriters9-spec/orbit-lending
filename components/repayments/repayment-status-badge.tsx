import { cn } from "@/lib/utils";
import {
  LOAN_HEALTH_LABELS,
  REPAYMENT_STATUS_LABELS,
} from "@/lib/repayments/constants";
import type { LoanHealthRating, LoanRepaymentStatus } from "@/types/repayments";

const statusStyles: Record<LoanRepaymentStatus, string> = {
  upcoming: "bg-slate-100 text-slate-700 border-slate-200",
  due_today: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  pending_verification: "bg-amber-50 text-amber-800 border-amber-200",
  paid: "bg-brand-success/10 text-brand-success border-brand-success/20",
  rejected: "bg-red-50 text-red-700 border-red-200",
  late: "bg-orange-50 text-orange-800 border-orange-200",
  overdue: "bg-red-100 text-red-800 border-red-300",
  waived: "bg-violet-50 text-violet-700 border-violet-200",
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
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        statusStyles[status],
        className,
      )}
    >
      {REPAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

const healthStyles: Record<LoanHealthRating, string> = {
  excellent: "text-brand-success",
  good: "text-brand-blue",
  warning: "text-brand-warning",
  critical: "text-brand-danger",
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
      <span
        className={cn(
          "text-sm font-semibold",
          healthStyles[rating],
        )}
      >
        {LOAN_HEALTH_LABELS[rating]}
      </span>
      <span className="text-xs text-muted-foreground">({score}/100)</span>
    </div>
  );
}
