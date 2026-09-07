"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "general"
  | "shipment_created"
  | "shipment_assigned"
  | "shipment_picked_up"
  | "shipment_in_transit"
  | "shipment_arrived_at_warehouse"
  | "shipment_out_for_delivery"
  | "shipment_arrived_at_delivery_destination"
  | "shipment_delivered"
  | "shipment_cancelled"
  | "payment_success"
  | "payment_confirmed"
  | "payment_failed"
  | "support_reply"
  | "support_assignment"
  | "support_priority"
  | "support_status"
  | "support_message"
  | "support_ticket";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  shipmentId?: string | null;
  paymentId?: string | null;
  supportTicketId?: string | null;
};

/**
 * Create a notification for another user.
 *
 * IMPORTANT:
 * The caller is authenticated and authorized first.
 * The service-role client is then used only for the insert
 * because the recipient is usually a different user.
 */

export async function createNotification({
  userId,
  title,
  message,
  type = "general",
  shipmentId = null,
  paymentId = null,
  supportTicketId = null,
}: CreateNotificationInput) {
  try {
    console.log("🔥 CREATE NOTIFICATION FUNCTION CALLED", {
      userId,
      type,
      title,
      shipmentId,
      paymentId,
      supportTicketId,
    });
    await requireRole(["admin", "driver", "customer"]);

    /*
     * =======================================================
     * CHECK RECIPIENT NOTIFICATION PREFERENCE
     *
     * Notification preferences belong to the recipient,
     * not the person creating the notification.
     *
     * Example:
     * Admin A disables shipment_delivered
     * Admin B enables shipment_delivered
     *
     * A will not receive it.
     * B will receive it.
     * =======================================================
     */

    const adminSupabase = createAdminClient();

    const { data: recipient, error: recipientError } = await adminSupabase
      .from("users")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (recipientError || !recipient) {
      console.error("GET NOTIFICATION RECIPIENT ERROR:", recipientError);

      return {
        error: "Notification recipient not found.",
      };
    }

    /*
     * =======================================================
     * GENERAL NOTIFICATIONS
     *
     * "general" does not have a corresponding preference
     * column, so it should always be allowed.
     * =======================================================
     */

    if (type !== "general") {
      const { data: settings, error: settingsError } = await adminSupabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      /*
       * If the recipient has no settings row yet, use the
       * default behavior: notifications are enabled.
       *
       * This is important because existing customers,
       * drivers, or admins may not have a settings row.
       */
      if (settingsError) {
        console.error("GET NOTIFICATION SETTINGS ERROR:", {
          userId,
          type,
          error: settingsError,
        });

        /*
         * Do not break the actual business operation just
         * because notification preferences could not be read.
         *
         * Fall through and create the notification.
         */
      } else if (settings) {
        const preference = settings[type];

        /*
         * Only explicitly false disables a notification.
         *
         * This means:
         *   true      -> send
         *   false     -> don't send
         *   undefined -> send
         *
         * The undefined case protects us if a new notification
         * type is introduced before the settings table is
         * updated.
         */
        if (preference === false) {
          console.log("NOTIFICATION SKIPPED BY USER PREFERENCE:", {
            userId,
            role: recipient.role,
            type,
          });

          return {
            success: true,
            skipped: true,
            reason: "disabled_by_user_preference",
          };
        }
      }
    }

    /*
     * =======================================================
     * CREATE NOTIFICATION
     * =======================================================
     */

    console.log("CREATE NOTIFICATION DEBUG:", {
      userId,
      role: recipient.role,
      title,
      type,
      shipmentId,
      paymentId,
      supportTicketId,
    });

    const { data, error } = await adminSupabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        shipment_id: shipmentId,
        payment_id: paymentId,
        support_ticket_id: supportTicketId,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("CREATE NOTIFICATION ERROR:", error);

      return {
        error: error.message,
      };
    }

    console.log("CREATED NOTIFICATION:", data);

    /*
     * Revalidate all role notification pages.
     *
     * The notification belongs to the recipient, so we
     * don't need to know the caller's role here.
     */
    revalidatePath("/admin/notifications");
    revalidatePath("/driver/notifications");
    revalidatePath("/customer/notifications");

    return {
      success: true,
      notification: data,
    };
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    return {
      error: "Unable to create notification.",
    };
  }
}

/**
 * Get the current user's notifications.
 */

export async function getNotifications() {
  try {
    const { user, profile, supabase } = await requireRole([
      "admin",
      "driver",
      "customer",
    ]);

    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
    id,
    title,
    message,
    type,
    shipment_id,
    payment_id,
    support_ticket_id,
    is_read,
    created_at,

    shipments:shipment_id (
      tracking_number
    ),

    support_tickets:support_ticket_id (
      id,
      ticket_number,
      subject
    )
  `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("GET NOTIFICATIONS ERROR:", error);

      return {
        error: error.message,
        notifications: [],
        role: profile.role,
      };
    }

    return {
      notifications: data ?? [],
      role: profile.role,
    };
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return {
      error: "Unable to load notifications.",
      notifications: [],
    };
  }
}

/**
 * Get unread notification count for the current user.
 */
export async function getUnreadNotificationCount() {
  try {
    const { user, supabase } = await requireRole([
      "admin",
      "driver",
      "customer",
    ]);

    const { count, error } = await supabase
      .from("notifications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("GET UNREAD NOTIFICATION COUNT ERROR:", error);

      return {
        count: 0,
      };
    }

    return {
      count: count ?? 0,
    };
  } catch (error) {
    console.error("GET UNREAD NOTIFICATION COUNT ERROR:", error);

    return {
      count: 0,
    };
  }
}

/**
 * Mark one notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { user, supabase } = await requireRole([
      "admin",
      "driver",
      "customer",
    ]);

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("MARK NOTIFICATION READ ERROR:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/notifications");

    return {
      success: true,
    };
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return {
      error: "Unable to mark notification as read.",
    };
  }
}

/**
 * Mark all notifications belonging to the current user as read.
 */
export async function markAllNotificationsAsRead() {
  try {
    const { user, supabase } = await requireRole([
      "admin",
      "driver",
      "customer",
    ]);

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/notifications");

    return {
      success: true,
    };
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);

    return {
      error: "Unable to mark notifications as read.",
    };
  }
}

export async function getAdminUserIds() {
  try {
    await requireRole(["admin", "driver", "customer"]);

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("users")
      .select("id")
      .eq("role", "admin");

    if (error) {
      console.error("GET ADMIN USER IDS ERROR:", error);
      return [];
    }

    return (data ?? []).map((admin) => admin.id);
  } catch (error) {
    console.error("GET ADMIN USER IDS ERROR:", error);
    return [];
  }
}
