import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const reference = request.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=missing_reference",
        request.url,
      ),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is missing.");

    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=payment_config",
        request.url,
      ),
    );
  }

  // Verify transaction with Paystack
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok || !result.status) {
    console.error("PAYSTACK VERIFICATION ERROR:", result);

    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=verification_failed",
        request.url,
      ),
    );
  }

  const transaction = result.data;

  // The API request succeeded, but the transaction itself
  // must also have status === "success".
  if (transaction.status !== "success") {
    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=payment_not_successful",
        request.url,
      ),
    );
  }

  // Find our local payment
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select(
      "id, customer_id, shipment_id, amount, payment_status",
    )
    .eq("transaction_reference", reference)
    .eq("customer_id", user.id)
    .single();

  if (paymentError || !payment) {
    console.error("LOCAL PAYMENT NOT FOUND:", paymentError);

    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=payment_not_found",
        request.url,
      ),
    );
  }

  // Already processed
  if (payment.payment_status === "paid") {
    const { data: shipment } = await supabase
      .from("shipments")
      .select("tracking_number")
      .eq("id", payment.shipment_id)
      .single();

    if (shipment) {
      return NextResponse.redirect(
        new URL(
          `/customer/shipments/${shipment.tracking_number}?payment=success`,
          request.url,
        ),
      );
    }

    return NextResponse.redirect(
      new URL(
        "/customer/payments?payment=success",
        request.url,
      ),
    );
  }

  // Verify amount
  const expectedAmount = Math.round(
    Number(payment.amount) * 100,
  );

  if (Number(transaction.amount) !== expectedAmount) {
    console.error("PAYMENT AMOUNT MISMATCH:", {
      expected: expectedAmount,
      received: transaction.amount,
      reference,
    });

    await supabase
      .from("payments")
      .update({
        payment_status: "failed",
      })
      .eq("id", payment.id);

    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=amount_mismatch",
        request.url,
      ),
    );
  }

  // Mark payment as paid
  const { error: updateError } = await supabase
    .from("payments")
    .update({
      payment_status: "paid",
      payment_method: transaction.channel ?? "card",
    })
    .eq("id", payment.id)
    .eq("customer_id", user.id);

  if (updateError) {
    console.error("PAYMENT UPDATE ERROR:", updateError);

    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=payment_update_failed",
        request.url,
      ),
    );
  }

  // Get tracking number
  const { data: shipment } = await supabase
    .from("shipments")
    .select("tracking_number")
    .eq("id", payment.shipment_id)
    .single();

  revalidatePath("/customer/payments");

  if (shipment) {
    revalidatePath(
      `/customer/shipments/${shipment.tracking_number}`,
    );

    return NextResponse.redirect(
      new URL(
        `/customer/shipments/${shipment.tracking_number}?payment=success`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(
    new URL(
      "/customer/payments?payment=success",
      request.url,
    ),
  );
}