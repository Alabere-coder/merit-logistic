"use client";

import { useState } from "react";
import {
  Banknote,
  CreditCard,
  Truck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { initializePayment } from "@/lib/actions/payments";
import { formatCurrency } from "@/lib/utils";

type PaymentMethod = "online" | "cash" | "pay_on_delivery";

type PaymentMethodSelectorProps = {
  shipmentId: string;
  amount: number;
};

export function PaymentMethodSelector({
  shipmentId,
  amount,
}: PaymentMethodSelectorProps) {
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Online payment → redirect to Paystack
      if (method === "online" && result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
        return;
      }

      // Cash / Pay on delivery → refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Payment selection error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Payment method
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Choose how you want to pay for this shipment.
        </p>
      </div>

      <div className="grid gap-3">
        {/* Online */}
        <button
          type="button"
          onClick={() => setMethod("online")}
          disabled={loading}
          className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
            method === "online"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              method === "online"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <CreditCard className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">Pay online</p>

            <p className="text-xs text-slate-500">Pay securely with Paystack</p>
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
          className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
            method === "cash"
              ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              method === "cash"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Banknote className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">Cash</p>

            <p className="text-xs text-slate-500">
              Pay with cash at our office
            </p>
          </div>

          {method === "cash" && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          )}
        </button>

        {/* Pay on delivery */}
        <button
          type="button"
          onClick={() => setMethod("pay_on_delivery")}
          disabled={loading}
          className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
            method === "pay_on_delivery"
              ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/20"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              method === "pay_on_delivery"
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Truck className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">Pay on delivery</p>

            <p className="text-xs text-slate-500">
              Pay when your shipment arrives
            </p>
          </div>

          {method === "pay_on_delivery" && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-600" />
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        className="w-full bg-amber-600 text-white hover:bg-amber-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : method === "online" ? (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(amount)} online
          </>
        ) : method === "cash" ? (
          <>
            <Banknote className="mr-2 h-4 w-4" />
            Select cash payment
          </>
        ) : (
          <>
            <Truck className="mr-2 h-4 w-4" />
            Select pay on delivery
          </>
        )}
      </Button>
    </div>
  );
}
