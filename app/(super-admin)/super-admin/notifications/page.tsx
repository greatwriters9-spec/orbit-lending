import { AdminNotificationsPage } from "@/components/notifications/admin-notifications-page";

export const metadata = {
  title: "Admin Alerts",
};

export default function Page() {
  return <AdminNotificationsPage notificationsHref="/super-admin/notifications" />;
}
