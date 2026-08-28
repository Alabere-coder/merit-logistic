"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cancelShipment } from "@/lib/actions/shipments";

export function CancelShipmentButton({ shipmentId }: { shipmentId: string }) {
  const [pending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelShipment(shipmentId);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      setShowModal(false);
      toast.success("Shipment cancelled.");
      router.refresh();
    });
  }

  return (
    <>
      {/* Cancel Shipment Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        disabled={pending}
        className="border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
      >
        Cancel shipment
      </Button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => !pending && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cancel shipment?
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Are you sure you want to cancel this shipment? This action
                  cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={pending}
                className="h-10 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Keep shipment
              </Button>

              <Button
                type="button"
                onClick={handleCancel}
                disabled={pending}
                className="h-10 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-rose-700 active:scale-95"
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, cancel shipment"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
