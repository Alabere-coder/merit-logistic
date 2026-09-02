"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createShipmentSchema } from "@/lib/validations";
// import { estimateShippingCost } from "@/lib/constants";
import { calculateShipmentPrice } from "@/lib/pricing/calculate-shipment-price";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createNotification,
  type NotificationType,
  getAdminUserIds,
} from "@/lib/actions/notifications";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ShipmentStatus } from "@/types/app";

type ActionState = {
  error?: string;
  success?: string;
  trackingNumber?: string;
};

export async function createShipment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, supabase } = await requireRole(["customer"]);

  const parsed = createShipmentSchema.safeParse({
    senderName: formData.get("senderName"),
    senderPhone: formData.get("senderPhone"),
    receiverName: formData.get("receiverName"),
    receiverPhone: formData.get("receiverPhone"),
    pickupAddress: formData.get("pickupAddress"),
    deliveryAddress: formData.get("deliveryAddress"),
    packageType: formData.get("packageType"),
    weightKg: formData.get("weightKg"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // const price = estimateShippingCost(
  //   parsed.data.weightKg,
  //   parsed.data.packageType,
  // );

  const pricingResult = await calculateShipmentPrice({
    weightKg: parsed.data.weightKg,
    isFragile: parsed.data.packageType === "fragile",
    isExpress: false,
  });

  if (!pricingResult.success) {
    return {
      error: pricingResult.error,
    };
  }

  const price = pricingResult.pricing.deliveryFee;

  // 1. Create shipment
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .insert({
      customer_id: user.id,
      sender_name: parsed.data.senderName,
      sender_phone: parsed.data.senderPhone,
      receiver_name: parsed.data.receiverName,
      receiver_phone: parsed.data.receiverPhone,
      pickup_address: parsed.data.pickupAddress,
      delivery_address: parsed.data.deliveryAddress,
      package_type: parsed.data.packageType,
      weight_kg: parsed.data.weightKg,
      price,
    })
    .select("id, tracking_number, price")
    .single();

  if (shipmentError || !shipment) {
    console.error("CREATE SHIPMENT ERROR:", shipmentError);

    return {
      error: shipmentError?.message ?? "Failed to create shipment.",
    };
  }

  // 2. Create pending payment
  const { error: paymentError } = await supabase.from("payments").insert({
    customer_id: user.id,
    shipment_id: shipment.id,
    amount: price,
    payment_status: "pending",
    payment_method: null,
  });

  if (paymentError) {
    console.error("CREATE PAYMENT ERROR:", paymentError);

    // Optional cleanup so we don't leave an unpaid shipment
    await supabase
      .from("shipments")
      .delete()
      .eq("id", shipment.id)
      .eq("customer_id", user.id);

    return {
      error: `Shipment was not created because payment setup failed: ${paymentError.message}`,
    };
  }

  await createNotification({
    userId: user.id,
    title: "Shipment created",
    message: `Your shipment ${shipment.tracking_number} has been created successfully.`,
    type: "shipment_created",
    shipmentId: shipment.id,
  });

  const adminIds = await getAdminUserIds();

  await Promise.all(
    adminIds.map((adminId) =>
      createNotification({
        userId: adminId,
        title: "New shipment created",
        message: `A new shipment ${shipment.tracking_number} has been created by a customer.`,
        type: "shipment_created",
        shipmentId: shipment.id,
      }),
    ),
  );

  revalidatePath("/customer");
  revalidatePath("/customer/payments");

  redirect(`/customer/shipments/${shipment.tracking_number}?created=true`);
}

// --------------------------------------------------
// CANCEL SHIPMENT ACTIONS
// --------------------------------------------------

export async function cancelShipment(shipmentId: string) {
  const { user, supabase } = await requireRole(["customer"]);

  // --------------------------------------------------
  // 1. Find shipment
  // --------------------------------------------------

  const { data: shipment, error: fetchError } = await supabase
    .from("shipments")
    .select("id, status, tracking_number, customer_id")
    .eq("id", shipmentId)
    .maybeSingle();

  if (fetchError || !shipment) {
    console.error("FIND SHIPMENT ERROR:", {
      shipmentId,
      userId: user.id,
      error: fetchError,
    });

    return {
      error: "Shipment not found.",
    };
  }

  // --------------------------------------------------
  // 2. Verify ownership
  // --------------------------------------------------

  if (shipment.customer_id !== user.id) {
    console.error("SHIPMENT OWNERSHIP ERROR:", {
      shipmentCustomerId: shipment.customer_id,
      currentUserId: user.id,
    });

    return {
      error: "You are not authorized to cancel this shipment.",
    };
  }

  // --------------------------------------------------
  // 3. Check cancellation status
  // --------------------------------------------------

  if (!["pending", "approved"].includes(shipment.status)) {
    return {
      error: "This shipment can no longer be cancelled.",
    };
  }

  // --------------------------------------------------
  // 4. Cancel shipment
  // --------------------------------------------------

  const { data: updatedShipment, error: updateError } = await supabase
    .from("shipments")
    .update({
      status: "cancelled",
    })
    .eq("id", shipmentId)
    .eq("customer_id", user.id)
    .select("id, status, tracking_number")
    .maybeSingle();

  if (updateError || !updatedShipment) {
    console.error("CANCEL SHIPMENT ERROR:", {
      shipmentId,
      userId: user.id,
      error: updateError,
    });

    return {
      error:
        updateError?.message ??
        "Unable to cancel shipment. The shipment may have already been updated.",
    };
  }

  console.log("SHIPMENT CANCELLED:", updatedShipment);

  // --------------------------------------------------
  // 5. Create tracking event
  // --------------------------------------------------

  const { error: eventError } = await supabase.from("shipment_events").insert({
    shipment_id: shipmentId,
    status: "cancelled",
    note: "Shipment was cancelled by the customer.",
    created_by: user.id,
  });

  if (eventError) {
    console.error("CREATE CANCELLATION EVENT ERROR:", eventError);

    return {
      error:
        "Shipment was cancelled, but the tracking history could not be updated.",
    };
  }

  // --------------------------------------------------
  // 6. Notify customer
  // --------------------------------------------------

  const customerNotification = await createNotification({
    userId: user.id,
    title: "Shipment cancelled",
    message: `Your shipment ${updatedShipment.tracking_number} has been cancelled.`,
    type: "shipment_cancelled",
    shipmentId: updatedShipment.id,
  });

  if (customerNotification.error) {
    console.error(
      "CUSTOMER CANCELLATION NOTIFICATION ERROR:",
      customerNotification.error,
    );
  }

  // --------------------------------------------------
  // 7. Notify all active admins
  // --------------------------------------------------

  const adminIds = await getAdminUserIds();

  await Promise.all(
    adminIds.map(async (adminId) => {
      const adminNotification = await createNotification({
        userId: adminId,
        title: "Shipment cancelled",
        message: `Shipment ${updatedShipment.tracking_number} has been cancelled by the customer.`,
        type: "shipment_cancelled",
        shipmentId: updatedShipment.id,
      });

      if (adminNotification.error) {
        console.error(
          `ADMIN CANCELLATION NOTIFICATION ERROR (${adminId}):`,
          adminNotification.error,
        );
      }
    }),
  );

  // --------------------------------------------------
  // 8. Refresh pages
  // --------------------------------------------------

  revalidatePath("/customer");
  revalidatePath("/customer/history");
  revalidatePath("/customer/notifications");

  revalidatePath(`/customer/shipments/${updatedShipment.tracking_number}`);

  revalidatePath("/admin");
  revalidatePath("/admin/shipments");
  revalidatePath("/admin/notifications");

  return {
    success: true,
  };
}

/** Driver updates the status of a shipment assigned to them. */
/** Driver updates the status of a shipment assigned to them. */
export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  note?: string,
) {
  const { supabase, user } = await requireRole(["driver"]);

  // Get the driver's database ID
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    console.error("DRIVER LOOKUP ERROR:", driverError);

    return {
      error: "Driver account not found.",
    };
  }

  // Make sure this shipment belongs to this driver
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, driver_id, customer_id, status, tracking_number")
    .eq("id", shipmentId)
    .eq("driver_id", driver.id)
    .single();

  if (shipmentError || !shipment) {
    console.error("SHIPMENT LOOKUP ERROR:", shipmentError);

    return {
      error: "Shipment not found or is not assigned to you.",
    };
  }

  // Update shipment status
  const { error: updateError } = await supabase
    .from("shipments")
    .update({
      status,
    })
    .eq("id", shipmentId)
    .eq("driver_id", driver.id);

  if (updateError) {
    console.error("UPDATE SHIPMENT STATUS ERROR:", updateError);

    return {
      error: updateError.message,
    };
  }

  // ALWAYS create a tracking event
  const { error: eventError } = await supabase.from("shipment_events").insert({
    shipment_id: shipmentId,
    status,
    note: note ?? `Shipment status changed to ${status.replaceAll("_", " ")}`,
    created_by: user.id,
  });

  if (eventError) {
    console.error("CREATE SHIPMENT EVENT ERROR:", eventError);

    return {
      error: `Shipment was updated, but tracking history could not be created: ${eventError.message}`,
    };
  }

  const notificationMap: Partial<
    Record<
      ShipmentStatus,
      {
        customerTitle: string;
        customerMessage: string;
        adminTitle: string;
        adminMessage: string;
        type: NotificationType;
      }
    >
  > = {
    picked_up: {
      customerTitle: "Shipment picked up",
      customerMessage: `Your shipment ${shipment.tracking_number} has been picked up.`,
      adminTitle: "Shipment picked up",
      adminMessage: `Shipment ${shipment.tracking_number} has been picked up by the driver.`,
      type: "shipment_picked_up",
    },

    in_transit: {
      customerTitle: "Shipment in transit",
      customerMessage: `Your shipment ${shipment.tracking_number} is now in transit.`,
      adminTitle: "Shipment in transit",
      adminMessage: `Shipment ${shipment.tracking_number} is now in transit.`,
      type: "shipment_in_transit",
    },

    out_for_delivery: {
      customerTitle: "Out for delivery",
      customerMessage: `Your shipment ${shipment.tracking_number} is out for delivery.`,
      adminTitle: "Shipment out for delivery",
      adminMessage: `Shipment ${shipment.tracking_number} is out for delivery.`,
      type: "shipment_out_for_delivery",
    },

    delivered: {
      customerTitle: "Shipment delivered",
      customerMessage: `Your shipment ${shipment.tracking_number} has been delivered.`,
      adminTitle: "Shipment delivered",
      adminMessage: `Shipment ${shipment.tracking_number} has been delivered.`,
      type: "shipment_delivered",
    },
  };

  const notification = notificationMap[status];

  if (notification) {
    // =========================
    // CUSTOMER NOTIFICATION
    // =========================

    const customerResult = await createNotification({
      userId: shipment.customer_id,
      title: notification.customerTitle,
      message: notification.customerMessage,
      type: notification.type,
      shipmentId: shipment.id,
    });

    if (customerResult.error) {
      console.error("CUSTOMER NOTIFICATION ERROR:", customerResult.error);
    }

    // =========================
    // ADMIN NOTIFICATION
    // =========================

    const adminSupabase = createAdminClient();

    const { data: admins, error: adminsError } = await adminSupabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .eq("is_active", true);

    if (adminsError) {
      console.error("ADMIN LOOKUP ERROR:", adminsError);
    } else {
      console.log("ADMINS FOUND:", admins);

      for (const admin of admins ?? []) {
        const adminResult = await createNotification({
          userId: admin.id,
          title: notification.adminTitle,
          message: notification.adminMessage,
          type: notification.type,
          shipmentId: shipment.id,
        });

        console.log("ADMIN NOTIFICATION RESULT:", admin.id, adminResult);
      }
    }
  }

  // Refresh pages
  revalidatePath("/driver");
  revalidatePath("/driver/deliveries");
  revalidatePath(`/driver/deliveries/${shipmentId}`);
  revalidatePath("/admin/shipments");

  return {
    success: true,
  };
}

