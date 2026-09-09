import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";

import { getShipmentTracking } from "@/lib/actions/tracking";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";
import {
  formatLocalizedCurrency,
  formatLocalizedDateTime,
} from "@/lib/localization/format-localized";

import { TrackingMap } from "@/components/tracking/tracking-map";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  arrived_at_warehouse: "At Warehouse",
  out_for_delivery: "Out for Delivery",
  arrived_at_delivery_destination: "Arrived at Delivery Destination",
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
    case "arrived_at_delivery_destination":
      return "bg-purple-50 text-purple-700 ring-purple-200";

    case "in_transit":
    case "picked_up":
    case "arrived_at_warehouse":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    case "approved":
      return "bg-cyan-50 text-cyan-700 ring-cyan-200";

    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
}

function getTimelineIconClasses(status: string) {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-600";

    case "cancelled":
      return "bg-rose-100 text-rose-600";

    case "arrived_at_delivery_destination":
    case "out_for_delivery":
      return "bg-purple-100 text-purple-600";

    default:
      return "bg-brand-100 text-brand-600";
  }
}

function getLocationFreshness(lastUpdate: string | null) {
  if (!lastUpdate) {
    return {
      label: "No location update",
      description: "The driver has not submitted a location yet.",
      classes: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    };
  }

  const updatedAt = new Date(lastUpdate).getTime();

  if (Number.isNaN(updatedAt)) {
    return {
      label: "Unknown",
      description: "Location timestamp could not be determined.",
      classes: "border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    };
  }

  const ageMinutes = (Date.now() - updatedAt) / (1000 * 60);

  if (ageMinutes <= 2) {
    return {
      label: "Live",
      description: "Driver location was updated within the last 2 minutes.",
      classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  if (ageMinutes <= 10) {
    return {
      label: "Recent",
      description: "Driver location was updated within the last 10 minutes.",
      classes: "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    };
  }

  return {
    label: "Stale",
    description: "The driver's location has not been updated recently.",
    classes: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  };
}

export default async function AdminTrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [trackingResult, settings] = await Promise.all([
    getShipmentTracking(id),
    getLocalizationSettings(),
  ]);

  if ("error" in trackingResult) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/tracking"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tracking
        </Link>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-lg font-bold text-rose-900">
            Unable to load shipment
          </h1>

          <p className="mt-2 text-sm text-rose-700">{trackingResult.error}</p>
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

  const locationFreshness = getLocationFreshness(
    shipment.driver?.last_location_update ?? null,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* =====================================================
          BACK
      ===================================================== */}

      <Link
        href="/admin/tracking"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tracking
      </Link>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-sm font-semibold tracking-wide text-brand-600">
                {shipment.tracking_number}
              </p>

              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                  shipment.status,
                )}`}
              >
                {formatStatus(shipment.status)}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Shipment Tracking
            </h1>

            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>
                <span className="font-medium text-slate-700">From:</span>{" "}
                {shipment.pickup_address}
              </p>

              <p>
                <span className="font-medium text-slate-700">To:</span>{" "}
                {shipment.delivery_address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Created</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatLocalizedDateTime(shipment.created_at, settings)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Last Updated</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatLocalizedDateTime(shipment.updated_at, settings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>

            <div className="min-w-0">
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
            <div className="rounded-xl bg-amber-50 p-2.5">
              <Package className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">Weight</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {shipment.weight_kg} kg
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
              <p className="text-xs text-slate-500">Shipment Value</p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatLocalizedCurrency(shipment.price, settings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
        {/* ===================================================
            LEFT COLUMN
        =================================================== */}

        <div className="space-y-6">
          {/* -------------------------------------------------
              LIVE MAP
          ------------------------------------------------- */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <MapPin className="h-5 w-5 text-brand-600" />
                    Live Tracking
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Monitor the driver's current location and shipment movement.
                  </p>
                </div>

                {shipment.driver && (
                  <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${locationFreshness.classes}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${locationFreshness.dot}`}
                    />

                    {locationFreshness.label}
                  </div>
                )}
              </div>
            </div>

            {shipment.driver ? (
              <div>
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
                  height="460px"
                />
              </div>
            ) : (
              <div className="flex min-h-75 items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Truck className="h-6 w-6 text-slate-400" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No driver assigned
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Live driver tracking will become available once a driver is
                    assigned to this shipment.
                  </p>
                </div>
              </div>
            )}

            {shipment.driver && shipment.driver.last_location_update && (
              <div className="border-t border-slate-200 px-6 py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    {locationFreshness.description}
                  </p>

                  <p className="text-xs font-medium text-slate-600">
                    Last location update:{" "}
                    {formatLocalizedDateTime(
                      shipment.driver.last_location_update,
                      settings,
                    )}
                  </p>
                </div>

                {hasCurrentLocation && (
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {shipment.driver.current_lat!.toFixed(6)},{" "}
                    {shipment.driver.current_lng!.toFixed(6)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* -------------------------------------------------
              TIMELINE
          ------------------------------------------------- */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-50 p-2.5">
                <Clock3 className="h-5 w-5 text-brand-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Shipment Activity
                </h2>

                <p className="text-sm text-slate-500">
                  Complete tracking timeline
                </p>
              </div>
            </div>

            <div className="mt-6">
              {shipment.events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <Clock3 className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No tracking events yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Shipment activity will appear here as the status changes.
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
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getTimelineIconClasses(
                            event.status,
                          )}`}
                        >
                          {event.status === "delivered" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Package className="h-4 w-4" />
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
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-500">
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
        </div>

        {/* ===================================================
            RIGHT COLUMN
        =================================================== */}

        <div className="space-y-6">
          {/* -------------------------------------------------
              DRIVER
          ------------------------------------------------- */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <User className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">Driver</h2>

                <p className="text-sm text-slate-500">
                  Assigned delivery driver
                </p>
              </div>
            </div>

            {shipment.driver ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-500">Name</p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {driverName}
                  </p>
                </div>

                {shipment.driver.phone_number && (
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>

                    <a
                      href={`tel:${shipment.driver.phone_number}`}
                      className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition hover:text-brand-700"
                    >
                      <Phone className="h-4 w-4" />
                      {shipment.driver.phone_number}
                    </a>
                  </div>
                )}

                <div
                  className={`rounded-xl border p-4 ${locationFreshness.classes}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${locationFreshness.dot}`}
                    />

                    <p className="text-sm font-semibold">
                      Location: {locationFreshness.label}
                    </p>
                  </div>

                  <p className="mt-1 text-xs leading-5 opacity-80">
                    {locationFreshness.description}
                  </p>

                  {shipment.driver.last_location_update && (
                    <p className="mt-2 text-xs">
                      Updated{" "}
                      {formatLocalizedDateTime(
                        shipment.driver.last_location_update,
                        settings,
                      )}
                    </p>
                  )}
                </div>

                <Link
                  href={`/admin/drivers/${shipment.driver.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  View driver profile
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  No driver has been assigned to this shipment.
                </p>
              </div>
            )}
          </div>

          {/* -------------------------------------------------
              VEHICLE
          ------------------------------------------------- */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-2.5">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">Vehicle</h2>

                <p className="text-sm text-slate-500">
                  Assigned delivery vehicle
                </p>
              </div>
            </div>

            {shipment.vehicle ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Vehicle Number</p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {shipment.vehicle.vehicle_number}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {shipment.vehicle.registration_number}
                  </p>
                </div>

                <dl className="space-y-3">
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-slate-500">Type</dt>

                    <dd className="font-medium capitalize text-slate-900">
                      {shipment.vehicle.vehicle_type}
                    </dd>
                  </div>

                  {(shipment.vehicle.make || shipment.vehicle.model) && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className="text-slate-500">Make / Model</dt>

                      <dd className="text-right font-medium text-slate-900">
                        {[shipment.vehicle.make, shipment.vehicle.model]
                          .filter(Boolean)
                          .join(" ")}
                      </dd>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-slate-500">Status</dt>

                    <dd className="font-medium capitalize text-slate-900">
                      {shipment.vehicle.status}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  No vehicle is currently assigned.
                </p>
              </div>
            )}
          </div>

          {/* -------------------------------------------------
              SHIPMENT DETAILS
          ------------------------------------------------- */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5">
                <Package className="h-5 w-5 text-amber-600" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Shipment Details
                </h2>

                <p className="text-sm text-slate-500">Package information</p>
              </div>
            </div>

            <dl className="mt-5 space-y-4">
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

              <div className="border-t border-slate-100 pt-4">
                <dt className="text-xs text-slate-500">Sender</dt>

                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {shipment.sender_name}
                </dd>

                <dd className="mt-1 text-xs text-slate-500">
                  {shipment.sender_phone}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Receiver</dt>

                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {shipment.receiver_name}
                </dd>

                <dd className="mt-1 text-xs text-slate-500">
                  {shipment.receiver_phone}
                </dd>
              </div>
            </dl>
          </div>

          {/* -------------------------------------------------
              PROOF OF DELIVERY
          ------------------------------------------------- */}

          {shipment.proof_of_delivery_url ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-emerald-900">
                    Proof of Delivery
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    Delivery proof has been uploaded for this shipment.
                  </p>
                </div>
              </div>

              <a
                href={shipment.proof_of_delivery_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-100"
              >
                View Proof of Delivery
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <CheckCircle2 className="h-5 w-5 text-slate-400" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Proof of Delivery
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    No proof of delivery has been uploaded yet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
