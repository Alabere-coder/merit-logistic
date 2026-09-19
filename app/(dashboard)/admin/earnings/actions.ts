"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markDriverEarningPaid(
  earningId: string,
  paymentReference?: string,
) {
  const { user } = await requireRole(["admin"]);

  if (!earningId?.trim()) {
    return {
      error: "Invalid earning ID.",
    };
  }

  const reference = paymentReference?.trim() || null;

  const supabase = createAdminClient();

  /* -------------------------------------------------------
     1. Find earning
  ------------------------------------------------------- */

  const { data: earning, error: earningError } = await supabase
    .from("driver_earnings")
    .select(
      `
        id,
        driver_id,
        shipment_id,
        amount,
        status,
        payment_reference,
        paid_at
      `,
    )
    .eq("id", earningId.trim())
    .single();

  if (earningError || !earning) {
    console.error("DRIVER EARNING LOOKUP ERROR:", earningError);

    return {
      error: "Driver earning not found.",
    };
  }

  /* -------------------------------------------------------
     2. Prevent duplicate payment
  ------------------------------------------------------- */

  if (earning.status === "paid") {
    return {
      error: "This earning has already been marked as paid.",
    };
  }

  /* -------------------------------------------------------
     3. Mark earning as paid
  ------------------------------------------------------- */

  const { data: updatedEarning, error: updateError } = await supabase
    .from("driver_earnings")
    .update({
      status: "paid",
      payment_reference: reference,
      paid_at: new Date().toISOString(),
      notes: reference
        ? `Paid by admin ${user.id}. Payment reference: ${reference}`
        : `Paid by admin ${user.id}.`,
    })
    .eq("id", earning.id)
    .eq("status", "pending")
    .select(
      `
        id,
        status,
        payment_reference,
        paid_at
      `,
    )
    .maybeSingle();

  if (updateError || !updatedEarning) {
    console.error("MARK DRIVER EARNING PAID ERROR:", {
      earningId: earning.id,
      error: updateError,
    });

    return {
      error:
        updateError?.message ??
        "Unable to mark this earning as paid. It may have already been updated.",
    };
  }

  /* -------------------------------------------------------
     4. Refresh admin + driver earnings pages
  ------------------------------------------------------- */

  revalidatePath("/admin/earnings");
  revalidatePath("/driver/earnings");

  return {
    success: true,
  };
}
