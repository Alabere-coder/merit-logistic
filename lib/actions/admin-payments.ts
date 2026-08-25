"use server";

import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";

export async function markPaymentAsPaid(paymentId: string) {
  const { supabase } = await requireRole(["admin"]);

  // Get the payment first
  const { data: payment, error: paymentError } = await supabase
  .from("payments")
  .select(`
    id,
    shipment_id,
    payment_status,
    shipments!payments_shipment_id_fkey (
      tracking_number
    )
  `)
  .eq("id", paymentId)
  .single();

  if (paymentError || !payment) {
    console.error("MARK PAYMENT PAID - LOOKUP ERROR:", paymentError);

    return {
      error: "Payment not found.",
    };
  }

  // Don't update an already-paid payment
  if (payment.payment_status === "paid") {
    return {
      error: "This payment is already marked as paid.",
    };
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      payment_status: "paid",
    })
    .eq("id", paymentId);

  if (updateError) {
    console.error("MARK PAYMENT PAID - UPDATE ERROR:", updateError);

    return {
      error: updateError.message,
    };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/customer/payments");

  const trackingNumber = payment.shipments?.tracking_number;

if (trackingNumber) {
  revalidatePath(`/customer/shipments/${trackingNumber}`);
}

  return {
    success: true,
  };
}