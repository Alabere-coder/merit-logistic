"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  updateShipmentStatus,
  uploadProofOfDelivery,
} from "@/lib/actions/shipments";
import { SHIPMENT_STATUS_FLOW, STATUS_LABEL } from "@/lib/constants";
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

  /*
   * Proof of delivery is required to move from
   * arrived_at_delivery_destination -> delivered.
   */
  const isProofOfDeliveryStep =
    currentStatus === "arrived_at_delivery_destination";

  const isTerminal =
    currentStatus === "delivered" || currentStatus === "cancelled";

  function advanceStatus() {
    if (!nextStatus) {
      toast.error(`No next status for "${currentStatus}".`);
      return;
    }

    /*
     * delivered must never be reached through the
     * generic status updater.
     *
     * Delivery must happen through proof of delivery.
     */
    if (nextStatus === "delivered") {
      toast.error("Upload proof of delivery to complete this shipment.");
      return;
    }

    startTransition(async () => {
      const result = await updateShipmentStatus(shipmentId, nextStatus);

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

      setFile(null);

      router.refresh();
    } catch (error) {
      console.error("PROOF OF DELIVERY ERROR:", error);

      toast.error("Something went wrong while uploading the proof.");
    } finally {
      setUploading(false);
    }
  }

  /* -------------------------------------------------------
     Terminal states
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Proof of delivery

     Only available after the driver has arrived at
     the delivery destination.
  ------------------------------------------------------- */

  if (isProofOfDeliveryStep) {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-navy-800">
            Arrived at delivery destination
          </p>

          <p className="mt-1 text-sm text-navy-500">
            Upload a photo of the delivered package to confirm this drop-off.
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={uploading}
          className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy-700 hover:file:bg-navy-200 disabled:opacity-60"
        />

        {file && <p className="text-xs text-navy-500">Selected: {file.name}</p>}

        <Button
          type="button"
          onClick={handleUploadAndDeliver}
          disabled={uploading || !file}
          className="inline-flex items-center justify-center gap-2 rounded-xl"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Upload & mark delivered</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  /* -------------------------------------------------------
     Normal driver status progression
  ------------------------------------------------------- */

  return (
    <Button
      type="button"
      onClick={advanceStatus}
      disabled={pending || !nextStatus}
      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span>Updating...</span>
        </>
      ) : (
        <>
          <span>Mark as {nextStatus ? STATUS_LABEL[nextStatus] : "—"}</span>

          {nextStatus && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </>
      )}
    </Button>
  );
}

// "use client";

// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import {
//   updateShipmentStatus,
//   uploadProofOfDelivery,
// } from "@/lib/actions/shipments";
// import { SHIPMENT_STATUS_FLOW, STATUS_LABEL } from "@/lib/constants";
// import { Upload, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
// import type { ShipmentStatus } from "@/types/app";

// export function DeliveryActions({
//   shipmentId,
//   currentStatus,
// }: {
//   shipmentId: string;
//   currentStatus: ShipmentStatus;
// }) {
//   const [pending, startTransition] = useTransition();
//   const [file, setFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const router = useRouter();

//   const currentIndex = SHIPMENT_STATUS_FLOW.indexOf(currentStatus);

//   const nextStatus =
//     currentIndex >= 0 ? SHIPMENT_STATUS_FLOW[currentIndex + 1] : undefined;

//   const isFinalStep = nextStatus === "delivered";

//   const isTerminal =
//     currentStatus === "delivered" || currentStatus === "cancelled";

//   console.log("DELIVERY ACTIONS:", {
//     shipmentId,
//     currentStatus,
//     currentIndex,
//     nextStatus,
//   });

//   function advanceStatus() {
//     if (!nextStatus) {
//       toast.error(`No next status for "${currentStatus}".`);
//       return;
//     }

//     startTransition(async () => {
//       const result = await updateShipmentStatus(shipmentId, nextStatus);

//       console.log("STATUS UPDATE RESULT:", result);

//       if (result?.error) {
//         toast.error(result.error);
//         return;
//       }

//       toast.success(`Marked as ${STATUS_LABEL[nextStatus]}`);

//       router.refresh();
//     });
//   }

//   async function handleUploadAndDeliver() {
//     if (!file) {
//       toast.error("Choose a photo of the delivered package first.");
//       return;
//     }

//     setUploading(true);

//     try {
//       const formData = new FormData();

//       formData.append("shipmentId", shipmentId);
//       formData.append("file", file);

//       const result = await uploadProofOfDelivery(formData);

//       if (result?.error) {
//         toast.error(result.error);
//         return;
//       }

//       toast.success("Delivery confirmed.");
//       router.refresh();
//     } catch (error) {
//       console.error("PROOF OF DELIVERY ERROR:", error);
//       toast.error("Something went wrong while uploading the proof.");
//     } finally {
//       setUploading(false);
//     }
//   }

//   if (isTerminal) {
//     return (
//       <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
//         <CheckCircle2 className="h-4 w-4" />

//         {currentStatus === "delivered"
//           ? "This delivery is complete."
//           : "This shipment was cancelled."}
//       </div>
//     );
//   }

//   if (isFinalStep) {
//     return (
//       <div className="space-y-3">
//         <p className="text-sm text-navy-500">
//           Upload a photo of the delivered package to confirm this drop-off.
//         </p>

//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => setFile(e.target.files?.[0] ?? null)}
//           className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy-700 hover:file:bg-navy-200"
//         />

//         <Button
//           type="button"
//           onClick={handleUploadAndDeliver}
//           disabled={uploading}
//         >
//           <Upload className="h-4 w-4" />

//           {uploading ? "Uploading..." : "Upload & mark delivered"}
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <Button
//       type="button"
//       onClick={advanceStatus}
//       disabled={pending || !nextStatus}
//       className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
//     >
//       {pending ? (
//         <>
//           <Loader2 className="h-4 w-4 animate-spin text-white" />
//           <span>Updating...</span>
//         </>
//       ) : (
//         <>
//           <span>Mark as {nextStatus ? STATUS_LABEL[nextStatus] : "—"}</span>
//           {nextStatus && (
//             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
//           )}
//         </>
//       )}
//     </Button>
//   );
// }
