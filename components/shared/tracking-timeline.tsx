import { CheckCircle2, Circle, XCircle } from "lucide-react";

import { SHIPMENT_STATUS_FLOW, STATUS_LABEL } from "@/lib/constants";

import { cn } from "@/lib/utils";

import type { ShipmentStatus } from "@/types/app";

import type { LocalizationSettings } from "@/lib/localization/get-localization-settings";
import { formatLocalizedDateTime } from "@/lib/localization/format-localized";

export function TrackingTimeline({
  status,
  events,
  settings,
}: {
  status: ShipmentStatus;

  events: {
    status: ShipmentStatus;
    created_at: string;
    note?: string | null;
    lat?: number | null;
    lng?: number | null;
  }[];

  settings: LocalizationSettings;
}) {
  /* -------------------------------------------------------
     Cancelled shipment
  ------------------------------------------------------- */

  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3 text-sm text-red-700">
          <XCircle className="h-5 w-5 shrink-0" />

          <div>
            <p className="font-medium">This shipment was cancelled.</p>

            {(() => {
              const cancellationEvent = [...events]
                .reverse()
                .find((event) => event.status === "cancelled");

              if (!cancellationEvent) {
                return null;
              }

              return (
                <p className="mt-1 text-xs text-red-600">
                  {formatLocalizedDateTime(
                    cancellationEvent.created_at,
                    settings,
                  )}
                </p>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Current status position
  ------------------------------------------------------- */

  const currentIndex = SHIPMENT_STATUS_FLOW.indexOf(status);

  /* -------------------------------------------------------
     Find most recent event for a status
  ------------------------------------------------------- */

  const eventFor = (shipmentStatus: ShipmentStatus) =>
    [...events].reverse().find((event) => event.status === shipmentStatus);

  return (
    <ol className="relative space-y-0">
      {SHIPMENT_STATUS_FLOW.map((s, i) => {
        const done = i <= currentIndex;
        const isLast = i === SHIPMENT_STATUS_FLOW.length - 1;

        const event = eventFor(s);

        return (
          <li key={s} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Timeline connector */}
            {!isLast && (
              <span
                className={cn(
                  "absolute left-2.25 top-6 h-full w-0.5",
                  done && i < currentIndex ? "bg-green-600" : "bg-navy-100",
                )}
              />
            )}

            {/* Status icon */}
            <span className="relative z-10 mt-0.5 shrink-0">
              {done ? (
                <CheckCircle2
                  className={cn(
                    "h-5 w-5",
                    i === currentIndex ? "text-green-800" : "text-green-600",
                  )}
                />
              ) : (
                <Circle className="h-5 w-5 text-navy-200" />
              )}
            </span>

            {/* Status information */}
            <div className="min-w-0 pt-px">
              <p
                className={cn(
                  "text-sm font-medium",
                  done ? "text-navy-900" : "text-navy-400",
                )}
              >
                {STATUS_LABEL[s]}
              </p>

              {event ? (
                <>
                  <p className="mt-1 text-xs font-medium text-navy-500">
                    {formatLocalizedDateTime(event.created_at, settings)}
                  </p>

                  {event.note && (
                    <p className="mt-1 text-xs leading-relaxed text-navy-400">
                      {event.note}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-xs text-navy-400">Pending</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
