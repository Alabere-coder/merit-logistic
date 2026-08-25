"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CreditCard,
  Banknote,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { initializePayment } from "@/lib/actions/payments";
import { formatCurrency } from "@/lib/utils";

type PaymentMethod = "online" | "cash" | "pay_on_delivery";

type PayButtonProps = {
  shipmentId: string;
  amount: number;
};

export function PayButton({ shipmentId, amount }: PayButtonProps) {
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handlePayment() {
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await initializePayment(shipmentId, method);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Online payment → Paystack
    if (result.method === "online" && result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
      return;
    }

    // Cash / POD
    if (result.success) {
      setSuccess(
        method === "cash"
          ? "Cash payment selected. Please pay at our designated office."
          : "Pay on delivery selected. Payment will be collected when the shipment is delivered.",
      );

      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-900">
          Choose payment method
        </p>

        <div className="grid gap-3">
          {/* Online */}
          <button
            type="button"
            onClick={() => setMethod("online")}
            disabled={loading}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              method === "online"
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
          >
            <CreditCard className="mt-0.5 h-5 w-5 text-blue-600" />

            <div className="flex-1">
              <p className="font-semibold text-slate-900">Pay online</p>

              <p className="mt-1 text-xs text-slate-500">
                Pay securely with card, bank transfer or USSD.
              </p>
            </div>

            {method === "online" && (
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            )}
          </button>

          {/* Cash */}
          <button
            type="button"
            onClick={() => setMethod("cash")}
            disabled={loading}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              method === "cash"
                ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/20"
                : "border-slate-200 bg-white hover:border-amber-300"
            }`}
          >
            <Banknote className="mt-0.5 h-5 w-5 text-amber-600" />

            <div className="flex-1">
              <p className="font-semibold text-slate-900">Cash</p>

              <p className="mt-1 text-xs text-slate-500">
                Pay with cash at our designated office.
              </p>
            </div>

            {method === "cash" && (
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
            )}
          </button>

          {/* Pay on delivery */}
          <button
            type="button"
            onClick={() => setMethod("pay_on_delivery")}
            disabled={loading}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              method === "pay_on_delivery"
                ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                : "border-slate-200 bg-white hover:border-emerald-300"
            }`}
          >
            <Truck className="mt-0.5 h-5 w-5 text-emerald-600" />

            <div className="flex-1">
              <p className="font-semibold text-slate-900">Pay on delivery</p>

              <p className="mt-1 text-xs text-slate-500">
                Pay when your shipment is delivered.
              </p>
            </div>

            {method === "pay_on_delivery" && (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Amount</span>

          <span className="font-display text-xl font-bold text-slate-900">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <Button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-amber-600 text-white shadow-md shadow-amber-500/20 hover:bg-amber-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : method === "online" ? (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(amount)} Online
          </>
        ) : method === "cash" ? (
          <>
            <Banknote className="mr-2 h-4 w-4" />
            Confirm Cash Payment
          </>
        ) : (
          <>
            <Truck className="mr-2 h-4 w-4" />
            Confirm Pay on Delivery
          </>
        )}
      </Button>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Loader2, CreditCard } from "lucide-react";
// import { initializePayment } from "@/lib/actions/payments";
// import { formatCurrency } from "@/lib/utils";

// type PayButtonProps = {
//   shipmentId: string;
//   amount: number;
// };

// export function PayButton({ shipmentId, amount }: PayButtonProps) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function handlePayment() {
//     setLoading(true);
//     setError("");

//     const result = await initializePayment(shipmentId);

//     if (result.error) {
//       setError(result.error);
//       setLoading(false);
//       return;
//     }

//     if (result.authorizationUrl) {
//       window.location.href = result.authorizationUrl;
//       return;
//     }

//     setError("Unable to start payment.");
//     setLoading(false);
//   }

//   return (
//     <div className="space-y-3">
//       <Button
//         type="button"
//         onClick={handlePayment}
//         disabled={loading}
//         className="w-full bg-amber-600 text-white shadow-md shadow-amber-500/20 hover:bg-amber-700 sm:w-auto"
//       >
//         {loading ? (
//           <>
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             Connecting to payment...
//           </>
//         ) : (
//           <>
//             <CreditCard className="mr-2 h-4 w-4" />
//             Pay {formatCurrency(amount)}
//           </>
//         )}
//       </Button>

//       {error && <p className="text-sm text-red-600">{error}</p>}
//     </div>
//   );
// }
