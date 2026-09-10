import { PushNotificationButton } from "@/components/notifications/push-notification-button";

export function NotificationSettings() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>

      <p className="mt-1 text-sm text-slate-500">
        Receive shipment and payment updates even when you are not using the
        website.
      </p>

      <div className="mt-5">
        <PushNotificationButton />
      </div>
    </div>
  );
}
