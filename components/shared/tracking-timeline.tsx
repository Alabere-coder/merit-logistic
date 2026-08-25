import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { SHIPMENT_STATUS_FLOW, STATUS_LABEL } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import type { ShipmentStatus } from "@/types/app";

export function TrackingTimeline({
  status,
  events,
}: {
  status: ShipmentStatus;
  events: {
    status: ShipmentStatus;
    created_at: string;
    note?: string | null;
  }[];
}) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <XCircle className="h-5 w-5 shrink-0" />
        This shipment was cancelled.
      </div>
    );
  }

  const currentIndex = SHIPMENT_STATUS_FLOW.indexOf(status);
  const eventTimeFor = (s: ShipmentStatus) =>
    [...events].reverse().find((e) => e.status === s)?.created_at;

  return (
    <ol className="relative space-y-0">
      {SHIPMENT_STATUS_FLOW.map((s, i) => {
        const done = i <= currentIndex;
        const isLast = i === SHIPMENT_STATUS_FLOW.length - 1;
        const time = eventTimeFor(s);

        return (
          <li key={s} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-2.25 top-6 h-full w-0.5",
                  done && i < currentIndex ? "bg-brand-500" : "bg-navy-100",
                )}
              />
            )}
            <span className="relative z-10 mt-0.5 shrink-0">
              {done ? (
                <CheckCircle2
                  className={cn(
                    "h-5 w-5",
                    i === currentIndex ? "text-brand-500" : "text-brand-500",
                  )}
                />
              ) : (
                <Circle className="h-5 w-5 text-navy-200" />
              )}
            </span>
            <div className="min-w-0 pt-px">
              <p
                className={cn(
                  "text-sm font-medium",
                  done ? "text-navy-900" : "text-navy-400",
                )}
              >
                {STATUS_LABEL[s]}
              </p>
              <p className="text-xs text-navy-400">
                {time ? formatDate(time) : "Pending"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
