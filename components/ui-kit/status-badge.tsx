import { cn } from "@/lib/utils";
import {
  resolveStatusColorVariant,
  STATUS_BADGE_BASE,
  statusBadgeClasses,
} from "@/lib/status-colors";
import type { LoanStatus } from "@/types/dashboard";

type StatusBadgeProps = {
  status: LoanStatus;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        STATUS_BADGE_BASE,
        "uppercase",
        statusBadgeClasses(status),
        className,
      )}
    >
      {label ?? status}
    </span>
  );
}

export function StatusLabelBadge({
  label,
  className,
  uppercase = true,
}: {
  label: string;
  className?: string;
  uppercase?: boolean;
}) {
  const variant = resolveStatusColorVariant(label);

  return (
    <span
      className={cn(
        STATUS_BADGE_BASE,
        uppercase && "uppercase",
        statusBadgeClasses(variant),
        className,
      )}
    >
      {label}
    </span>
  );
}
