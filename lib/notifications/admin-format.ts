import { formatApplicationDate } from "@/lib/applications/status-utils";

export function formatAdminNotificationDate(value: string): string {
  return formatApplicationDate(value);
}
