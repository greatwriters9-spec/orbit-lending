import { createClient } from "@/lib/supabase/server";
import type {
  NotificationCategory,
  NotificationPriorityLevel,
} from "@/types/notifications";
import type { NotificationType } from "@/types/wallet";

import { cleanEnv } from "@/lib/env";

import { buildEmailHtml, sendTransactionalEmail } from "./email";
import { resolveUserEmail } from "./resolve-user-email";

export type NotifyUserInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriorityLevel;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  showModal?: boolean;
  sendEmail?: boolean;
  email?: string;
};

export async function notifyUser(input: NotifyUserInput) {
  const supabase = await createClient();
  const priority = input.priority ?? "normal";
  const category = input.category ?? "application_update";
  const type = input.type ?? "general";

  await supabase.from("notifications").insert({
    user_id: input.userId,
    title: input.title,
    message: input.message,
    type,
    category,
    priority,
    action_url: input.actionUrl ?? null,
    metadata: input.metadata ?? {},
    modal_dismissed: !(input.showModal ?? priority === "critical"),
  });

  const shouldEmail =
    input.sendEmail ??
    (priority === "critical" || priority === "high");

  const recipientEmail =
    input.email ?? (shouldEmail ? await resolveUserEmail(input.userId) : null);

  if (shouldEmail && recipientEmail) {
    const origin =
      cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";
    const actionUrl = input.actionUrl
      ? `${origin}${input.actionUrl}`
      : undefined;

    const result = await sendTransactionalEmail({
      to: recipientEmail,
      subject: input.title,
      html: buildEmailHtml(input.title, input.message, actionUrl),
      text: `${input.title}\n\n${input.message}${actionUrl ? `\n\n${actionUrl}` : ""}`,
    });

    if (!result.ok && process.env.NODE_ENV === "development") {
      console.warn("[notifyUser] Email not sent:", result.error);
    }
  } else if (shouldEmail && !recipientEmail) {
    console.warn(
      `[notifyUser] Email skipped — no address found for user ${input.userId}`,
    );
  }
}

export async function getUserEmail(userId: string): Promise<string | null> {
  return resolveUserEmail(userId);
}

export async function recordApplicationActivity(
  applicationId: string,
  event: {
    eventType: string;
    title: string;
    description?: string;
    actorId?: string;
    actorName?: string;
  },
) {
  const supabase = await createClient();

  await supabase.from("application_activity_events").insert({
    application_id: applicationId,
    event_type: event.eventType,
    title: event.title,
    description: event.description ?? null,
    actor_id: event.actorId ?? null,
    actor_name: event.actorName ?? null,
  });
}

const STATUS_NOTIFICATIONS: Record<
  string,
  {
    title: string;
    message: string;
    priority: NotificationPriorityLevel;
    showModal: boolean;
    sendEmail: boolean;
  }
> = {
  submitted: {
    title: "Mortgage Application Submitted",
    message: "Your mortgage application has been submitted and is queued for review.",
    priority: "normal",
    showModal: false,
    sendEmail: true,
  },
  under_review: {
    title: "Mortgage Under Review",
    message: "Your mortgage application is now being reviewed by our mortgage team.",
    priority: "informational",
    showModal: false,
    sendEmail: true,
  },
  information_required: {
    title: "Information Required",
    message: "We need additional documents or information to continue your review.",
    priority: "critical",
    showModal: true,
    sendEmail: true,
  },
  offer_sent: {
    title: "Mortgage Offer Sent",
    message: "A mortgage offer is ready for your review. Please accept or decline.",
    priority: "critical",
    showModal: true,
    sendEmail: true,
  },
  offer_accepted: {
    title: "Offer Accepted",
    message: "You accepted the mortgage offer. Final approval is in progress.",
    priority: "high",
    showModal: false,
    sendEmail: true,
  },
  approved: {
    title: "Mortgage Approved",
    message: "Congratulations! Your mortgage application has been approved for funding.",
    priority: "critical",
    showModal: true,
    sendEmail: true,
  },
  rejected: {
    title: "Application Not Approved",
    message: "Your mortgage application was not approved at this time.",
    priority: "critical",
    showModal: true,
    sendEmail: true,
  },
  funded: {
    title: "Funding Complete",
    message: "Your mortgage funds have been credited to your Orbit wallet.",
    priority: "critical",
    showModal: true,
    sendEmail: true,
  },
  active: {
    title: "Mortgage Active",
    message: "Your mortgage is now active. View your dashboard for payment details.",
    priority: "high",
    showModal: false,
    sendEmail: true,
  },
  completed: {
    title: "Mortgage Fully Repaid",
    message: "Your mortgage has been fully repaid. Thank you for banking with Orbit Mortgage.",
    priority: "high",
    showModal: false,
    sendEmail: true,
  },
};

