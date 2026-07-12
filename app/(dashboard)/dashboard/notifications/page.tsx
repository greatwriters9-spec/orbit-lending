import { NotificationCenter } from "@/components/notifications/notification-center";
import { getSessionUser } from "@/lib/auth/actions";
import { fetchUserNotifications } from "@/lib/notifications/queries";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await getSessionUser();
  const notifications = user
    ? await fetchUserNotifications(user.id, { limit: 100 })
    : [];

  return <NotificationCenter notifications={notifications} />;
}

