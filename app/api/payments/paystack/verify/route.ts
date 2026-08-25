import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(
      new URL("/customer/payments?error=missing_reference", request.url),
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      cache: "no-store",
    },
  );

  const result = await response.json();

  if (!response.ok || !result.status) {
    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=verification_failed",
        request.url,
      ),
    );
  }

  const transaction = result.data;

  if (transaction.status !== "success") {
    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=payment_not_successful",
        request.url,
      ),
    );
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, shipment_id, customer_id")
    .eq("transaction_reference", reference)
    .eq("customer_id", user.id)
    .single();

  if (paymentError || !payment) {
    return NextResponse.redirect(
      new URL(
        "/customer/payments?error=payment_not_found",
        request.url,
      ),
    );
  }

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

  revalidatePath("/customer/payments");
  revalidatePath(`/customer/shipments/${payment.shipment_id}`);

  return NextResponse.redirect(
    new URL(
      `/customer/shipments/${payment.shipment_id}?payment=success`,
      request.url,
    ),
  );
}