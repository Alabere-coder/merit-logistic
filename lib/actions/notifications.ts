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
  | "shipment_out_for_delivery"
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
}: CreateNotificationInput) {
  try {
    await requireRole(["admin", "driver", "customer"]);

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type,
        shipment_id: shipmentId,
        payment_id: paymentId,
        is_read: false,
      });

    if (error) {
      console.error("CREATE NOTIFICATION ERROR:", error);

      return {
        error: error.message,
      };
    }

    revalidatePath("/customer/notifications");
    revalidatePath("/driver/notifications");
    revalidatePath("/admin/notifications");

    return {
      success: true,
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
      .select(`
        id,
        title,
        message,
        type,
        shipment_id,
        payment_id,
        is_read,
        created_at,
        shipments:shipment_id (
          tracking_number
        )
      `)
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
export async function markNotificationAsRead(
  notificationId: string,
) {
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

    revalidatePath("/customer/notifications");
    revalidatePath("/driver/notifications");
    revalidatePath("/admin/notifications");

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

    revalidatePath("/customer/notifications");
    revalidatePath("/driver/notifications");
    revalidatePath("/admin/notifications");

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