"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export type NotificationSettingsState = {
  success?: string;
  error?: string;
};

export async function updateNotificationSettings(
  _previousState: NotificationSettingsState,
  formData: FormData,
): Promise<NotificationSettingsState> {
  try {
    const { user } = await requireRole(["admin"]);

    const supabase = await createClient();

    const getBoolean = (name: string) => formData.get(name) === "on";

    const settings = {
      user_id: user.id,

      shipment_created: getBoolean("shipment_created"),

      shipment_assigned: getBoolean("shipment_assigned"),

      shipment_picked_up: getBoolean("shipment_picked_up"),

      shipment_in_transit: getBoolean("shipment_in_transit"),

      shipment_out_for_delivery: getBoolean("shipment_out_for_delivery"),

      shipment_delivered: getBoolean("shipment_delivered"),

      shipment_cancelled: getBoolean("shipment_cancelled"),

      payment_success: getBoolean("payment_success"),

      payment_confirmed: getBoolean("payment_confirmed"),

      payment_failed: getBoolean("payment_failed"),

      support_ticket: getBoolean("support_ticket"),

      support_message: getBoolean("support_message"),

      support_reply: getBoolean("support_reply"),

      support_assignment: getBoolean("support_assignment"),

      support_priority: getBoolean("support_priority"),

      support_status: getBoolean("support_status"),

      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("notification_settings")
      .upsert(settings, {
        onConflict: "user_id",
      });

    if (error) {
      console.error("UPDATE NOTIFICATION SETTINGS ERROR:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/admin/settings");

    return {
      success: "Notification preferences updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE NOTIFICATION SETTINGS ERROR:", error);

    return {
      error: "Unable to update notification preferences.",
    };
  }
}
