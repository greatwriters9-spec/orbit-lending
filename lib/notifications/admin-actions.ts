"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { NotificationActionState } from "@/types/notifications";

function revalidateAdminNotificationPaths() {
  revalidatePath("/admin", "layout");
  revalidatePath("/finance", "layout");
  revalidatePath("/super-admin", "layout");
  revalidatePath("/admin/notifications");
  revalidatePath("/finance/notifications");
  revalidatePath("/super-admin/notifications");
}

export async function markAdminNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("channel", "in_app");

  if (error) {
    return { error: error.message };
  }

  revalidateAdminNotificationPaths();
  return { success: "Notification marked as read." };
}

export async function markAllAdminNotificationsReadAction(): Promise<NotificationActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_notifications")
    .update({ read: true })
    .eq("channel", "in_app")
    .eq("read", false);

  if (error) {
    return { error: error.message };
  }

  revalidateAdminNotificationPaths();
  return { success: "All admin notifications marked as read." };
}