export async function notifyApplicationStatusChange(
  userId: string,
  applicationId: string,
  status: string,
) {
  const config = STATUS_NOTIFICATIONS[status];
  if (!config) {
    return;
  }

  const email = await resolveUserEmail(userId);

  await notifyUser({
    userId,
    title: config.title,
    message: config.message,
    type: "application_update",
    category: "application_update",
    priority: config.priority,
    actionUrl: `/dashboard/loans/${applicationId}`,
    metadata: { applicationId, status },
    showModal: config.showModal,
    sendEmail: config.sendEmail,
    email: email ?? undefined,
  });

  await recordApplicationActivity(applicationId, {
    eventType: "status_change",
    title: config.title,
    description: config.message,
    actorName: "Orbit Mortgage",
  });
}

export async function notifyFinanceMessage(
  userId: string,
  applicationId: string,
  senderName: string,
  preview: string,
) {
  const email = await resolveUserEmail(userId);

  await notifyUser({
    userId,
    title: "Message from Loan Officer",
    message: `${senderName}: ${preview.slice(0, 120)}${preview.length > 120 ? "…" : ""}`,
    type: "application_update",
    category: "finance_message",
    priority: "high",
    actionUrl: `/dashboard/loans/${applicationId}`,
    metadata: { applicationId },
    showModal: false,
    sendEmail: true,
    email: email ?? undefined,
  });
}

export async function notifyWalletEvent(
  userId: string,
  input: {
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriorityLevel;
    actionUrl?: string;
    showModal?: boolean;
  },
) {
  const email = await resolveUserEmail(userId);

  await notifyUser({
    userId,
    title: input.title,
    message: input.message,
    type: input.type,
    category: "wallet_activity",
    priority: input.priority ?? "high",
    actionUrl: input.actionUrl ?? "/wallet",
    showModal: input.showModal ?? false,
    sendEmail: true,
    email: email ?? undefined,
  });
}

export async function notifySecurityEvent(
  userId: string,
  title: string,
  message: string,
) {
  const email = await resolveUserEmail(userId);

  await notifyUser({
    userId,
    title,
    message,
    type: "general",
    category: "security",
    priority: "critical",
    actionUrl: "/dashboard/profile",
    showModal: true,
    sendEmail: true,
    email: email ?? undefined,
  });
}

export async function notifyRepaymentEvent(
  userId: string,
  title: string,
  message: string,
  priority: NotificationPriorityLevel = "high",
  options?: { showModal?: boolean; sendEmail?: boolean },
) {
  const email = await resolveUserEmail(userId);

  await notifyUser({
    userId,
    title,
    message,
    type: "general",
    category: "repayment",
    priority,
    actionUrl: "/dashboard/repayments",
    showModal: options?.showModal,
    sendEmail:
      options?.sendEmail ??
      (priority === "critical" || priority === "high"),
    email: email ?? undefined,
  });
}

const ACCOUNT_STATUS_NOTIFICATIONS: Record<
  string,
  { title: string; message: (reason?: string) => string; reactivated?: boolean }
> = {
  restricted: {
    title: "Account Restricted",
    message: (reason) =>
      `Your account has been restricted.${reason ? ` Reason: ${reason}` : ""} New mortgage applications and withdrawals are temporarily unavailable.`,
  },
  on_hold: {
    title: "Account On Hold",
    message: (reason) =>
      `Your account has been placed on hold.${reason ? ` Reason: ${reason}` : ""} Transactional activity is paused until review is complete.`,
  },
  suspended: {
    title: "Account Suspended",
    message: (reason) =>
      `Your account has been suspended.${reason ? ` Reason: ${reason}` : ""} Please contact Orbit Mortgage support for assistance.`,
  },
  active: {
    title: "Account Reactivated",
    message: (reason) =>
      `Your account access has been restored.${reason ? ` Note: ${reason}` : ""} You may resume normal platform activity.`,
    reactivated: true,
  },
};

export async function notifyAccountStatusChange(
  userId: string,
  previousStatus: string,
  newStatus: string,
  reason?: string,
) {
  const config =
    ACCOUNT_STATUS_NOTIFICATIONS[newStatus] ??
    (newStatus === "active" && previousStatus !== "active"
      ? ACCOUNT_STATUS_NOTIFICATIONS.active
      : null);

  if (!config) {
    return;
  }

  const email = await resolveUserEmail(userId);
  const message = config.message(reason);

  await notifyUser({
    userId,
    title: config.title,
    message,
    type: "general",
    category: "security",
    priority: newStatus === "suspended" ? "critical" : "high",
    actionUrl: "/account-status",
    showModal: newStatus === "suspended" || newStatus === "restricted",
    sendEmail: true,
    email: email ?? undefined,
  });
}

