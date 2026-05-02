import { AppShell } from "@/components/layout/app-shell";
import { NotificationDashboard } from "@/components/manage/notification-dashboard";

export default function NotificationsPage() {
  return (
    <AppShell active="notifications">
      <NotificationDashboard />
    </AppShell>
  );
}
