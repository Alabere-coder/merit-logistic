"use server";

import { requireRole } from "@/lib/auth/require-role";

import { createAdminClient } from "@/lib/supabase/admin";

import { createDriverSchema } from "@/lib/validations";

import { generateTempPassword, generateUsername } from "@/lib/utils";

import { revalidatePath } from "next/cache";

import { createNotification } from "@/lib/actions/notifications";

type ActionState = {
  error?: string;
  success?: string;
  credentials?: {
    username: string;
    tempPassword: string;
  };
};

/**
 * Only an authenticated admin can reach this.
 *
 * This is the ONLY path in the app that creates a driver's
 * auth identity.
 */
export async function createDriverAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { profile } = await requireRole(["admin"]);

  const parsed = createDriverSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    vehicleType: formData.get("vehicleType"),
    vehiclePlate: formData.get("vehiclePlate") || undefined,
    licenseNumber: formData.get("licenseNumber"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    vehicleType,
    vehiclePlate,
    licenseNumber,
  } = parsed.data;

  const admin = createAdminClient();

  const username = generateUsername(firstName, lastName);
  const tempPassword = generateTempPassword();

  // 1. Create the auth identity.
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: "driver",
      },
    });

  if (createError || !created.user) {
    return {
      error: createError?.message ?? "Could not create driver account.",
    };
  }

  // 2. The auth trigger already creates public.users.
  // Patch the additional user information.
  const { error: userUpdateError } = await admin
    .from("users")
    .update({
      phone_number: phone,
    })
    .eq("id", created.user.id);

  if (userUpdateError) {
    console.error("UPDATE DRIVER USER ERROR:", userUpdateError);

    await admin.auth.admin.deleteUser(created.user.id);

    return {
      error: userUpdateError.message,
    };
  }

  // 3. Create the drivers table row.
  const { error: driverError } = await admin.from("drivers").insert({
    user_id: created.user.id,
    vehicle_type: vehicleType,
    vehicle_plate: vehiclePlate ?? null,
    license_number: licenseNumber,
    status: "active",
    created_by: profile.id,
  });

  if (driverError) {
    // Roll back the auth user if driver creation fails.
    await admin.auth.admin.deleteUser(created.user.id);

    return {
      error: driverError.message,
    };
  }

  // 4. Notify the newly created driver.
  await createNotification({
    userId: created.user.id,
    title: "Driver account created",
    message:
      "Your driver account has been created successfully. Please use the credentials provided by the administrator to sign in.",
    type: "general",
  });


// 5. Notify all admins that a new driver was created.
const { data: admins, error: adminsError } = await admin
  .from("users")
  .select("id")
  .eq("role", "admin");

if (adminsError) {
  console.error("GET ADMINS ERROR:", adminsError);
} else if (admins && admins.length > 0) {
  await Promise.all(
    admins.map((adminUser) =>
      createNotification({
        userId: adminUser.id,
        title: "New driver created",
        message: `A new driver, ${firstName} ${lastName}, has been added to the system.`,
        type: "general",
      }),
    ),
  );
}


  revalidatePath("/admin/drivers");

  return {
    success: "Driver account created.",
    credentials: {
      username: email,
      tempPassword,
    },
  };
}

export async function setDriverStatus(
  driverId: string,
  status: "active" | "inactive" | "suspended",
) {
  await requireRole(["admin"]);

  const admin = createAdminClient();

  const { error } = await admin
    .from("drivers")
    .update({ status })
    .eq("id", driverId);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/admin/drivers");

  return {
    success: true,
  };
}

export async function deleteDriverAccount(
  driverId: string,
  userId: string,
) {
  await requireRole(["admin"]);

  const admin = createAdminClient();

  // Deleting the auth user cascades to public.users -> public.drivers.
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    return {
      error: error.message,
    };
  }

  revalidatePath("/admin/drivers");

  return {
    success: true,
  };
}

export async function assignDriverToShipment(
  shipmentId: string,
  driverId: string,
) {
  const { profile } = await requireRole(["admin"]);

  const admin = createAdminClient();

  // Get the shipment before assigning the driver.
  const { data: shipment, error: shipmentError } = await admin
    .from("shipments")
    .select("id, tracking_number, customer_id")
    .eq("id", shipmentId)
    .single();

  if (shipmentError || !shipment) {
    return {
      error: "Shipment not found.",
    };
  }

  // Get the driver's user ID.
  const { data: driver, error: driverError } = await admin
    .from("drivers")
    .select("id, user_id")
    .eq("id", driverId)
    .single();

  if (driverError || !driver) {
    return {
      error: "Driver not found.",
    };
  }

  // Assign the driver.
  const { error } = await admin
    .from("shipments")
    .update({
      driver_id: driverId,
      status: "approved",
    })
    .eq("id", shipmentId);

  if (error) {
    return {
      error: error.message,
    };
  }

  // Notify the driver.
  await createNotification({
    userId: driver.user_id,
    title: "New delivery assigned",
    message: `Shipment ${shipment.tracking_number} has been assigned to you.`,
    type: "shipment_assigned",
    shipmentId: shipment.id,
  });

  // Notify the customer.
  await createNotification({
    userId: shipment.customer_id,
    title: "Driver assigned",
    message: `A driver has been assigned to your shipment ${shipment.tracking_number}.`,
    type: "shipment_assigned",
    shipmentId: shipment.id,
  });

  revalidatePath("/admin/shipments");

  return {
    success: true,
  };
}