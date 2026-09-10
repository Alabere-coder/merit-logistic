"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { savePushSubscription } from "@/lib/actions/push-notifications";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationButton() {
  const [supported, setSupported] = useState(false);

  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const [subscribed, setSubscribed] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function checkPushSupport() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setSupported(false);
        return;
      }

      setSupported(true);
      setPermission(Notification.permission);

      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        const subscription = await registration.pushManager.getSubscription();

        setSubscribed(subscription !== null);
      } catch (error) {
        console.error("SERVICE WORKER REGISTRATION ERROR:", error);

        setError("Unable to initialize notifications.");
      }
    }

    checkPushSupport();
  }, []);

  async function enableNotifications() {
    setLoading(true);
    setError("");

    try {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        throw new Error(
          "Push notifications are not supported by this browser.",
        );
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured.");
      }

      /* ---------------------------------------------------
         Ask for browser permission
      --------------------------------------------------- */

      const permissionResult = await Notification.requestPermission();

      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        if (permissionResult === "denied") {
          setError(
            "Notifications are blocked. You can enable them in your browser settings.",
          );
        }

        return;
      }

      /* ---------------------------------------------------
         Get service worker
      --------------------------------------------------- */

      const registration = await navigator.serviceWorker.ready;

      /* ---------------------------------------------------
         Get existing subscription
      --------------------------------------------------- */

      let subscription = await registration.pushManager.getSubscription();

      /* ---------------------------------------------------
         Create subscription if necessary
      --------------------------------------------------- */

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      /* ---------------------------------------------------
         Save subscription to Supabase
      --------------------------------------------------- */

      const subscriptionJson = subscription.toJSON();

      const result = await savePushSubscription({
        endpoint: subscriptionJson.endpoint ?? "",

        keys: {
          p256dh: subscriptionJson.keys?.p256dh,

          auth: subscriptionJson.keys?.auth,
        },
      });

      if ("error" in result) {
        throw new Error(result.error);
      }

      setSubscribed(true);
    } catch (error) {
      console.error("ENABLE PUSH NOTIFICATIONS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to enable notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return null;
  }

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />

        <span>Push notifications enabled</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        variant="outline"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enabling notifications...
          </>
        ) : permission === "denied" ? (
          <>
            <BellOff className="mr-2 h-4 w-4" />
            Notifications blocked
          </>
        ) : (
          <>
            <Bell className="mr-2 h-4 w-4" />
            Enable notifications
          </>
        )}
      </Button>

      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
