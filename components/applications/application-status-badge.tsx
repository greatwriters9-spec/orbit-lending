import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONE,
} from "@/lib/applications/status-utils";
import { StatusBadge } from "@/components/ui-kit/status-badge";
import type { ApplicationStatus } from "@/types/application-details";
import type { LoanStatus } from "@/types/dashboard";

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

export function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const tone = APPLICATION_STATUS_TONE[status] as LoanStatus;

  return (
    <StatusBadge
      status={tone}
      label={APPLICATION_STATUS_LABELS[status]}
      className={className}
    />
  );
}
