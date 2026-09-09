"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createShipmentSchema } from "@/lib/validations";
import { calculateShipmentPrice } from "@/lib/pricing/calculate-shipment-price";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createNotification,
  type NotificationType,
  getAdminUserIds,
} from "@/lib/actions/notifications";
import type { ShipmentStatus } from "@/types/app";

/* =========================================================
   TYPES
========================================================= */

type ActionState = {
  error?: string;
  success?: string;
  trackingNumber?: string;
};

/* =========================================================
   DRIVER STATUS TRANSITIONS
=========================================================

   Driver-controlled lifecycle:

   approved
      ↓
   picked_up
      ↓
   in_transit
      ↓
   arrived_at_warehouse
      ↓
   out_for_delivery
      ↓ 
    arrived_at_delivery_destination
      ↓
   delivered (POD only)

   "pending" -> "approved" is admin-controlled.

   "cancelled" is not driver-controlled.

========================================================= */

const DRIVER_STATUS_TRANSITIONS: Partial<
  Record<ShipmentStatus, ShipmentStatus>
> = {
  approved: "picked_up",
  picked_up: "in_transit",
  in_transit: "arrived_at_warehouse",
  arrived_at_warehouse: "out_for_delivery",
  out_for_delivery: "arrived_at_delivery_destination",
};

/* =========================================================
   CREATE SHIPMENT
   Customer only
========================================================= */

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

  /* -------------------------------------------------------
     Calculate shipment price
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     1. Create shipment
  ------------------------------------------------------- */

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
    .select("id, tracking_number, price, status")
    .single();

  if (shipmentError || !shipment) {
    console.error("CREATE SHIPMENT ERROR:", shipmentError);

    return {
      error: shipmentError?.message ?? "Failed to create shipment.",
    };
  }

  /* -------------------------------------------------------
     2. Create pending payment
  ------------------------------------------------------- */

  const { error: paymentError } = await supabase.from("payments").insert({
    customer_id: user.id,
    shipment_id: shipment.id,
    amount: price,
    payment_status: "pending",
    payment_method: null,
  });

  if (paymentError) {
    console.error("CREATE PAYMENT ERROR:", paymentError);

    await supabase
      .from("shipments")
      .delete()
      .eq("id", shipment.id)
      .eq("customer_id", user.id);

    return {
      error: `Shipment was not created because payment setup failed: ${paymentError.message}`,
    };
  }

  /* -------------------------------------------------------
     3. Create initial tracking event
  ------------------------------------------------------- */

  const { error: eventError } = await supabase.from("shipment_events").insert({
    shipment_id: shipment.id,
    status: "pending",
    note: "Shipment created and is waiting for admin approval.",
    created_by: user.id,
  });

  if (eventError) {
    console.error("CREATE INITIAL SHIPMENT EVENT ERROR:", eventError);

    /*
     * Avoid leaving an apparently valid shipment without
     * its initial tracking history.
     */
    await supabase
      .from("payments")
      .delete()
      .eq("shipment_id", shipment.id)
      .eq("customer_id", user.id);

    await supabase
      .from("shipments")
      .delete()
      .eq("id", shipment.id)
      .eq("customer_id", user.id);

    return {
      error:
        "Shipment could not be created because its tracking history could not be initialized.",
    };
  }

  /* -------------------------------------------------------
     4. Notify customer
  ------------------------------------------------------- */

  const customerNotification = await createNotification({
    userId: user.id,
    title: "Shipment created",
    message: `Your shipment ${shipment.tracking_number} has been created successfully.`,
    type: "shipment_created",
    shipmentId: shipment.id,
  });

  if (customerNotification.error) {
    console.error(
      "CUSTOMER SHIPMENT CREATED NOTIFICATION ERROR:",
      customerNotification.error,
    );
  }

  /* -------------------------------------------------------
     5. Notify all active admins
  ------------------------------------------------------- */

  const adminIds = await getAdminUserIds();

  await Promise.all(
    adminIds.map(async (adminId) => {
      const adminNotification = await createNotification({
        userId: adminId,
        title: "New shipment created",
        message: `A new shipment ${shipment.tracking_number} has been created by a customer.`,
        type: "shipment_created",
        shipmentId: shipment.id,
      });

      if (adminNotification.error) {
        console.error(
          `ADMIN SHIPMENT CREATED NOTIFICATION ERROR (${adminId}):`,
          adminNotification.error,
        );
      }
    }),
  );

  /* -------------------------------------------------------
     6. Refresh pages
  ------------------------------------------------------- */

  revalidatePath("/customer");
  revalidatePath("/customer/payments");
  revalidatePath("/customer/history");

  revalidatePath("/admin");
  revalidatePath("/admin/shipments");
  revalidatePath("/admin/notifications");

  redirect(`/customer/shipments/${shipment.tracking_number}?created=true`);
}

