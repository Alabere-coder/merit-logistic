"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
========================================================= */

export type VehicleType =
  | "motorcycle"
  | "car"
  | "van"
  | "pickup"
  | "truck"
  | "trailer"
  | "other";

export type VehicleStatus = "active" | "inactive" | "maintenance";

export type VehicleActionState = {
  success?: string;
  error?: string;
  warning?: string;
};

/* =========================================================
   CREATE VEHICLE
   Admin only
========================================================= */

export async function createVehicle(
  _prevState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  const vehicleNumber = String(formData.get("vehicle_number") ?? "").trim();

  const registrationNumber = String(
    formData.get("registration_number") ?? "",
  ).trim();

  const vehicleType = String(
    formData.get("vehicle_type") ?? "",
  ).trim() as VehicleType;

  const make = String(formData.get("make") ?? "").trim();

  const model = String(formData.get("model") ?? "").trim();

  const yearValue = String(formData.get("year") ?? "").trim();

  const capacityValue = String(formData.get("capacity_kg") ?? "").trim();

  const assignedDriverIdValue = String(
    formData.get("assigned_driver_id") ?? "",
  ).trim();

  const notes = String(formData.get("notes") ?? "").trim();

  /* -------------------------------------------------------
     Validation
  ------------------------------------------------------- */

  if (!vehicleNumber) {
    return {
      error: "Please enter a vehicle number.",
    };
  }

  if (!registrationNumber) {
    return {
      error: "Please enter the registration number.",
    };
  }

  const allowedTypes: VehicleType[] = [
    "motorcycle",
    "car",
    "van",
    "pickup",
    "truck",
    "trailer",
    "other",
  ];

  if (!allowedTypes.includes(vehicleType)) {
    return {
      error: "Please select a valid vehicle type.",
    };
  }

  if (vehicleNumber.length > 50) {
    return {
      error: "Vehicle number must be 50 characters or less.",
    };
  }

  if (registrationNumber.length > 50) {
    return {
      error: "Registration number must be 50 characters or less.",
    };
  }

  /* -------------------------------------------------------
     Parse year
  ------------------------------------------------------- */

  let year: number | null = null;

  if (yearValue) {
    const parsedYear = Number(yearValue);

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 1900 ||
      parsedYear > 2100
    ) {
      return {
        error: "Please enter a valid vehicle year.",
      };
    }

    year = parsedYear;
  }

  /* -------------------------------------------------------
     Parse capacity
  ------------------------------------------------------- */

  let capacityKg: number | null = null;

  if (capacityValue) {
    const parsedCapacity = Number(capacityValue);

    if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
      return {
        error: "Please enter a valid vehicle capacity.",
      };
    }

    capacityKg = parsedCapacity;
  }

  /* -------------------------------------------------------
     Validate driver
  ------------------------------------------------------- */

  let assignedDriverId: string | null = null;

  if (assignedDriverIdValue) {
    const { data: driver, error: driverError } = await supabase
      .from("users")
      .select("id, role, is_active")
      .eq("id", assignedDriverIdValue)
      .eq("role", "driver")
      .maybeSingle();

    if (driverError) {
      console.error("VEHICLE DRIVER LOOKUP ERROR:", driverError);

      return {
        error: "Unable to verify the selected driver.",
      };
    }

    if (!driver) {
      return {
        error: "Selected user is not a valid driver.",
      };
    }

    if (driver.is_active === false) {
      return {
        error: "You cannot assign a vehicle to an inactive driver.",
      };
    }

    assignedDriverId = driver.id;
  }

  /* -------------------------------------------------------
     Create vehicle
  ------------------------------------------------------- */

  const { error } = await supabase.from("vehicles").insert({
    vehicle_number: vehicleNumber,
    registration_number: registrationNumber,
    vehicle_type: vehicleType,
    make: make || null,
    model: model || null,
    year,
    capacity_kg: capacityKg,
    assigned_driver_id: assignedDriverId,
    status: "active",
    notes: notes || null,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    console.error("CREATE VEHICLE ERROR:", error);

    if (error.code === "23505") {
      return {
        error:
          "A vehicle with this vehicle number or registration number already exists.",
      };
    }

    return {
      error: error.message ?? "Unable to create vehicle.",
    };
  }

  revalidatePath("/admin/vehicles");
  revalidatePath("/admin/drivers");

  redirect("/admin/vehicles?created=1");

  //   revalidatePath("/admin/vehicles");
  //   revalidatePath("/admin/drivers");

  //   return {
  //     success: "Vehicle created successfully.",
  //   };
}

