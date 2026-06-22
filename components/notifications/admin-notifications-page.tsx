import { AdminNotificationCenter } from "@/components/notifications/admin-notification-center";
import { fetchAdminNotifications } from "@/lib/notifications/admin-queries";

type AdminNotificationsPageProps = {
  notificationsHref: string;
};

export async function AdminNotificationsPage({
  notificationsHref,
}: AdminNotificationsPageProps) {
  const notifications = await fetchAdminNotifications({ limit: 50 });

  return (
    <AdminNotificationCenter
      notifications={notifications}
      notificationsHref={notificationsHref}
    />
  );
}
