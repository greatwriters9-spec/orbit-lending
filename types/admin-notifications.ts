export type AdminNotificationSeverity =
  | "critical"
  | "high"
  | "normal"
  | "informational";

export type AdminNotificationChannel = "in_app" | "email" | "telegram";

export type AdminNotificationEvent =
  // User events
  | "NEW_USER_REGISTRATION"
  | "EMAIL_VERIFIED"
  | "PROFILE_COMPLETED"
  | "IDENTITY_VERIFICATION_SUBMITTED"
  | "IDENTITY_VERIFICATION_FAILED"
  // Application events
  | "NEW_MORTGAGE_APPLICATION"
  | "APPLICATION_UPDATED"
  | "APPLICATION_READY_FOR_REVIEW"
  | "DOCUMENT_UPLOADED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  // Funding events
  | "DOWN_PAYMENT_SUBMITTED"
  | "DEPOSIT_RECEIVED"
  | "DEPOSIT_VERIFICATION_REQUIRED"
  | "DEPOSIT_APPROVED"
  | "DEPOSIT_REJECTED"
  | "ADDITIONAL_FUNDS_REQUIRED"
  | "FUNDING_GOAL_REACHED"
  // Escrow events
  | "ESCROW_TRANSFER_REQUESTED"
  | "ESCROW_TRANSFER_CANCELLED"
  | "ESCROW_TRANSFER_APPROVED"
  | "ESCROW_TRANSFER_COMPLETED"
  | "CLOSING_COMPLETED"
  // Communication events
  | "NEW_SUPPORT_MESSAGE"
  | "CLIENT_REPLY"
  | "NEW_CONVERSATION"
  | "LOAN_OFFICER_MESSAGE"
  | "FUNDING_DEPARTMENT_MESSAGE"
  | "CLOSING_DEPARTMENT_MESSAGE"
  // Guest events
  | "CONTACT_FORM_SUBMITTED"
  | "GUEST_MORTGAGE_INQUIRY"
  | "CALLBACK_REQUEST"
  | "GENERAL_INQUIRY"
  // Security events
  | "MULTIPLE_FAILED_LOGINS"
  | "ACCOUNT_LOCKED"
  | "SUSPICIOUS_ACTIVITY"
  | "ADMIN_LOGIN"
  | "ROLE_CHANGED";

export type AdminNotificationSettings = {
  emailEnabled: boolean;
  criticalAlertsEnabled: boolean;
  inAppEnabled: boolean;
  primaryEmail: string;
  secondaryEmail: string;
  telegramEnabled: boolean;
  telegramChatId: string;
  telegramBotToken: string;
  notificationMode: "all" | "critical_only";
};

export type AdminNotificationRecord = {
  id: string;
  eventType: AdminNotificationEvent;
  title: string;
  message: string;
  severity: AdminNotificationSeverity;
  entityType: string | null;
  entityId: string | null;
  channel: AdminNotificationChannel;
  read: boolean;
  createdAt: string;
  dashboardUrl?: string | null;
};

export type NotifyAdminInput = {
  event: AdminNotificationEvent;
  severity?: AdminNotificationSeverity;
  payload: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  dashboardUrl?: string;
};
