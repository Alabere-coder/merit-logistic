"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markPaymentAsPaid } from "@/lib/actions/admin-payments";

type MarkPaymentPaidButtonProps = {
  paymentId: string;
};

export function MarkPaymentPaidButton({
  paymentId,
}: MarkPaymentPaidButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleMarkAsPaid() {
    setLoading(true);
    setError("");

    try {
      const result = await markPaymentAsPaid(paymentId);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Mark payment as paid error:", error);
      setError("Unable to mark payment as paid.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        onClick={handleMarkAsPaid}
        disabled={loading}
        className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Mark as paid
          </>
        )}
      </Button>

      {error && <p className="text-[10px] font-medium text-red-600">{error}</p>}
    </div>
  );
}
