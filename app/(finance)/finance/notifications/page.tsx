import { AdminNotificationsPage } from "@/components/notifications/admin-notifications-page";

export const metadata = {
  title: "Admin Alerts | Orbit Mortgage",
};

export default function Page() {
  return <AdminNotificationsPage notificationsHref="/finance/notifications" />;
}
