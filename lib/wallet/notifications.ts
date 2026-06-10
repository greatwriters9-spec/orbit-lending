import { notifyWalletEvent } from "@/lib/notifications/service";
import type { NotificationType } from "@/types/wallet";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  priority?: "critical" | "high" | "normal" | "informational";
  showModal?: boolean;
};

/** @deprecated Use notifyWalletEvent from lib/notifications/service directly */
export async function createNotification(input: CreateNotificationInput) {
  await notifyWalletEvent(input.userId, {
    title: input.title,
    message: input.message,
    type: input.type,
    priority: input.priority,
    actionUrl: input.actionUrl,
    showModal: input.showModal,
  });
}