/* =========================================================
   UPDATE VEHICLE
   Admin only
========================================================= */

export async function updateVehicle(
  _prevState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  const vehicleId = String(formData.get("vehicle_id") ?? "").trim();

  const vehicleNumber = String(formData.get("vehicle_number") ?? "").trim();

  const registrationNumber = String(
    formData.get("registration_number") ?? "",
  ).trim();

  const vehicleType = String(
    formData.get("vehicle_type") ?? "",
  ).trim() as VehicleType;

  const make = String(formData.get("make") ?? "").trim();

  const model = String(formData.get("model") ?? "").trim();

  const yearValue = String(formData.get("year") ?? "").trim();

  const capacityValue = String(formData.get("capacity_kg") ?? "").trim();

  const assignedDriverIdValue = String(
    formData.get("assigned_driver_id") ?? "",
  ).trim();

  const status = String(formData.get("status") ?? "").trim() as VehicleStatus;

  const notes = String(formData.get("notes") ?? "").trim();

  /* -------------------------------------------------------
     Validation
  ------------------------------------------------------- */

  if (!vehicleId) {
    return {
      error: "Invalid vehicle.",
    };
  }

  if (!vehicleNumber) {
    return {
      error: "Please enter a vehicle number.",
    };
  }

  if (!registrationNumber) {
    return {
      error: "Please enter the registration number.",
    };
  }

  const allowedTypes: VehicleType[] = [
    "motorcycle",
    "car",
    "van",
    "pickup",
    "truck",
    "trailer",
    "other",
  ];

  if (!allowedTypes.includes(vehicleType)) {
    return {
      error: "Please select a valid vehicle type.",
    };
  }

  const allowedStatuses: VehicleStatus[] = [
    "active",
    "inactive",
    "maintenance",
  ];

  if (!allowedStatuses.includes(status)) {
    return {
      error: "Please select a valid vehicle status.",
    };
  }

  if (vehicleNumber.length > 50) {
    return {
      error: "Vehicle number must be 50 characters or less.",
    };
  }

  if (registrationNumber.length > 50) {
    return {
      error: "Registration number must be 50 characters or less.",
    };
  }

  /* -------------------------------------------------------
     Parse year
  ------------------------------------------------------- */

  let year: number | null = null;

  if (yearValue) {
    const parsedYear = Number(yearValue);

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 1900 ||
      parsedYear > 2100
    ) {
      return {
        error: "Please enter a valid vehicle year.",
      };
    }

    year = parsedYear;
  }

  /* -------------------------------------------------------
     Parse capacity
  ------------------------------------------------------- */

  let capacityKg: number | null = null;

  if (capacityValue) {
    const parsedCapacity = Number(capacityValue);

    if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
      return {
        error: "Please enter a valid vehicle capacity.",
      };
    }

    capacityKg = parsedCapacity;
  }

  /* -------------------------------------------------------
     Validate driver
  ------------------------------------------------------- */

  let assignedDriverId: string | null = null;

  if (assignedDriverIdValue) {
    const { data: driver, error: driverError } = await supabase
      .from("users")
      .select("id, role, is_active")
      .eq("id", assignedDriverIdValue)
      .eq("role", "driver")
      .maybeSingle();

    if (driverError) {
      console.error("VEHICLE DRIVER LOOKUP ERROR:", driverError);

      return {
        error: "Unable to verify the selected driver.",
      };
    }

    if (!driver) {
      return {
        error: "Selected user is not a valid driver.",
      };
    }

    if (driver.is_active === false) {
      return {
        error: "You cannot assign a vehicle to an inactive driver.",
      };
    }

    assignedDriverId = driver.id;
  }

  /* -------------------------------------------------------
     Update vehicle
  ------------------------------------------------------- */

  const { error } = await supabase
    .from("vehicles")
    .update({
      vehicle_number: vehicleNumber,
      registration_number: registrationNumber,
      vehicle_type: vehicleType,
      make: make || null,
      model: model || null,
      year,
      capacity_kg: capacityKg,
      assigned_driver_id: assignedDriverId,
      status,
      notes: notes || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId);

  if (error) {
    console.error("UPDATE VEHICLE ERROR:", error);

    if (error.code === "23505") {
      return {
        error:
          "A vehicle with this vehicle number or registration number already exists.",
      };
    }

    return {
      error: error.message ?? "Unable to update vehicle.",
    };
  }

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath("/admin/drivers");

  return {
    success: "Vehicle updated successfully.",
  };
}

