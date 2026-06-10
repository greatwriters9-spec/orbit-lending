import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { LoanStatus } from "@/types/dashboard";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
  {
    variants: {
      status: {
        approved:
          "border-brand-success/20 bg-brand-success/10 text-brand-success",
        pending:
          "border-brand-warning/20 bg-brand-warning/10 text-brand-warning",
        rejected:
          "border-brand-danger/20 bg-brand-danger/10 text-brand-danger",
        active: "border-brand-blue/20 bg-brand-blue/10 text-brand-blue",
        completed:
          "border-brand-success/20 bg-brand-success/10 text-brand-success",
        "information-required":
          "border-brand-warning/20 bg-brand-warning/10 text-brand-warning",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  },
);

const statusLabels: Record<LoanStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  active: "Active",
  completed: "Completed",
  "information-required": "Info Required",
};

type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  status: LoanStatus;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {label ?? statusLabels[status]}
    </span>
  );
}
