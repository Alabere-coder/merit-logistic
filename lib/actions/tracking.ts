"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
========================================================= */

export type TrackingEvent = {
  id: string;
  shipment_id: string;
  status: string;
  created_at: string;
  note: string | null;
  created_by: string | null;
  lat: number | null;
  lng: number | null;
};

export type TrackingDriver = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  current_lat: number | null;
  current_lng: number | null;
  last_location_update: string | null;
};

export type TrackingVehicle = {
  id: string;
  vehicle_number: string;
  registration_number: string;
  vehicle_type: string;
  make: string | null;
  model: string | null;
  status: string;
};

export type TrackingShipment = {
  id: string;
  tracking_number: string;
  customer_id: string;
  driver_id: string | null;

  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;

  pickup_address: string;
  delivery_address: string;

  package_type: string;
  weight_kg: number;
  price: number;

  status: string;
  estimated_delivery: string | null;
  proof_of_delivery_url: string | null;

  created_at: string;
  updated_at: string;

  driver_payout: number | null;

  driver: TrackingDriver | null;
  vehicle: TrackingVehicle | null;
  events: TrackingEvent[];
};

/* =========================================================
   GET SHIPMENT TRACKING
   Customer / Driver / Admin
========================================================= */

export async function getShipmentTracking(shipmentId: string) {
  const { user } = await requireRole(["customer", "driver", "admin"]);

  const supabase = await createClient();

  const id = shipmentId?.trim();

  if (!id) {
    return {
      error: "Invalid shipment.",
    };
  }

  /* -------------------------------------------------------
     Get shipment
  ------------------------------------------------------- */

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select(
      `
        id,
        tracking_number,
        customer_id,
        driver_id,
        sender_name,
        sender_phone,
        receiver_name,
        receiver_phone,
        pickup_address,
        delivery_address,
        package_type,
        weight_kg,
        price,
        status,
        estimated_delivery,
        proof_of_delivery_url,
        created_at,
        updated_at,
        driver_payout
      `,
    )
    .eq("id", id)
    .single();

  if (shipmentError || !shipment) {
    console.error("GET SHIPMENT TRACKING ERROR:", shipmentError);

    return {
      error: "Shipment not found.",
    };
  }

  /* -------------------------------------------------------
     Customer authorization

     Customers may only track their own shipments.

     Admins and drivers are allowed through their
     respective role checks below.
  ------------------------------------------------------- */

  if (user.role === "customer") {
    if (shipment.customer_id !== user.id) {
      return {
        error: "You do not have access to this shipment.",
      };
    }
  }

  /* -------------------------------------------------------
     Driver authorization

     A driver may only access a shipment assigned to them.
  ------------------------------------------------------- */

  if (user.role === "driver") {
    const { data: driver, error: driverError } = await supabase
      .from("drivers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (driverError || !driver) {
      return {
        error: "Driver profile not found.",
      };
    }

    if (shipment.driver_id !== driver.id) {
      return {
        error: "You do not have access to this shipment.",
      };
    }
  }

  /* -------------------------------------------------------
     Get tracking events
  ------------------------------------------------------- */

  const { data: events, error: eventsError } = await supabase
    .from("shipment_events")
    .select(
      `
        id,
        shipment_id,
        status,
        created_at,
        note,
        created_by,
        lat,
        lng
      `,
    )
    .eq("shipment_id", shipment.id)
    .order("created_at", {
      ascending: true,
    });

  if (eventsError) {
    console.error("GET SHIPMENT TRACKING EVENTS ERROR:", eventsError);

    return {
      error: "Unable to load shipment tracking history.",
    };
  }

  /* -------------------------------------------------------
     Get driver + current location
  ------------------------------------------------------- */

  let driver: TrackingDriver | null = null;

  if (shipment.driver_id) {
    const { data: driverRow, error: driverError } = await supabase
      .from("drivers")
      .select(
        `
          id,
          user_id,
          current_lat,
          current_lng,
          last_location_update
        `,
      )
      .eq("id", shipment.driver_id)
      .single();

    if (driverError) {
      console.error("GET TRACKING DRIVER ERROR:", driverError);
    }

    if (driverRow) {
      // const { data: driverUser } = await supabase
      //   .from("users")
      //   .select(
      //     `
      //     first_name,
      //     last_name,
      //     phone_number
      //   `,
      //   )
      //   .eq("id", driverRow.user_id)
      //   .single();

      // driver = {
      //   id: driverRow.id,
      //   user_id: driverRow.user_id,
      //   first_name: driverUser?.first_name ?? null,
      //   last_name: driverUser?.last_name ?? null,
      //   phone_number: driverUser?.phone_number ?? null,
      //   current_lat: driverRow.current_lat ?? null,
      //   current_lng: driverRow.current_lng ?? null,
      //   last_location_update: driverRow.last_location_update ?? null,
      // };

      const { data: driverProfile, error: driverProfileError } =
        await supabase.rpc("get_assigned_driver_profile", {
          target_driver_id: driverRow.id,
        });

      if (driverProfileError) {
        console.error("GET ASSIGNED DRIVER PROFILE ERROR:", driverProfileError);
      }

      const driverUser = driverProfile?.[0] ?? null;

      driver = {
        id: driverRow.id,
        user_id: driverRow.user_id,
        first_name: driverUser?.first_name ?? null,
        last_name: driverUser?.last_name ?? null,
        phone_number: driverUser?.phone_number ?? null,
        current_lat: driverRow.current_lat ?? null,
        current_lng: driverRow.current_lng ?? null,
        last_location_update: driverRow.last_location_update ?? null,
      };
    }
  }

  /* -------------------------------------------------------
     Get assigned vehicle

     vehicles.assigned_driver_id references users.id,
     while shipments.driver_id references drivers.id.
  ------------------------------------------------------- */

  let vehicle: TrackingVehicle | null = null;

  if (driver?.user_id) {
    const { data: vehicleRow, error: vehicleError } = await supabase
      .from("vehicles")
      .select(
        `
          id,
          vehicle_number,
          registration_number,
          vehicle_type,
          make,
          model,
          status
        `,
      )
      .eq("assigned_driver_id", driver.user_id)
      .maybeSingle();

    if (vehicleError) {
      console.error("GET TRACKING VEHICLE ERROR:", vehicleError);
    }

    if (vehicleRow) {
      vehicle = vehicleRow;
    }
  }

  return {
    success: true,
    shipment: {
      ...shipment,
      driver,
      vehicle,
      events: events ?? [],
    } satisfies TrackingShipment,
  };
}

