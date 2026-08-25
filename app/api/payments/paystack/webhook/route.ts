import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    /*
     * Paystack signs the raw request body with HMAC SHA512.
     */
    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(body)
      .digest("hex");

    /*
     * Compare signatures securely.
     */
    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!signaturesMatch) {
      console.error("INVALID PAYSTACK WEBHOOK SIGNATURE");

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(body);

    /*
     * We only need successful charges.
     */
    if (event.event !== "charge.success") {
      return NextResponse.json({
        received: true,
      });
    }

    const transaction = event.data;

    const reference = transaction.reference;

    if (!reference) {
      console.error("PAYSTACK WEBHOOK: Missing transaction reference");

      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 },
      );
    }

    /*
     * Use the Supabase service role here.
     *
     * Webhooks come from Paystack, not from an authenticated
     * customer session, so normal customer RLS policies should
     * not be relied upon.
     */
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    /*
     * Find our payment using YOUR actual database column:
     *
     * transaction_reference
     */
    const { data: payment, error: paymentLookupError } = await supabase
      .from("payments")
      .select(
        `
        id,
        customer_id,
        shipment_id,
        amount,
        payment_status,
        payment_method,
        transaction_reference
        `,
      )
      .eq("transaction_reference", reference)
      .maybeSingle();

    if (paymentLookupError) {
      console.error(
        "PAYMENT LOOKUP ERROR:",
        paymentLookupError,
      );

      return NextResponse.json(
        { error: "Database lookup failed" },
        { status: 500 },
      );
    }

    /*
     * We received a valid Paystack event, but it doesn't belong
     * to a payment created by our application.
     */
    if (!payment) {
      console.error(
        "PAYSTACK PAYMENT NOT FOUND:",
        reference,
      );

      return NextResponse.json({
        received: true,
      });
    }

    /*
     * Don't process the same successful payment twice.
     */
    if (payment.payment_status === "paid") {
      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
      });
    }

    /*
     * Paystack amounts are in the smallest currency unit.
     *
     * Example:
     * ₦5,000 = 500000 kobo
     */
    const expectedAmount = Math.round(
      Number(payment.amount) * 100,
    );

    const paidAmount = Number(transaction.amount);

    if (!Number.isFinite(paidAmount)) {
      console.error(
        "INVALID PAYSTACK AMOUNT:",
        transaction.amount,
      );

      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 },
      );
    }

    /*
     * NEVER mark the payment as paid if the amount doesn't match.
     */
    if (paidAmount !== expectedAmount) {
      console.error("PAYSTACK AMOUNT MISMATCH:", {
        reference,
        expectedAmount,
        paidAmount,
      });

      await supabase
        .from("payments")
        .update({
          payment_status: "failed",
        })
        .eq("id", payment.id);

      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 },
      );
    }

    /*
     * Paystack has confirmed the transaction.
     *
     * Store the actual payment channel.
     *
     * Examples:
     * card
     * bank
     * ussd
     * bank_transfer
     */
    const paymentMethod =
      typeof transaction.channel === "string"
        ? transaction.channel
        : "card";

    const { error: updateError } = await supabase
      .from("payments")
      .update({
        payment_status: "paid",
        payment_method: paymentMethod,
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error(
        "PAYMENT UPDATE ERROR:",
        updateError,
      );

      return NextResponse.json(
        { error: "Unable to update payment" },
        { status: 500 },
      );
    }

    console.log(
      `PAYMENT CONFIRMED: ${reference}`,
    );

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "PAYSTACK WEBHOOK ERROR:",
      error,
    );

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

// https://YOUR-DOMAIN.com/api/payments/paystack/webhook