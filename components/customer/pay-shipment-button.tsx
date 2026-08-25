"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { initializePayment } from "@/lib/actions/payments";

type PayShipmentButtonProps = {
  shipmentId: string;
  isPaid: boolean;
};

export function PayShipmentButton({
  shipmentId,
  isPaid,
}: PayShipmentButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    setLoading(true);

    const result = await initializePayment(shipmentId);

    if (result.error) {
      alert(result.error);
      setLoading(false);
      return;
    }

    if (result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
    }
  }

  if (isPaid) {
    return (
      <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        Payment completed
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-blue-600 text-white hover:bg-blue-700"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing payment...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay {/** price can be shown here */}
        </>
      )}
    </Button>
  );
}