/* =========================================================
   GET SHIPMENT TRACKING BY TRACKING NUMBER
   Customer / Driver / Admin
========================================================= */

export async function getShipmentTrackingByNumber(trackingNumber: string) {
  const { user } = await requireRole(["customer", "driver", "admin"]);

  const supabase = await createClient();

  const number = trackingNumber?.trim();

  if (!number) {
    return {
      error: "Please enter a tracking number.",
    };
  }

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("id, customer_id, driver_id")
    .eq("tracking_number", number)
    .single();

  if (error || !shipment) {
    return {
      error: "Shipment not found.",
    };
  }

  /* -------------------------------------------------------
     Customer ownership check before calling the full
     tracking function.
  ------------------------------------------------------- */

  if (user.role === "customer" && shipment.customer_id !== user.id) {
    return {
      error: "Shipment not found.",
    };
  }

  if (user.role === "driver") {
    const { data: driver } = await supabase
      .from("drivers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!driver || shipment.driver_id !== driver.id) {
      return {
        error: "Shipment not found.",
      };
    }
  }

  return getShipmentTracking(shipment.id);
}

/* =========================================================
   GET DRIVER CURRENT LOCATION
   Driver / Admin
========================================================= */

export async function getDriverLocation(driverId: string) {
  const { user } = await requireRole(["driver", "admin"]);

  const supabase = await createClient();

  const id = driverId?.trim();

  if (!id) {
    return {
      error: "Invalid driver.",
    };
  }

  const { data: driver, error } = await supabase
    .from("drivers")
    .select(
      `
      id,
      user_id,
      current_lat,
      current_lng,
      last_location_update
    `,
    )
    .eq("id", id)
    .single();

  if (error || !driver) {
    return {
      error: "Driver not found.",
    };
  }

  /* -------------------------------------------------------
     A driver may only request their own location.
  ------------------------------------------------------- */

  if (user.role === "driver") {
    if (driver.user_id !== user.id) {
      return {
        error: "You do not have access to this driver.",
      };
    }
  }

  return {
    success: true,
    location: {
      driver_id: driver.id,
      lat: driver.current_lat,
      lng: driver.current_lng,
      last_updated: driver.last_location_update,
    },
  };
}