/* =========================================================
   UPDATE VEHICLE STATUS
   Admin only
========================================================= */

export async function updateVehicleStatus(
  vehicleId: string,
  status: VehicleStatus,
) {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  if (!vehicleId) {
    return {
      error: "Invalid vehicle.",
    };
  }

  const allowedStatuses: VehicleStatus[] = [
    "active",
    "inactive",
    "maintenance",
  ];

  if (!allowedStatuses.includes(status)) {
    return {
      error: "Invalid vehicle status.",
    };
  }

  const { data, error } = await supabase
    .from("vehicles")
    .update({
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId)
    .select(
      `
        id,
        vehicle_number,
        registration_number,
        vehicle_type,
        status,
        assigned_driver_id,
        updated_at
      `,
    )
    .single();

  if (error || !data) {
    console.error("UPDATE VEHICLE STATUS ERROR:", error);

    return {
      error: error?.message ?? "Unable to update vehicle status.",
    };
  }

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath("/admin/drivers");

  return {
    success: true,
    vehicle: data,
  };
}

/* =========================================================
   ASSIGN VEHICLE TO DRIVER
   Admin only
========================================================= */

export async function assignVehicleToDriver(
  vehicleId: string,
  driverId: string | null,
) {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  if (!vehicleId) {
    return {
      error: "Invalid vehicle.",
    };
  }

  let assignedDriverId: string | null = null;

  if (driverId) {
    const { data: driver, error: driverError } = await supabase
      .from("users")
      .select("id, role, is_active")
      .eq("id", driverId)
      .eq("role", "driver")
      .maybeSingle();

    if (driverError) {
      console.error("ASSIGN VEHICLE DRIVER LOOKUP ERROR:", driverError);

      return {
        error: "Unable to verify the selected driver.",
      };
    }

    if (!driver) {
      return {
        error: "Selected user is not a valid driver.",
      };
    }

    if (driver.is_active === false) {
      return {
        error: "You cannot assign a vehicle to an inactive driver.",
      };
    }

    assignedDriverId = driver.id;
  }

  const { data, error } = await supabase
    .from("vehicles")
    .update({
      assigned_driver_id: assignedDriverId,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vehicleId)
    .select(
      `
        id,
        vehicle_number,
        registration_number,
        vehicle_type,
        status,
        assigned_driver_id,
        updated_at
      `,
    )
    .single();

  if (error || !data) {
    console.error("ASSIGN VEHICLE ERROR:", error);

    return {
      error: error?.message ?? "Unable to assign vehicle.",
    };
  }

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  revalidatePath("/admin/drivers");

  return {
    success: "Vehicle assignment updated successfully.",
    vehicle: data,
  };
}

/* =========================================================
   DELETE VEHICLE
   Admin only
========================================================= */

export async function deleteVehicle(vehicleId: string) {
  const { user } = await requireRole(["admin"]);

  const supabase = await createClient();

  if (!vehicleId) {
    return {
      error: "Invalid vehicle.",
    };
  }

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId);

  if (error) {
    console.error("DELETE VEHICLE ERROR:", {
      vehicleId,
      userId: user.id,
      error,
    });

    return {
      error: error.message ?? "Unable to delete vehicle.",
    };
  }

  revalidatePath("/admin/vehicles");
  revalidatePath("/admin/drivers");

  return {
    success: "Vehicle deleted successfully.",
  };
}

/* =========================================================
   GET ADMIN VEHICLES
   Admin only
========================================================= */

export async function getAdminVehicles() {
  await requireRole(["admin"]);

  const supabase = await createClient();

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select(
      `
        id,
        vehicle_number,
        registration_number,
        vehicle_type,
        make,
        model,
        year,
        capacity_kg,
        assigned_driver_id,
        status,
        notes,
        created_at,
        updated_at,
        assigned_driver:assigned_driver_id (
          id,
          first_name,
          last_name,
          email
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("GET ADMIN VEHICLES ERROR:", error);

    return {
      error: error.message,
    };
  }

  return {
    success: true,
    vehicles: vehicles ?? [],
  };
}

/* =========================================================
   GET VEHICLE
   Admin only
========================================================= */

export async function getAdminVehicle(vehicleId: string) {
  await requireRole(["admin"]);

  const supabase = await createClient();

  if (!vehicleId) {
    return {
      error: "Invalid vehicle.",
    };
  }

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select(
      `
        id,
        vehicle_number,
        registration_number,
        vehicle_type,
        make,
        model,
        year,
        capacity_kg,
        assigned_driver_id,
        status,
        notes,
        created_at,
        updated_at,
        assigned_driver:assigned_driver_id (
          id,
          first_name,
          last_name,
          email
        )
      `,
    )
    .eq("id", vehicleId)
    .single();

  if (error || !vehicle) {
    console.error("GET ADMIN VEHICLE ERROR:", error);

    return {
      error: "Vehicle not found.",
    };
  }

  return {
    success: true,
    vehicle,
  };
}

/* =========================================================
   GET ACTIVE DRIVERS
   Used by vehicle assignment forms
========================================================= */

export async function getVehicleDrivers() {
  await requireRole(["admin"]);

  const supabase = await createClient();

  const { data: drivers, error } = await supabase
    .from("users")
    .select(
      `
        id,
        first_name,
        last_name,
        email
      `,
    )
    .eq("role", "driver")
    .eq("is_active", true)
    .order("first_name", {
      ascending: true,
    });

  if (error) {
    console.error("GET VEHICLE DRIVERS ERROR:", error);

    return {
      error: error.message,
    };
  }

  return {
    success: true,
    drivers: (drivers ?? []).map((driver) => ({
      id: driver.id,
      name:
        `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim() ||
        driver.email ||
        "Driver",
    })),
  };
}

/* =========================================================
   GET 
========================================================= */

export async function getDriverAssignedVehicle(driverId: string) {
  await requireRole(["admin"]);

  const supabase = await createClient();

  if (!driverId) {
    return {
      error: "Invalid driver.",
    };
  }

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select(
      `
      id,
      vehicle_number,
      registration_number,
      vehicle_type,
      make,
      model,
      year,
      capacity_kg,
      status,
      assigned_driver_id
    `,
    )
    .eq("assigned_driver_id", driverId)
    .maybeSingle();

  if (error) {
    console.error("GET DRIVER ASSIGNED VEHICLE ERROR:", error);

    return {
      error: error.message ?? "Unable to load assigned vehicle.",
    };
  }

  return {
    success: true,
    vehicle,
  };
}
