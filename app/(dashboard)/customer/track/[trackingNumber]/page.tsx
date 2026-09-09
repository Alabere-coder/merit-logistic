import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";

import { getShipmentTrackingByNumber } from "@/lib/actions/tracking";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";
import {
  formatLocalizedCurrency,
  formatLocalizedDateTime,
} from "@/lib/localization/format-localized";
import { TrackingMap } from "@/components/tracking/tracking-map";

import { CopyButton } from "@/components/shared/copy-button";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  arrived_at_warehouse: "At Warehouse",
  out_for_delivery: "Out for Delivery",
  arrived_at_delivery_destination: "Arrived at delivery destination",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatStatus(status: string) {
  return STATUS_LABEL[status] ?? status.replaceAll("_", " ");
}

function getStatusClasses(status: string) {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-rose-200";

    case "out_for_delivery":
      return "bg-purple-50 text-purple-700 ring-purple-200";

    case "arrived_at_delivery_destination":
      return "bg-purple-50 text-purple-700 ring-purple-200";

    case "in_transit":
    case "picked_up":
    case "arrived_at_warehouse":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
}

export default async function CustomerTrackingResultPage({
  params,
}: {
  params: Promise<{
    trackingNumber: string;
  }>;
}) {
  const { trackingNumber } = await params;

  const decodedTrackingNumber = decodeURIComponent(trackingNumber);

  const [trackingResult, settings] = await Promise.all([
    getShipmentTrackingByNumber(decodedTrackingNumber),
    getLocalizationSettings(),
  ]);

  if ("error" in trackingResult) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-lg font-bold text-rose-900">
            Unable to find shipment
          </h1>

          <p className="mt-2 text-sm text-rose-700">{trackingResult.error}</p>

          <Link
            href="/customer/track"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Try another tracking number
          </Link>
        </div>
      </div>
    );
  }

  const { shipment } = trackingResult;

  const driverName = shipment.driver
    ? `${shipment.driver.first_name ?? ""} ${
        shipment.driver.last_name ?? ""
      }`.trim() || "Assigned Driver"
    : null;

  const hasCurrentLocation =
    shipment.driver?.current_lat != null &&
    shipment.driver?.current_lng != null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* =================================================
          BACK
      ================================================= */}

      <Link
        href="/customer/track"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Track another shipment
      </Link>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-600">
              {shipment.tracking_number}
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Shipment Tracking
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {shipment.pickup_address}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              → {shipment.delivery_address}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
              shipment.status,
            )}`}
          >
            {formatStatus(shipment.status)}
          </span>
        </div>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">Estimated Delivery</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {shipment.estimated_delivery
                  ? formatLocalizedDateTime(
                      shipment.estimated_delivery,
                      settings,
                    )
                  : "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-2.5">
              <Package className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">Package</p>

              <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                {shipment.package_type}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5">
              <Clock3 className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">Last Updated</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatLocalizedDateTime(shipment.updated_at, settings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {shipment.driver && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Live Tracking
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View the driver's current location and shipment route.
            </p>
          </div>

          <TrackingMap
            driverId={shipment.driver.id}
            currentLocation={
              hasCurrentLocation
                ? {
                    lat: shipment.driver.current_lat!,
                    lng: shipment.driver.current_lng!,
                  }
                : null
            }
            events={shipment.events}
            settings={settings}
            height="420px"
          />
        </div>
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-50 p-2.5">
              <Package className="h-5 w-5 text-brand-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tracking History
              </h2>

              <p className="text-sm text-slate-500">Shipment activity</p>
            </div>
          </div>

          <div className="mt-6">
            {shipment.events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <Clock3 className="mx-auto h-7 w-7 text-slate-300" />

                <p className="mt-2 text-sm text-slate-500">
                  Tracking history is not available yet.
                </p>
              </div>
            ) : (
              <div className="relative space-y-6">
                {shipment.events.map((event, index) => {
                  const isLast = index === shipment.events.length - 1;

                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {!isLast && (
                        <div className="absolute left-3.75 top-8 h-[calc(100%+8px)] w-px bg-slate-200" />
                      )}

                      <div
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          event.status === "delivered"
                            ? "bg-emerald-100"
                            : event.status === "cancelled"
                              ? "bg-rose-100"
                              : "bg-brand-100"
                        }`}
                      >
                        {event.status === "delivered" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Package className="h-4 w-4 text-brand-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatStatus(event.status)}
                          </p>

                          <p className="text-xs text-slate-400">
                            {formatLocalizedDateTime(
                              event.created_at,
                              settings,
                            )}
                          </p>
                        </div>

                        {event.note && (
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {event.note}
                          </p>
                        )}

                        {event.lat != null && event.lng != null && (
                          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Shipment Details */}
        <div className="space-y-6">
          {/* Driver */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900">
              Delivery Details
            </h2>

            {shipment.driver ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {driverName}
                    </p>

                    <p className="text-xs text-slate-500">Delivery Driver</p>
                  </div>
                </div>

                {shipment.driver.phone_number && (
                  <div className="text-sm text-slate-600">
                    <CopyButton value={shipment.driver.phone_number} />
                  </div>
                )}

                {shipment.vehicle && (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-slate-500" />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {shipment.vehicle.vehicle_number}
                        </p>

                        <p className="text-xs text-slate-500">
                          {shipment.vehicle.registration_number}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {hasCurrentLocation && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <MapPin className="h-4 w-4" />
                      Driver location available
                    </div>

                    {shipment.driver.last_location_update && (
                      <p className="mt-1 text-xs text-emerald-600">
                        Updated{" "}
                        {formatLocalizedDateTime(
                          shipment.driver.last_location_update,
                          settings,
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  A driver has not been assigned yet.
                </p>
              </div>
            )}
          </div>

          {/* Package */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900">
              Shipment Details
            </h2>

            <dl className="mt-5 space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <dt className="text-slate-500">Package Type</dt>

                <dd className="font-medium capitalize text-slate-900">
                  {shipment.package_type}
                </dd>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <dt className="text-slate-500">Weight</dt>

                <dd className="font-medium text-slate-900">
                  {shipment.weight_kg} kg
                </dd>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <dt className="text-slate-500">Shipment Price</dt>

                <dd className="font-medium text-slate-900">
                  {formatLocalizedCurrency(shipment.price, settings)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Proof of Delivery */}
          {shipment.proof_of_delivery_url && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                <div>
                  <h2 className="text-sm font-bold text-emerald-900">
                    Delivery Confirmed
                  </h2>

                  <p className="mt-1 text-xs text-emerald-700">
                    Proof of delivery has been recorded.
                  </p>
                </div>
              </div>

              <a
                href={shipment.proof_of_delivery_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View proof of delivery
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
