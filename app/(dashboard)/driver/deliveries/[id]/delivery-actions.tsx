"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  updateShipmentStatus,
  uploadProofOfDelivery,
} from "@/lib/actions/shipments";
import { SHIPMENT_STATUS_FLOW, STATUS_LABEL } from "@/lib/constants";
import { Upload, CheckCircle2 } from "lucide-react";
import type { ShipmentStatus } from "@/types/app";

export function DeliveryActions({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  const currentIndex = SHIPMENT_STATUS_FLOW.indexOf(currentStatus);

  const nextStatus =
    currentIndex >= 0 ? SHIPMENT_STATUS_FLOW[currentIndex + 1] : undefined;

  const isFinalStep = nextStatus === "delivered";

  const isTerminal =
    currentStatus === "delivered" || currentStatus === "cancelled";

  console.log("DELIVERY ACTIONS:", {
    shipmentId,
    currentStatus,
    currentIndex,
    nextStatus,
  });

  function advanceStatus() {
    if (!nextStatus) {
      toast.error(`No next status for "${currentStatus}".`);
      return;
    }

    startTransition(async () => {
      const result = await updateShipmentStatus(shipmentId, nextStatus);

      console.log("STATUS UPDATE RESULT:", result);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Marked as ${STATUS_LABEL[nextStatus]}`);

      router.refresh();
    });
  }

  async function handleUploadAndDeliver() {
    if (!file) {
      toast.error("Choose a photo of the delivered package first.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("shipmentId", shipmentId);
      formData.append("file", file);

      const result = await uploadProofOfDelivery(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Delivery confirmed.");
      router.refresh();
    } catch (error) {
      console.error("PROOF OF DELIVERY ERROR:", error);
      toast.error("Something went wrong while uploading the proof.");
    } finally {
      setUploading(false);
    }
  }

  if (isTerminal) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />

        {currentStatus === "delivered"
          ? "This delivery is complete."
          : "This shipment was cancelled."}
      </div>
    );
  }

  if (isFinalStep) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-navy-500">
          Upload a photo of the delivered package to confirm this drop-off.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy-700 hover:file:bg-navy-200"
        />

        <Button
          type="button"
          onClick={handleUploadAndDeliver}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />

          {uploading ? "Uploading..." : "Upload & mark delivered"}
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" onClick={advanceStatus} disabled={pending}>
      {pending
        ? "Updating..."
        : `Mark as ${nextStatus ? STATUS_LABEL[nextStatus] : "—"}`}
    </Button>
  );
}
