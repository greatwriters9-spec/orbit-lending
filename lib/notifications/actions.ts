"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { markApplicationMessagesRead, markSupportTicketNotificationsRead } from "@/lib/notifications/message-read";
import type { NotificationActionState } from "@/types/notifications";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const userId = await getUserId();
  if (!userId) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidateNotificationPaths();
  return { success: "Notification marked as read." };
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  const userId = await getUserId();
  if (!userId) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    return { error: error.message };
  }

  revalidateNotificationPaths();
  return { success: "All notifications marked as read." };
}

export async function dismissAlertModalAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const userId = await getUserId();
  if (!userId) {
    return { error: "Unauthorized." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ modal_dismissed: true, read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidateNotificationPaths();
  return { success: "Alert dismissed." };
}

export async function markApplicationMessagesReadAction(
  applicationId: string,
): Promise<NotificationActionState> {
  const userId = await getUserId();
  if (!userId) {
    return { error: "Unauthorized." };
  }

  await markApplicationMessagesRead(userId, applicationId);
  revalidateNotificationPaths();
  return { success: "Messages marked as read." };
}

export async function markSupportTicketNotificationsReadAction(
  ticketId: string,
): Promise<NotificationActionState> {
  const userId = await getUserId();
  if (!userId) {
    return { error: "Unauthorized." };
  }

  await markSupportTicketNotificationsRead(userId, ticketId);
  revalidateNotificationPaths();
  return { success: "Support notifications marked as read." };
}

function revalidateNotificationPaths() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard/messages");
}
