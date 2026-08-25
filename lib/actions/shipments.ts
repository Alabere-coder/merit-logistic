"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createShipmentSchema } from "@/lib/validations";
import { estimateShippingCost } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createNotification,
  type NotificationType,
  getAdminUserIds,
} from "@/lib/actions/notifications";
import type { ShipmentStatus } from "@/types/app";


type ActionState = { error?: string; success?: string; trackingNumber?: string };

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

  const price = estimateShippingCost(
    parsed.data.weightKg,
    parsed.data.packageType,
  );

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
  const { error: paymentError } = await supabase
  .from("payments")
  .insert({
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

  redirect(
    `/customer/shipments/${shipment.tracking_number}?created=true`,
  );
}
export async function cancelShipment(shipmentId: string) {
  const { user, supabase } = await requireRole(["customer"]);

  // Find the shipment belonging to the logged-in customer
  const { data: shipment, error: fetchError } = await supabase
    .from("shipments")
    .select("id, status, tracking_number")
    .eq("id", shipmentId)
    .eq("customer_id", user.id)
    .single();

  if (fetchError || !shipment) {
    console.error("Find shipment error:", fetchError);

    return {
      error: "Shipment not found.",
    };
  }

  // Only pending and approved shipments can be cancelled
  if (!["pending", "approved"].includes(shipment.status)) {
    return {
      error: "This shipment can no longer be cancelled.",
    };
  }

  // Cancel the shipment
  const { data: updatedShipment, error: updateError } = await supabase
    .from("shipments")
    .update({
      status: "cancelled",
    })
    .eq("id", shipmentId)
    .eq("customer_id", user.id)
    .select("id, status, tracking_number")
    .single();

  if (updateError) {
    console.error("Cancel shipment error:", updateError);

    return {
      error: updateError.message,
    };
  }

  console.log("Shipment cancelled:", updatedShipment);

  // Refresh customer pages
  revalidatePath("/customer");
  revalidatePath("/customer/history");

  // Your actual detail URL uses tracking_number
  revalidatePath(
    `/customer/shipments/${updatedShipment.tracking_number}`
  );

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
  const { error: eventError } = await supabase
    .from("shipment_events")
    .insert({
      shipment_id: shipmentId,
      status,
      note:
        note ??
        `Shipment status changed to ${status.replaceAll("_", " ")}`,
      created_by: user.id,
    });

  if (eventError) {
    console.error("CREATE SHIPMENT EVENT ERROR:", eventError);

    return {
      error: `Shipment was updated, but tracking history could not be created: ${eventError.message}`,
    };
  }

  const notificationMap: Partial<
  Record<ShipmentStatus, { title: string; message: string; type: NotificationType }>
> = {
  picked_up: {
    title: "Shipment picked up",
    message: `Your shipment ${shipment.tracking_number} has been picked up.`,
    type: "shipment_picked_up",
  },

  in_transit: {
    title: "Shipment in transit",
    message: `Your shipment ${shipment.tracking_number} is now in transit.`,
    type: "shipment_in_transit",
  },

  out_for_delivery: {
    title: "Out for delivery",
    message: `Your shipment ${shipment.tracking_number} is out for delivery.`,
    type: "shipment_out_for_delivery",
  },

  delivered: {
    title: "Shipment delivered",
    message: `Your shipment ${shipment.tracking_number} has been delivered.`,
    type: "shipment_delivered",
  },
};

const notification = notificationMap[status];

if (notification) {
  await createNotification({
    userId: shipment.customer_id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    shipmentId: shipment.id,
  });
}

await createNotification({
  userId: shipment.customer_id,
  title: "Shipment delivered",
  message: `Your shipment has been delivered successfully.`,
  type: "shipment_delivered",
  shipmentId: shipment.id,
});

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

  // Find the driver
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    return {
      error: "Driver account not found.",
    };
  }

  // Make sure this shipment belongs to this driver
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, driver_id, status")
    .eq("id", shipmentId)
    .eq("driver_id", driver.id)
    .single();

  if (shipmentError || !shipment) {
    return {
      error: "Shipment not found or is not assigned to you.",
    };
  }

  const fileExtension = file.name.split(".").pop() || "jpg";

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

  // Update shipment
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

    // Optional cleanup
    await supabase.storage
      .from("proof-of-delivery")
      .remove([path]);

    return {
      error: updateError.message,
    };
  }

  // Create tracking event
  const { error: eventError } = await supabase
    .from("shipment_events")
    .insert({
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

  revalidatePath("/driver");
  revalidatePath(`/driver/deliveries/${shipmentId}`);
  revalidatePath("/admin/shipments");

  return {
    success: true,
  };
}