/* =========================================================
   UPDATE DRIVER CURRENT LOCATION
   Driver only

   This updates the driver's current position.

   Shipment event locations remain separate and should
   represent the location at the time of a shipment event.
========================================================= */

export async function updateDriverLocation(input: {
  lat: number;
  lng: number;
}) {
  const { user } = await requireRole(["driver"]);

  const supabase = await createClient();

  const lat = Number(input.lat);
  const lng = Number(input.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return {
      error: "Invalid location coordinates.",
    };
  }

  if (lat < -90 || lat > 90) {
    return {
      error: "Invalid latitude.",
    };
  }

  if (lng < -180 || lng > 180) {
    return {
      error: "Invalid longitude.",
    };
  }

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    return {
      error: "Driver profile not found.",
    };
  }

  const { data, error } = await supabase
    .from("drivers")
    .update({
      current_lat: lat,
      current_lng: lng,
      last_location_update: new Date().toISOString(),
    })
    .eq("id", driver.id)
    .select(
      `
      id,
      user_id,
      current_lat,
      current_lng,
      last_location_update
    `,
    )
    .single();

  if (error || !data) {
    console.error("UPDATE DRIVER LOCATION ERROR:", {
      userId: user.id,
      lat,
      lng,
      error,
    });

    return {
      error: error?.message ?? "Unable to update driver location.",
    };
  }

  return {
    success: true,
    location: {
      driver_id: data.id,
      lat: data.current_lat,
      lng: data.current_lng,
      last_updated: data.last_location_update,
    },
  };
}

/* =========================================================
   GET ADMIN TRACKING
   Admin only
========================================================= */

