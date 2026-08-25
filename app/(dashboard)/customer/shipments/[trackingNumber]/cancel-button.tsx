"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelShipment } from "@/lib/actions/shipments";

export function CancelShipmentButton({ shipmentId }: { shipmentId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    if (!confirm("Cancel this shipment? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await cancelShipment(shipmentId);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Shipment cancelled.");

      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleCancel}
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cancelling...
        </>
      ) : (
        "Cancel shipment"
      )}
    </Button>
  );
}