/* =========================================================
   CANCEL SHIPMENT
   Customer only
========================================================= */

export async function cancelShipment(shipmentId: string) {
  const { user, supabase } = await requireRole(["customer"]);

  /* -------------------------------------------------------
     1. Find shipment
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     2. Verify ownership
  ------------------------------------------------------- */

  if (shipment.customer_id !== user.id) {
    console.error("SHIPMENT OWNERSHIP ERROR:", {
      shipmentCustomerId: shipment.customer_id,
      currentUserId: user.id,
    });

    return {
      error: "You are not authorized to cancel this shipment.",
    };
  }

  /* -------------------------------------------------------
     3. Only pending/approved can be cancelled
  ------------------------------------------------------- */

  if (shipment.status !== "pending" && shipment.status !== "approved") {
    return {
      error: "This shipment can no longer be cancelled.",
    };
  }

  /* -------------------------------------------------------
     4. Cancel shipment
  ------------------------------------------------------- */

  const { data: updatedShipment, error: updateError } = await supabase
    .from("shipments")
    .update({
      status: "cancelled",
    })
    .eq("id", shipmentId)
    .eq("customer_id", user.id)
    .in("status", ["pending", "approved"])
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

  /* -------------------------------------------------------
     5. Create cancellation tracking event
  ------------------------------------------------------- */

  const { error: eventError } = await supabase.from("shipment_events").insert({
    shipment_id: shipmentId,
    status: "cancelled",
    note: "Shipment was cancelled by the customer.",
    created_by: user.id,
  });

  if (eventError) {
    console.error("CREATE CANCELLATION EVENT ERROR:", eventError);

    /*
     * The shipment is already cancelled. Do not tell the
     * customer that cancellation failed.
     */
    return {
      success: true,
      warning:
        "Shipment was cancelled, but the tracking history could not be updated.",
    };
  }

  /* -------------------------------------------------------
     6. Notify customer
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     7. Notify admins
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     8. Refresh pages
  ------------------------------------------------------- */

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

/* =========================================================
   UPDATE SHIPMENT STATUS
   Driver only
========================================================= */

export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  note?: string,
) {
  const { supabase, user } = await requireRole(["driver"]);

  /* -------------------------------------------------------
     1. Validate requested status
  ------------------------------------------------------- */

  const allowedDriverStatuses: ShipmentStatus[] = [
    "picked_up",
    "in_transit",
    "arrived_at_warehouse",
    "out_for_delivery",
    "arrived_at_delivery_destination",
  ];

  if (!allowedDriverStatuses.includes(status)) {
    return {
      error: "This shipment status cannot be changed by the driver.",
    };
  }

  /* -------------------------------------------------------
     2. Find driver and current location
  ------------------------------------------------------- */

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select(
      `
        id,
        current_lat,
        current_lng,
        last_location_update
      `,
    )
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    console.error("DRIVER LOOKUP ERROR:", driverError);

    return {
      error: "Driver account not found.",
    };
  }

  /* -------------------------------------------------------
     3. Find assigned shipment
  ------------------------------------------------------- */

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select(
      `
          id,
          driver_id,
          customer_id,
          status,
          tracking_number
        `,
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

  /* -------------------------------------------------------
     4. Validate transition
  ------------------------------------------------------- */

  const expectedNextStatus =
    DRIVER_STATUS_TRANSITIONS[shipment.status as ShipmentStatus];

  if (!expectedNextStatus) {
    return {
      error: `Shipment cannot be moved forward from "${shipment.status.replaceAll(
        "_",
        " ",
      )}".`,
    };
  }

  if (status !== expectedNextStatus) {
    return {
      error: `Invalid shipment status transition. The next status should be "${expectedNextStatus.replaceAll(
        "_",
        " ",
      )}".`,
    };
  }

  /* -------------------------------------------------------
     5. Capture driver coordinates
  ------------------------------------------------------- */

  const latitude =
    driver.current_lat != null ? Number(driver.current_lat) : null;

  const longitude =
    driver.current_lng != null ? Number(driver.current_lng) : null;

  const hasLocation =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  /* -------------------------------------------------------
     6. Update shipment using current status guard
  ------------------------------------------------------- */

  const { data: updatedShipment, error: updateError } = await supabase
    .from("shipments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shipmentId)
    .eq("driver_id", driver.id)
    .eq("status", shipment.status)
    .select(
      `
          id,
          status,
          tracking_number,
          customer_id
        `,
    )
    .single();

  if (updateError || !updatedShipment) {
    console.error("UPDATE SHIPMENT STATUS ERROR:", {
      shipmentId,
      requestedStatus: status,
      currentStatus: shipment.status,
      driverId: driver.id,
      error: updateError,
    });

    return {
      error:
        updateError?.message ??
        "Unable to update shipment status. The shipment may have already been updated.",
    };
  }

  /* -------------------------------------------------------
     7. Create tracking event
  ------------------------------------------------------- */

  const { error: eventError } = await supabase.from("shipment_events").insert({
    shipment_id: shipmentId,
    status,
    note:
      note?.trim() ||
      `Shipment status changed to ${status.replaceAll("_", " ")}.`,
    created_by: user.id,
    lat: hasLocation ? latitude : null,
    lng: hasLocation ? longitude : null,
  });

  if (eventError) {
    console.error("CREATE SHIPMENT EVENT ERROR:", {
      shipmentId,
      status,
      error: eventError,
      code: eventError.code,
      message: eventError.message,
      details: eventError.details,
      hint: eventError.hint,
    });

    /*
     * Shipment status was successfully updated.
     * Do not tell the driver that the status update failed.
     */
  }

  /* -------------------------------------------------------
     8. Notification configuration
  ------------------------------------------------------- */

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

    arrived_at_warehouse: {
      customerTitle: "Shipment arrived at warehouse",
      customerMessage: `Your shipment ${shipment.tracking_number} has arrived at the warehouse.`,
      adminTitle: "Shipment arrived at warehouse",
      adminMessage: `Shipment ${shipment.tracking_number} has arrived at the warehouse.`,
      type: "shipment_arrived_at_warehouse",
    },

    out_for_delivery: {
      customerTitle: "Out for delivery",
      customerMessage: `Your shipment ${shipment.tracking_number} is out for delivery.`,
      adminTitle: "Shipment out for delivery",
      adminMessage: `Shipment ${shipment.tracking_number} is out for delivery.`,
      type: "shipment_out_for_delivery",
    },
    arrived_at_delivery_destination: {
      customerTitle: "Out for delivery",
      customerMessage: `Your shipment ${shipment.tracking_number} has arrived at delivery destination.`,
      adminTitle: "Shipment arrived at delivery destination",
      adminMessage: `Shipment ${shipment.tracking_number} has arrived at delivery destination.`,
      type: "shipment_arrived_at_delivery_destination",
    },
  };

  const notification = notificationMap[status];

  if (notification) {
    /* -----------------------------------------------------
       Customer notification
    ----------------------------------------------------- */

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

    /* -----------------------------------------------------
       Admin notifications
    ----------------------------------------------------- */

    const adminIds = await getAdminUserIds();

    await Promise.all(
      adminIds.map(async (adminId) => {
        const adminResult = await createNotification({
          userId: adminId,
          title: notification.adminTitle,
          message: notification.adminMessage,
          type: notification.type,
          shipmentId: shipment.id,
        });

        if (adminResult.error) {
          console.error(
            `ADMIN NOTIFICATION ERROR (${adminId}):`,
            adminResult.error,
          );
        }
      }),
    );
  }

  /* -------------------------------------------------------
     9. Refresh pages
  ------------------------------------------------------- */

  revalidatePath("/driver");
  revalidatePath("/driver/deliveries");
  revalidatePath(`/driver/deliveries/${shipmentId}`);

  revalidatePath("/admin");
  revalidatePath("/admin/shipments");
  revalidatePath("/admin/tracking");
  revalidatePath("/admin/notifications");

  revalidatePath("/customer");
  revalidatePath("/customer/track");
  revalidatePath(`/customer/shipments/${shipment.tracking_number}`);
  revalidatePath("/customer/notifications");

  return {
    success: true,
  };
}

