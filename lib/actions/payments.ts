"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-role";

type PaymentMethod = "online" | "cash" | "pay_on_delivery";

export async function initializePayment(
  shipmentId: string,
  paymentMethod: PaymentMethod,
) {
  const { user, supabase } = await requireRole(["customer"]);

  /* =======================================================
     VALIDATE PAYMENT METHOD
  ======================================================= */

  const allowedMethods: PaymentMethod[] = ["online", "cash", "pay_on_delivery"];

  if (!allowedMethods.includes(paymentMethod)) {
    return {
      error: "Invalid payment method.",
    };
  }

  /* =======================================================
     GET CUSTOMER SHIPMENT
  ======================================================= */

  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select(
      `
          id,
          tracking_number,
          price,
          customer_id,
          status
        `,
    )
    .eq("id", shipmentId)
    .eq("customer_id", user.id)
    .single();

  if (shipmentError || !shipment) {
    console.error("PAYMENT SHIPMENT LOOKUP ERROR:", shipmentError);

    return {
      error: "Shipment not found.",
    };
  }

  /* =======================================================
     CANCELLED SHIPMENT
  ======================================================= */

  if (shipment.status === "cancelled") {
    return {
      error: "This shipment has been cancelled.",
    };
  }

  /* =======================================================
     VALIDATE AMOUNT
  ======================================================= */

  const amount = Number(shipment.price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      error: "Invalid shipment amount.",
    };
  }

  /* =======================================================
     GET EXISTING PAYMENT
  ======================================================= */

  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from("payments")
    .select(
      `
        id,
        payment_status,
        payment_method,
        transaction_reference
      `,
    )
    .eq("shipment_id", shipment.id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (existingPaymentError) {
    console.error("EXISTING PAYMENT LOOKUP ERROR:", existingPaymentError);

    return {
      error: "Unable to check existing payment.",
    };
  }

  /* =======================================================
     PAID PAYMENTS ARE LOCKED
  ======================================================= */

  if (existingPayment?.payment_status === "paid") {
    return {
      error: "This shipment has already been paid for.",
    };
  }

  /* =======================================================
     CASH
  ======================================================= */

  if (paymentMethod === "cash") {
    const paymentData = {
      customer_id: user.id,
      shipment_id: shipment.id,
      amount,
      payment_status: "pending",
      payment_method: "cash",
      transaction_reference: null,
    };

    const { error: paymentError } = await supabase
      .from("payments")
      .upsert(paymentData, {
        onConflict: "shipment_id",
      });

    if (paymentError) {
      console.error("CASH PAYMENT ERROR:", paymentError);

      return {
        error: "Unable to select cash payment.",
      };
    }

    revalidatePath(`/customer/shipments/${shipment.tracking_number}`);

    revalidatePath("/customer/payments");
    revalidatePath("/admin/payments");

    return {
      success: true,
      method: "cash" as const,
    };
  }

  /* =======================================================
     PAY ON DELIVERY
  ======================================================= */

  if (paymentMethod === "pay_on_delivery") {
    const paymentData = {
      customer_id: user.id,
      shipment_id: shipment.id,
      amount,
      payment_status: "pending",
      payment_method: "pay_on_delivery",
      transaction_reference: null,
    };

    const { error: paymentError } = await supabase
      .from("payments")
      .upsert(paymentData, {
        onConflict: "shipment_id",
      });

    if (paymentError) {
      console.error("PAY ON DELIVERY ERROR:", paymentError);

      return {
        error: "Unable to select pay on delivery.",
      };
    }

    revalidatePath(`/customer/shipments/${shipment.tracking_number}`);

    revalidatePath("/customer/payments");
    revalidatePath("/admin/payments");

    return {
      success: true,
      method: "pay_on_delivery" as const,
    };
  }

  /* =======================================================
     ONLINE / PAYSTACK
  ======================================================= */

  if (paymentMethod === "online") {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      console.error("PAYSTACK_SECRET_KEY is not configured.");

      return {
        error: "Online payment is temporarily unavailable.",
      };
    }

    /*
     * Always create a NEW reference when starting
     * an online payment attempt.
     *
     * Do NOT reuse an old reference from a previous
     * failed/refunded/abandoned attempt.
     */

    const reference = `SWS-${shipment.tracking_number}-${Date.now()}`;

    /* -----------------------------------------------------
       First update/create the payment record
    ----------------------------------------------------- */

    const { error: paymentError } = await supabase.from("payments").upsert(
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
        error: "Unable to initialize online payment.",
      };
    }

    /* -----------------------------------------------------
       Initialize Paystack
    ----------------------------------------------------- */

    const amountInKobo = Math.round(amount * 100);

    let response: Response;

    try {
      response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
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
      });
    } catch (error) {
      console.error("PAYSTACK REQUEST ERROR:", error);

      await supabase
        .from("payments")
        .update({
          payment_status: "failed",
        })
        .eq("shipment_id", shipment.id)
        .eq("customer_id", user.id);

      return {
        error: "Unable to connect to the payment provider. Please try again.",
      };
    }

    /* -----------------------------------------------------
       Parse Paystack response
    ----------------------------------------------------- */

    let result: any;

    try {
      result = await response.json();
    } catch (error) {
      console.error("PAYSTACK RESPONSE PARSE ERROR:", error);

      await supabase
        .from("payments")
        .update({
          payment_status: "failed",
        })
        .eq("shipment_id", shipment.id)
        .eq("customer_id", user.id);

      return {
        error: "Invalid response from payment provider.",
      };
    }

    /* -----------------------------------------------------
       Paystack initialization failed
    ----------------------------------------------------- */

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

    /* =====================================================
       SUCCESS
    ===================================================== */

    revalidatePath(`/customer/shipments/${shipment.tracking_number}`);

    revalidatePath("/customer/payments");
    revalidatePath("/admin/payments");

    return {
      success: true,
      method: "online" as const,
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference ?? reference,
    };
  }

  return {
    error: "Invalid payment method.",
  };
}
