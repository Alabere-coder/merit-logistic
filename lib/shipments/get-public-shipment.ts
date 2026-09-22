import { createAdminClient } from "@/lib/supabase/admin";

export type PublicShipment = {
  tracking_number: string;
  status:
    | "pending"
    | "approved"
    | "picked_up"
    | "in_transit"
    | "arrived_at_warehouse"
    | "out_for_delivery"
    | "arrived_at_delivery_destination"
    | "delivered"
    | "cancelled";
  package_type: string;
  is_express: boolean;
  created_at: string;
  updated_at: string;
  estimated_delivery: string | null;
  pickup_address: string;
  delivery_address: string;
};

export async function getPublicShipment(
  trackingNumber: string,
): Promise<PublicShipment | null> {
  const supabase = createAdminClient();

  const normalizedTrackingNumber = trackingNumber.trim();

  if (!normalizedTrackingNumber) {
    return null;
  }

  const { data, error } = await supabase
    .from("shipments")
    .select(
      `
      tracking_number,
      status,
      package_type,
      is_express,
      created_at,
      updated_at,
      estimated_delivery,
      pickup_address,
      delivery_address
    `,
    )
    .eq("tracking_number", normalizedTrackingNumber)
    .maybeSingle();

  if (error) {
    console.error("PUBLIC SHIPMENT TRACKING ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return null;
  }

  if (!data) {
    return null;
  }

  return {
    tracking_number: data.tracking_number,
    status: data.status as PublicShipment["status"],
    package_type: data.package_type,
    is_express: data.is_express,
    created_at: data.created_at,
    updated_at: data.updated_at,
    estimated_delivery: data.estimated_delivery,
    pickup_address: data.pickup_address,
    delivery_address: data.delivery_address,
  };
}
