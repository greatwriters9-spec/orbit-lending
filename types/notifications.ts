import type { NotificationType } from "@/types/wallet";

export type NotificationCategory =
  | "application_update"
  | "finance_message"
  | "wallet_activity"
  | "security"
  | "repayment"
  | "support";

export type NotificationPriorityLevel =
  | "critical"
  | "high"
  | "normal"
  | "informational";

export type ClientNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriorityLevel;
  read: boolean;
  modalDismissed: boolean;
  actionUrl?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type NotificationActionState = {
  error?: string;
  success?: string;
};

export type PriorityAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  priority: "critical" | "high" | "normal";
};

export type ApplicationActivityEvent = {
  id: string;
  applicationId: string;
  eventType: string;
  title: string;
  description?: string;
  actorName?: string;
  createdAt: string;
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  application_update: "Application Updates",
  finance_message: "Loan Officer Messages",
  wallet_activity: "Funding Account Activity",
  security: "Security Events",
  repayment: "Repayment Events",
  support: "Support Updates",
};
