"use server";

import { requireRole } from "@/lib/auth/require-role";
import { revalidatePath } from "next/cache";


type PaymentMethod = "online" | "cash" | "pay_on_delivery";

export async function initializePayment(
  shipmentId: string,
  paymentMethod: PaymentMethod,
) {
  const { user, supabase } = await requireRole(["customer"]);

  // Get the customer's shipment
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("id, tracking_number, price, customer_id, status")
    .eq("id", shipmentId)
    .eq("customer_id", user.id)
    .single();

  if (shipmentError || !shipment) {
    return {
      error: "Shipment not found.",
    };
  }

  // Don't allow payment for cancelled shipments
  if (shipment.status === "cancelled") {
    return {
      error: "This shipment has been cancelled.",
    };
  }

  const amount = Number(shipment.price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      error: "Invalid shipment amount.",
    };
  }

  // Get the existing payment for this shipment.
  // Because shipment_id is now UNIQUE, there can only be one.
  const { data: existingPayment, error: existingPaymentError } =
    await supabase
      .from("payments")
      .select(
        "id, payment_status, payment_method, transaction_reference",
      )
      .eq("shipment_id", shipment.id)
      .eq("customer_id", user.id)
      .maybeSingle();

  if (existingPaymentError) {
    console.error("Existing payment lookup error:", existingPaymentError);

    return {
      error: "Unable to check existing payment.",
    };
  }

  // Don't pay again if already paid
  if (existingPayment?.payment_status === "paid") {
    return {
      error: "This shipment has already been paid for.",
    };
  }

  /*
   * CASH
   *
   * Create or update the single payment record.
   */
  if (paymentMethod === "cash") {
    const reference =
      existingPayment?.transaction_reference ??
      `CASH-${shipment.tracking_number}-${Date.now()}`;

    const { error: paymentError } = await supabase
      .from("payments")
      .upsert(
        {
          customer_id: user.id,
          shipment_id: shipment.id,
          amount,
          payment_status: "pending",
          payment_method: "cash",
          transaction_reference: reference,
        },
        {
          onConflict: "shipment_id",
        },
      );

    if (paymentError) {
      console.error("CASH PAYMENT ERROR:", paymentError);

      return {
        error: paymentError.message,
      };
    }

    revalidatePath(
      `/customer/shipments/${shipment.tracking_number}`,
    );
    revalidatePath("/customer/payments");
    revalidatePath("/admin/payments");

    return {
      success: true,
      method: "cash" as const,
    };
  }

  /*
   * PAY ON DELIVERY
   *
   * Create or update the single payment record.
   */
  if (paymentMethod === "pay_on_delivery") {
    const { error: paymentError } = await supabase
      .from("payments")
      .upsert(
        {
          customer_id: user.id,
          shipment_id: shipment.id,
          amount,
          payment_status: "pending",
          payment_method: "pay_on_delivery",
          transaction_reference:
            existingPayment?.transaction_reference ?? null,
        },
        {
          onConflict: "shipment_id",
        },
      );

    if (paymentError) {
      console.error("PAY ON DELIVERY ERROR:", paymentError);

      return {
        error: paymentError.message,
      };
    }

    revalidatePath(
      `/customer/shipments/${shipment.tracking_number}`,
    );
    revalidatePath("/customer/payments");
    revalidatePath("/admin/payments");

    return {
      success: true,
      method: "pay_on_delivery" as const,
    };
  }

  /*
   * ONLINE / PAYSTACK
   */

  if (paymentMethod === "online") {
    /*
     * Reuse the existing Paystack reference if this payment
     * already has one.
     *
     * Otherwise create a new reference.
     */
    const reference =
      existingPayment?.transaction_reference &&
      existingPayment.payment_method === "online"
        ? existingPayment.transaction_reference
        : `SWS-${shipment.tracking_number}-${Date.now()}`;

    /*
     * Create or update the single payment row.
     */
    const { error: paymentError } = await supabase
      .from("payments")
      .upsert(
        {
          customer_id: user.id,
          shipment_id: shipment.id,
          amount,
          payment_status: "pending",
          payment_method: "online",
          transaction_reference: reference,
        },
        {
          onConflict: "shipment_id",
        },
      );

    if (paymentError) {
      console.error("CREATE ONLINE PAYMENT ERROR:", paymentError);

      return {
        error: paymentError.message,
      };
    }

    const amountInKobo = Math.round(amount * 100);

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: String(amountInKobo),
          reference,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/customer/payments/callback`,
          metadata: {
            shipment_id: shipment.id,
            tracking_number: shipment.tracking_number,
            customer_id: user.id,
          },
        }),
      },
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      console.error("PAYSTACK INITIALIZATION ERROR:", result);

      await supabase
        .from("payments")
        .update({
          payment_status: "failed",
        })
        .eq("shipment_id", shipment.id)
        .eq("customer_id", user.id);

      return {
        error: result.message ?? "Unable to initialize payment.",
      };
    }

    revalidatePath(
      `/customer/shipments/${shipment.tracking_number}`,
    );
    revalidatePath("/customer/payments");

    return {
      success: true,
      method: "online" as const,
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
    };
  }

  return {
    error: "Invalid payment method.",
  };
}