export async function getAdminTracking() {
  await requireRole(["admin"]);

  const supabase = await createClient();

  const { data: shipments, error } = await supabase
    .from("shipments")
    .select(
      `
      id,
      tracking_number,
      customer_id,
      driver_id,
      pickup_address,
      delivery_address,
      status,
      estimated_delivery,
      created_at,
      updated_at
    `,
    )
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error("GET ADMIN TRACKING ERROR:", error);

    return {
      error: error.message,
    };
  }

  const rows = shipments ?? [];

  if (rows.length === 0) {
    return {
      success: true,
      shipments: [],
    };
  }

  /* -------------------------------------------------------
     Collect IDs for batch lookups
  ------------------------------------------------------- */

  const customerIds = [
    ...new Set(rows.map((shipment) => shipment.customer_id).filter(Boolean)),
  ];

  //   const driverIds = [
  //     ...new Set(rows.map((shipment) => shipment.driver_id).filter(Boolean)),
  //   ];

  const driverIds = [
    ...new Set(
      rows
        .map((shipment) => shipment.driver_id)
        .filter((driverId): driverId is string => driverId !== null),
    ),
  ];

  /* -------------------------------------------------------
     Load customers
  ------------------------------------------------------- */

  const { data: customers } = await supabase
    .from("users")
    .select(
      `
      id,
      first_name,
      last_name
    `,
    )
    .in("id", customerIds);

  const customerMap = new Map(
    (customers ?? []).map((customer) => [customer.id, customer]),
  );

  /* -------------------------------------------------------
     Load drivers
  ------------------------------------------------------- */

  const { data: drivers } = await supabase
    .from("drivers")
    .select(
      `
      id,
      user_id,
      current_lat,
      current_lng,
      last_location_update
    `,
    )
    .in("id", driverIds);

  const driverMap = new Map(
    (drivers ?? []).map((driver) => [driver.id, driver]),
  );

  /* -------------------------------------------------------
     Load driver user profiles
  ------------------------------------------------------- */

  const driverUserIds = [
    ...new Set((drivers ?? []).map((driver) => driver.user_id).filter(Boolean)),
  ];

  const { data: driverUsers } = await supabase
    .from("users")
    .select(
      `
      id,
      first_name,
      last_name,
      phone_number
    `,
    )
    .in("id", driverUserIds);

  const driverUserMap = new Map(
    (driverUsers ?? []).map((driverUser) => [driverUser.id, driverUser]),
  );

  /* -------------------------------------------------------
     Load assigned vehicles

     assigned_driver_id = users.id
  ------------------------------------------------------- */

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select(
      `
      id,
      vehicle_number,
      registration_number,
      vehicle_type,
      make,
      model,
      status,
      assigned_driver_id
    `,
    )
    .in("assigned_driver_id", driverUserIds);

  const vehicleMap = new Map(
    (vehicles ?? []).map((vehicle) => [vehicle.assigned_driver_id, vehicle]),
  );

  /* -------------------------------------------------------
     Load latest event for each shipment

     We fetch shipment events and determine the latest
     event in application code.
  ------------------------------------------------------- */

  const shipmentIds = rows.map((shipment) => shipment.id);

  const { data: events } = await supabase
    .from("shipment_events")
    .select(
      `
      id,
      shipment_id,
      status,
      created_at,
      note,
      created_by,
      lat,
      lng
    `,
    )
    .in("shipment_id", shipmentIds)
    .order("created_at", {
      ascending: false,
    });

  const latestEventMap = new Map<string, TrackingEvent>();

  for (const event of events ?? []) {
    if (!latestEventMap.has(event.shipment_id)) {
      latestEventMap.set(event.shipment_id, event);
    }
  }

  /* -------------------------------------------------------
     Build admin tracking rows
  ------------------------------------------------------- */

  const trackingRows = rows.map((shipment) => {
    const customer = customerMap.get(shipment.customer_id);

    const driver = shipment.driver_id
      ? driverMap.get(shipment.driver_id)
      : null;

    const driverUser = driver ? driverUserMap.get(driver.user_id) : null;

    const vehicle = driver ? vehicleMap.get(driver.user_id) : null;

    const latestEvent = latestEventMap.get(shipment.id);

    return {
      ...shipment,

      customer: customer
        ? {
            id: customer.id,
            name:
              `${customer.first_name ?? ""} ${
                customer.last_name ?? ""
              }`.trim() || "Customer",
          }
        : null,

      driver: driver
        ? {
            id: driver.id,
            user_id: driver.user_id,
            name:
              `${driverUser?.first_name ?? ""} ${
                driverUser?.last_name ?? ""
              }`.trim() || "Driver",
            phone: driverUser?.phone_number ?? null,
            current_lat: driver.current_lat ?? null,
            current_lng: driver.current_lng ?? null,
            last_location_update: driver.last_location_update ?? null,
          }
        : null,

      vehicle: vehicle
        ? {
            id: vehicle.id,
            vehicle_number: vehicle.vehicle_number,
            registration_number: vehicle.registration_number,
            vehicle_type: vehicle.vehicle_type,
            make: vehicle.make,
            model: vehicle.model,
            status: vehicle.status,
          }
        : null,

      latest_event: latestEvent
        ? {
            id: latestEvent.id,
            status: latestEvent.status,
            created_at: latestEvent.created_at,
            note: latestEvent.note,
            lat: latestEvent.lat,
            lng: latestEvent.lng,
          }
        : null,
    };
  });

  return {
    success: true,
    shipments: trackingRows,
  };
}
