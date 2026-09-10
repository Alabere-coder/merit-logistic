"use server";

import { requireRole } from "@/lib/auth/require-role";
import { sendPushNotificationToUser } from "@/lib/notifications/send-push-notification";

export async function sendTestPushNotification() {
  const { user } = await requireRole(["customer", "driver", "admin"]);

  const result = await sendPushNotificationToUser(user.id, {
    title: "Push notifications are working!",
    message: "Your Integrity Media browser notifications are now connected.",
    url: "/",
  });

  return result;
}
