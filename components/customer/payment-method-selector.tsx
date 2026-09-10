"use client";

import { useEffect, useState } from "react";

import {
  Banknote,
  CreditCard,
  Truck,
  Loader2,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { initializePayment } from "@/lib/actions/payments";
import { formatCurrency } from "@/lib/utils";

type PaymentMethod = "online" | "cash" | "pay_on_delivery";

type Payment = {
  id: string;
  amount: number;
  payment_status: string;
  payment_method: string | null;
  transaction_reference: string | null;
  created_at: string;
};

type PaymentMethodSelectorProps = {
  shipmentId: string;
  amount: number;
  payment: Payment | null;
};

function isPaymentMethod(value: string | null): value is PaymentMethod {
  return value === "online" || value === "cash" || value === "pay_on_delivery";
}

function getPaymentMethodLabel(method: string | null) {
  switch (method) {
    case "online":
      return "Online payment";

    case "cash":
      return "Cash";

    case "pay_on_delivery":
      return "Pay on delivery";

    default:
      return "Payment";
  }
}

export function PaymentMethodSelector({
  shipmentId,
  amount,
  payment,
}: PaymentMethodSelectorProps) {
  const savedMethod = payment?.payment_method ?? null;

  const initialMethod: PaymentMethod = isPaymentMethod(savedMethod)
    ? savedMethod
    : "online";

  const [method, setMethod] = useState<PaymentMethod>(initialMethod);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /*
   * Keep the selected method synchronized with
   * the latest payment returned by the server.
   */
  useEffect(() => {
    const latestMethod = payment?.payment_method ?? null;

    if (isPaymentMethod(latestMethod)) {
      setMethod(latestMethod);
    } else {
      setMethod("online");
    }
  }, [payment?.payment_method]);

  async function handleContinue() {
    setLoading(true);
    setError("");

    try {
      const result = await initializePayment(shipmentId, method);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      /*
       * Online payment redirects to Paystack.
       */
      if (method === "online" && result.authorizationUrl) {
        window.location.href = result.authorizationUrl;

        return;
      }

      /*
       * Cash / Pay on delivery.
       *
       * Reload so the updated payment record
       * is displayed immediately.
       */
      window.location.reload();
    } catch (error) {
      console.error("Payment selection error:", error);

      setError("Something went wrong. Please try again.");

      setLoading(false);
    }
  }

  /* =======================================================
     PAYMENT COMPLETED
  ======================================================= */

  if (payment?.payment_status === "paid") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-emerald-900">
              Payment completed
            </h3>

            <p className="mt-1 text-sm text-emerald-700">
              Your payment of{" "}
              <span className="font-semibold">
                {formatCurrency(Number(payment.amount ?? amount))}
              </span>{" "}
              has been confirmed.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-emerald-200 bg-white/70 p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Payment method</span>

            <span className="font-medium text-slate-900">
              {getPaymentMethodLabel(payment.payment_method)}
            </span>
          </div>

          {payment.transaction_reference && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Reference</span>

              <span className="max-w-[60%] truncate font-mono text-xs text-slate-700">
                {payment.transaction_reference}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =======================================================
     REFUNDED
  ======================================================= */

  if (payment?.payment_status === "refunded") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <RotateCcw className="h-5 w-5 text-amber-600" />
          </div>

          <div>
            <h3 className="font-semibold text-amber-900">Payment refunded</h3>

            <p className="mt-1 text-sm text-amber-700">
              This payment has been refunded.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            onClick={() => {
              setError("");
              setMethod("online");
            }}
            className="w-full"
          >
            Make a new payment
          </Button>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAYMENT SELECTION
     
     IMPORTANT:
     Pending payments remain editable.
     
     This allows the customer to change:
     Online → Cash
     Cash → Pay on delivery
     Pay on delivery → Online
     
     Only "paid" is locked.
  ======================================================= */

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Payment method
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Choose how you would like to pay.
        </p>

        {payment?.payment_status === "pending" && payment.payment_method && (
          <p className="mt-2 text-xs text-blue-600">
            Current method:{" "}
            <span className="font-medium">
              {getPaymentMethodLabel(payment.payment_method)}
            </span>
            . You can change it before payment is completed.
          </p>
        )}
      </div>

      {/* Error */}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* Payment options */}

      <div className="grid gap-3">
        {/* Online */}

        <button
          type="button"
          onClick={() => setMethod("online")}
          disabled={loading}
          className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
            method === "online"
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <CreditCard className="h-5 w-5 text-slate-700" />
          </div>

          <div className="flex-1">
            <p className="font-medium text-slate-900">Pay online</p>

            <p className="text-sm text-slate-500">
              Pay securely with your card or bank.
            </p>
          </div>

          {method === "online" && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
          )}
        </button>

        {/* Cash */}

        <button
          type="button"
          onClick={() => setMethod("cash")}
          disabled={loading}
          className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
            method === "cash"
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Banknote className="h-5 w-5 text-slate-700" />
          </div>

          <div className="flex-1">
            <p className="font-medium text-slate-900">Cash</p>

            <p className="text-sm text-slate-500">
              Pay with cash according to your shipment arrangements.
            </p>
          </div>

          {method === "cash" && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
          )}
        </button>

        {/* Pay on delivery */}

        <button
          type="button"
          onClick={() => setMethod("pay_on_delivery")}
          disabled={loading}
          className={`flex items-center gap-4 rounded-xl border p-4 text-left transition ${
            method === "pay_on_delivery"
              ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Truck className="h-5 w-5 text-slate-700" />
          </div>

          <div className="flex-1">
            <p className="font-medium text-slate-900">Pay on delivery</p>

            <p className="text-sm text-slate-500">
              Pay when your shipment is delivered.
            </p>
          </div>

          {method === "pay_on_delivery" && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
          )}
        </button>
      </div>

      {/* Amount */}

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Amount</span>

          <span className="text-lg font-bold text-slate-900">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {/* Continue */}

      <Button
        type="button"
        variant="outline"
        onClick={handleContinue}
        disabled={loading}
        className="w-full bg-emerald-500 border-emerald-200 text-white hover:bg-emerald-600 hover:text-emerald-900"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : method === "online" ? (
          "Continue to online payment"
        ) : (
          `Select ${getPaymentMethodLabel(method)}`
        )}
      </Button>
    </div>
  );
}
