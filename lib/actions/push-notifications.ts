"use server";

import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";

type PushSubscriptionInput = {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function savePushSubscription(
  subscription: PushSubscriptionInput,
) {
  const { user, supabase } = await requireRole(["customer", "driver", "admin"]);

  const endpoint = subscription.endpoint?.trim();
  const p256dh = subscription.keys?.p256dh?.trim();
  const auth = subscription.keys?.auth?.trim();

  if (!endpoint) {
    return {
      error: "Invalid push subscription endpoint.",
    };
  }

  if (!p256dh || !auth) {
    return {
      error: "Invalid push subscription keys.",
    };
  }

  /* -------------------------------------------------------
     Save subscription

     endpoint is unique, so the same browser subscription
     is updated instead of creating duplicate records.
  ------------------------------------------------------- */

  const { data, error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "endpoint",
      },
    )
    .select(
      `
        id,
        user_id,
        endpoint,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error || !data) {
    console.error("SAVE PUSH SUBSCRIPTION ERROR:", error);

    return {
      error: error?.message ?? "Unable to save push subscription.",
    };
  }

  revalidatePath("/customer/settings");
  revalidatePath("/driver/settings");
  revalidatePath("/admin/settings");

  return {
    success: true,
    subscription: data,
  };
}
