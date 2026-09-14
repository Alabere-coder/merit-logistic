"use server";

import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function toggleCustomerStatus(
  customerId: string,
  isActive: boolean,
) {
  await requireRole(["admin"]);

  const adminSupabase = createAdminClient();

  const { data: customer, error: customerError } = await adminSupabase
    .from("users")
    .select("id, role")
    .eq("id", customerId)
    .single();

  if (customerError || !customer) {
    throw new Error("Customer not found.");
  }

  if (customer.role !== "customer") {
    throw new Error("This user is not a customer.");
  }

  const { error } = await adminSupabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", customerId)
    .eq("role", "customer");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${customerId}`);
}

export async function deleteCustomer(customerId: string) {
  await requireRole(["admin"]);

  const adminSupabase = createAdminClient();

  // Make sure the account is actually a customer.
  const { data: customer, error: customerError } = await adminSupabase
    .from("users")
    .select("id, role")
    .eq("id", customerId)
    .single();

  if (customerError || !customer) {
    throw new Error("Customer not found.");
  }

  if (customer.role !== "customer") {
    throw new Error("This user is not a customer.");
  }

  /*
   * Delete the profile first.
   *
   * This assumes your database relationships allow the customer
   * record to be deleted. If shipments/payments reference the
   * customer with restrictive foreign keys, we will handle those
   * relationships before deleting the account.
   */
  const { error: deleteProfileError } = await adminSupabase
    .from("users")
    .delete()
    .eq("id", customerId)
    .eq("role", "customer");

  if (deleteProfileError) {
    throw new Error(deleteProfileError.message);
  }

  // Delete the corresponding Supabase Auth account.
  const { error: deleteAuthError } =
    await adminSupabase.auth.admin.deleteUser(customerId);

  if (deleteAuthError) {
    throw new Error(deleteAuthError.message);
  }

  revalidatePath("/admin/customers");
}