/** Driver uploads proof of delivery (image) and marks the shipment delivered. */

export async function uploadProofOfDelivery(formData: FormData) {
  const { supabase, user } = await requireRole(["driver"]);

  const shipmentId = formData.get("shipmentId");
  const file = formData.get("file");

  // --------------------------------------------------
  // 1. Validate form data
  // --------------------------------------------------

  if (typeof shipmentId !== "string") {
    return {
      error: "Invalid shipment ID.",
    };
  }

  if (!(file instanceof File)) {
    return {
      error: "Please select a proof-of-delivery image.",
    };
  }

  if (file.size === 0) {
    return {
      error: "The selected file is empty.",
    };
  }

  // Optional but recommended:
  // Prevent very large uploads.
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  if (file.size > MAX_FILE_SIZE) {
    return {
      error: "The proof-of-delivery image must be smaller than 5MB.",
    };
  }

  // --------------------------------------------------
  // 2. Find the driver
  // --------------------------------------------------

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    console.error("DRIVER LOOKUP ERROR:", driverError);

    return {
      error: "Driver account not found.",
    };
  }

  // --------------------------------------------------
  // 3. Verify shipment belongs to this driver
  // --------------------------------------------------

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select(
      "id, driver_id, customer_id, tracking_number, status, proof_of_delivery_url",
    )
    .eq("id", shipmentId)
    .eq("driver_id", driver.id)
    .single();

  if (shipmentError || !shipment) {
    console.error("SHIPMENT LOOKUP ERROR:", shipmentError);

    return {
      error: "Shipment not found or is not assigned to you.",
    };
  }

  // --------------------------------------------------
  // 4. Make sure shipment isn't already completed
  // --------------------------------------------------

  if (shipment.status === "delivered") {
    return {
      error: "This shipment has already been delivered.",
    };
  }

  if (shipment.status === "cancelled") {
    return {
      error: "This shipment has been cancelled.",
    };
  }

  // --------------------------------------------------
  // 5. Validate file type
  // --------------------------------------------------

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      error: "Only JPG, PNG, and WebP images are allowed.",
    };
  }

  // --------------------------------------------------
  // 6. Upload proof of delivery
  // --------------------------------------------------

  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";

  const path = `${shipmentId}/${Date.now()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("proof-of-delivery")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("PROOF UPLOAD ERROR:", uploadError);

    return {
      error: uploadError.message,
    };
  }

  // --------------------------------------------------
  // 7. Update shipment to delivered
  // --------------------------------------------------

  const { error: updateError } = await supabase
    .from("shipments")
    .update({
      proof_of_delivery_url: path,
      status: "delivered",
    })
    .eq("id", shipmentId)
    .eq("driver_id", driver.id);

  if (updateError) {
    console.error("UPDATE DELIVERY ERROR:", updateError);

    // Remove uploaded file if database update failed.
    await supabase.storage.from("proof-of-delivery").remove([path]);

    return {
      error: updateError.message,
    };
  }

  // --------------------------------------------------
  // 8. Create shipment tracking event
  // --------------------------------------------------

  const { error: eventError } = await supabase.from("shipment_events").insert({
    shipment_id: shipmentId,
    status: "delivered",
    note: "Proof of delivery uploaded.",
    created_by: user.id,
  });

  if (eventError) {
    console.error("DELIVERY EVENT ERROR:", eventError);

    return {
      error: `Delivery was completed, but tracking history could not be updated: ${eventError.message}`,
    };
  }

  // --------------------------------------------------
  // 9. Notify customer
  // --------------------------------------------------

  const customerNotification = await createNotification({
    userId: shipment.customer_id,
    title: "Shipment delivered",
    message: `Your shipment ${shipment.tracking_number} has been delivered successfully.`,
    type: "shipment_delivered",
    shipmentId: shipment.id,
  });

  if (customerNotification.error) {
    console.error(
      "CUSTOMER DELIVERY NOTIFICATION ERROR:",
      customerNotification.error,
    );
  }

  // --------------------------------------------------
  // 10. Notify all active admins
  // --------------------------------------------------

  const adminIds = await getAdminUserIds();

  await Promise.all(
    adminIds.map(async (adminId) => {
      const adminNotification = await createNotification({
        userId: adminId,
        title: "Shipment delivered",
        message: `Shipment ${shipment.tracking_number} has been delivered successfully.`,
        type: "shipment_delivered",
        shipmentId: shipment.id,
      });

      if (adminNotification.error) {
        console.error(
          `ADMIN DELIVERY NOTIFICATION ERROR (${adminId}):`,
          adminNotification.error,
        );
      }
    }),
  );

  // --------------------------------------------------
  // 11. Refresh relevant pages
  // --------------------------------------------------

  revalidatePath("/driver");
  revalidatePath("/driver/deliveries");
  revalidatePath(`/driver/deliveries/${shipmentId}`);

  revalidatePath("/customer");
  revalidatePath("/customer/notifications");

  revalidatePath(`/customer/shipments/${shipment.tracking_number}`);

  revalidatePath("/admin");
  revalidatePath("/admin/shipments");
  revalidatePath("/admin/notifications");

  return {
    success: true,
  };
}
