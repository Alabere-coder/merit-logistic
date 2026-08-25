"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { createDriverSchema } from "@/lib/validations";
import { generateTempPassword, generateUsername } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type ActionState = { error?: string; success?: string; credentials?: { username: string; tempPassword: string } };

/**
 * Only an authenticated admin can reach this — requireRole() redirects
 * anyone else away before any driver account is touched. This is the
 * ONLY path in the app that creates a driver's auth identity; drivers
 * have no signup form of their own.
 */
export async function createDriverAccount(
  _prev: ActionState,
  formData: FormData
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
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { firstName, lastName, email, phone, vehicleType, vehiclePlate, licenseNumber } =
    parsed.data;

  const admin = createAdminClient();
  const username = generateUsername(firstName, lastName);
  const tempPassword = generateTempPassword();

  // 1. Create the auth identity directly (no self-signup, no confirmation
  //    email needed — the admin hands the driver these credentials).
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, role: "driver" },
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create driver account." };
  }

  // 2. The on_auth_user_created trigger already inserted a public.users row
  //    with role='driver' (from user_metadata) — patch in phone + username.
  await admin
    .from("users")
    .update({ phone_number: phone })
    .eq("id", created.user.id);

  // 3. Create the drivers table row with vehicle/license details.
  const { error: driverError } = await admin.from("drivers").insert({
    user_id: created.user.id,
    vehicle_type: vehicleType,
    vehicle_plate: vehiclePlate ?? null,
    license_number: licenseNumber,
    status: "active",
    created_by: profile.id,
  });

  if (driverError) {
    // Roll back the orphaned auth user if the driver row failed.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: driverError.message };
  }

  revalidatePath("/admin/drivers");
  return { success: "Driver account created.", credentials: { username: email, tempPassword } };
}

export async function setDriverStatus(driverId: string, status: "active" | "inactive" | "suspended") {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  const { error } = await admin.from("drivers").update({ status }).eq("id", driverId);
  if (error) return { error: error.message };
  revalidatePath("/admin/drivers");
  return { success: true };
}

export async function deleteDriverAccount(driverId: string, userId: string) {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  // Deleting the auth user cascades to public.users -> public.drivers
  // via the foreign keys' ON DELETE CASCADE.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/drivers");
  return { success: true };
}

export async function assignDriverToShipment(shipmentId: string, driverId: string) {
  await requireRole(["admin"]);
  const admin = createAdminClient();
  const { error } = await admin
    .from("shipments")
    .update({ driver_id: driverId, status: "approved" })
    .eq("id", shipmentId);
  if (error) return { error: error.message };
  revalidatePath("/admin/shipments");
  return { success: true };
}
