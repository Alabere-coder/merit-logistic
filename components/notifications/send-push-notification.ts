import webpush from "web-push";

import { createAdminClient } from "@/lib/supabase/admin";

type PushNotificationPayload = {
  title: string;
  message: string;
  url?: string;
  notificationId?: string;
  shipmentId?: string | null;
  paymentId?: string | null;
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const privateKey = process.env.VAPID_PRIVATE_KEY;

  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Web Push VAPID environment variables are not configured.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload,
) {
  configureWebPush();

  const supabase = createAdminClient();

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select(
      `
          id,
          endpoint,
          p256dh,
          auth
        `,
    )
    .eq("user_id", userId);

  if (error) {
    console.error("GET PUSH SUBSCRIPTIONS ERROR:", error);

    return {
      success: false,
      sent: 0,
      failed: 0,
    };
  }

  if (!subscriptions?.length) {
    return {
      success: true,
      sent: 0,
      failed: 0,
    };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.message,
    url: payload.url ?? "/",
    notificationId: payload.notificationId ?? null,
    shipmentId: payload.shipmentId ?? null,
    paymentId: payload.paymentId ?? null,
  });

  let sent = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, notificationPayload);

      sent++;
    } catch (error: unknown) {
      failed++;

      console.error("SEND PUSH NOTIFICATION ERROR:", {
        subscriptionId: subscription.id,
        userId,
        error,
      });

      /*
       * 404 / 410 normally means the browser subscription
       * is no longer valid.
       *
       * Remove it so future notifications don't keep
       * trying to use an expired subscription.
       */
      const statusCode =
        typeof error === "object" && error !== null && "statusCode" in error
          ? Number(
              (
                error as {
                  statusCode?: number;
                }
              ).statusCode,
            )
          : null;

      if (statusCode === 404 || statusCode === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("id", subscription.id);
      }
    }
  }

  return {
    success: failed === 0,
    sent,
    failed,
  };
}