/* =========================================================
   UPLOAD PROOF OF DELIVERY
   Driver only
========================================================= */

export async function uploadProofOfDelivery(formData: FormData) {
  const { supabase, user } = await requireRole(["driver"]);

  const shipmentId = formData.get("shipmentId");
  const file = formData.get("file");

  /* -------------------------------------------------------
     1. Validate form data
  ------------------------------------------------------- */

  if (typeof shipmentId !== "string" || !shipmentId.trim()) {
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

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    return {
      error: "The proof-of-delivery image must be smaller than 5MB.",
    };
  }

  /* -------------------------------------------------------
     2. Validate file type
  ------------------------------------------------------- */

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      error: "Only JPG, PNG, and WebP images are allowed.",
    };
  }

  /* -------------------------------------------------------
     3. Find driver and current location
  ------------------------------------------------------- */

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select(
      `
        id,
        current_lat,
        current_lng
      `,
    )
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    console.error("DRIVER LOOKUP ERROR:", driverError);

    return {
      error: "Driver account not found.",
    };
  }

  /* -------------------------------------------------------
     4. Find assigned shipment
  ------------------------------------------------------- */

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select(
      `
          id,
          driver_id,
          customer_id,
          tracking_number,
          status,
          proof_of_delivery_url
        `,
    )
    .eq("id", shipmentId.trim())
    .eq("driver_id", driver.id)
    .single();

  if (shipmentError || !shipment) {
    console.error("SHIPMENT LOOKUP ERROR:", shipmentError);

    return {
      error: "Shipment not found or is not assigned to you.",
    };
  }

  /* -------------------------------------------------------
     5. POD is only allowed for out_for_delivery
  ------------------------------------------------------- */

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

  if (shipment.status !== "arrived_at_delivery_destination") {
    return {
      error:
        "Proof of delivery can only be uploaded when the shipment is out for delivery.",
    };
  }

  /* -------------------------------------------------------
     6. Capture driver coordinates
  ------------------------------------------------------- */

  const latitude =
    driver.current_lat != null ? Number(driver.current_lat) : null;

  const longitude =
    driver.current_lng != null ? Number(driver.current_lng) : null;

  const hasLocation =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  /* -------------------------------------------------------
     7. Generate unique storage path
  ------------------------------------------------------- */

  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";

  const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(fileExtension)
    ? fileExtension
    : "jpg";

  const path = `${shipmentId.trim()}/${crypto.randomUUID()}.${safeExtension}`;

  /* -------------------------------------------------------
     8. Upload proof
  ------------------------------------------------------- */

  const { error: uploadError } = await supabase.storage
    .from("proof-of-delivery")
    .upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("PROOF UPLOAD ERROR:", uploadError);

    return {
      error: uploadError.message,
    };
  }

  /* -------------------------------------------------------
     9. Mark shipment delivered
     
     The status condition prevents two simultaneous requests
     from both successfully completing the shipment.
  ------------------------------------------------------- */

  const { data: updatedShipment, error: updateError } = await supabase
    .from("shipments")
    .update({
      proof_of_delivery_url: path,
      status: "delivered",
      updated_at: new Date().toISOString(),
    })
    .eq("id", shipmentId.trim())
    .eq("driver_id", driver.id)
    .eq("status", "arrived_at_delivery_destination")
    .select(
      `
          id,
          status,
          tracking_number,
          customer_id
        `,
    )
    .maybeSingle();

  if (updateError || !updatedShipment) {
    console.error("UPDATE DELIVERY ERROR:", {
      shipmentId,
      driverId: driver.id,
      error: updateError,
    });

    /* Remove uploaded file if delivery update failed. */
    await supabase.storage.from("proof-of-delivery").remove([path]);

    return {
      error:
        updateError?.message ??
        "Unable to complete delivery. The shipment may have already been updated.",
    };
  }

  /* -------------------------------------------------------
     10. Create delivered tracking event
  ------------------------------------------------------- */

  const { error: eventError } = await supabase.from("shipment_events").insert({
    shipment_id: shipmentId.trim(),
    status: "delivered",
    note: "Proof of delivery uploaded.",
    created_by: user.id,
    lat: hasLocation ? latitude : null,
    lng: hasLocation ? longitude : null,
  });

  if (eventError) {
    console.error("DELIVERY EVENT ERROR:", {
      shipmentId,
      error: eventError,
    });

    /*
     * Delivery is already complete.
     * Do not report delivery itself as failed.
     */
  }

  /* -------------------------------------------------------
     11. Notify customer
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     12. Notify admins
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     13. Refresh relevant pages
  ------------------------------------------------------- */

  revalidatePath("/driver");
  revalidatePath("/driver/deliveries");
  revalidatePath(`/driver/deliveries/${shipmentId}`);

  revalidatePath("/customer");
  revalidatePath("/customer/track");
  revalidatePath("/customer/notifications");

  revalidatePath(`/customer/shipments/${shipment.tracking_number}`);

  revalidatePath("/admin");
  revalidatePath("/admin/shipments");
  revalidatePath("/admin/tracking");
  revalidatePath("/admin/notifications");

  return {
    success: true,
  };
}
