import Link from "next/link";
import { CalendarDays, Eye, MapPin, Package, Truck, User } from "lucide-react";

import { getAdminTracking } from "@/lib/actions/tracking";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";
import { formatLocalizedDateTime } from "@/lib/localization/format-localized";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  arrived_at_warehouse: "At Warehouse",
  out_for_delivery: "Out for Delivery",
  arrived_at_delivery_destination: "Arrived at destination",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function getStatusClasses(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

    case "approved":
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";

    case "picked_up":
    case "in_transit":
    case "arrived_at_warehouse":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200";

    case "out_for_delivery":
      return "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200";

    case "arrived_at_delivery_destination":
      return "bg-purple-50 text-purple-800 ring-1 ring-inset ring-purple-300";

    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";

    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
}

function formatStatus(status: string) {
  return STATUS_LABEL[status] ?? status.replaceAll("_", " ");
}

export default async function AdminTrackingPage() {
  const [trackingResult, settings] = await Promise.all([
    getAdminTracking(),
    getLocalizationSettings(),
  ]);

  if ("error" in trackingResult) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="font-semibold text-rose-900">Unable to load tracking</h2>

        <p className="mt-1 text-sm text-rose-700">{trackingResult.error}</p>
      </div>
    );
  }

  const shipments = trackingResult.shipments;

  const activeShipments = shipments.filter(
    (shipment) =>
      shipment.status !== "delivered" && shipment.status !== "cancelled",
  );

  const deliveredShipments = shipments.filter(
    (shipment) => shipment.status === "delivered",
  );

  const cancelledShipments = shipments.filter(
    (shipment) => shipment.status === "cancelled",
  );

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Shipment Operations
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Tracking
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor shipment progress, drivers, vehicles, and delivery activity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-cyan-600">
          <Package className="h-4 w-4" />

          <span>
            {shipments.length}{" "}
            {shipments.length === 1 ? "shipment" : "shipments"}
          </span>
        </div>
      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Shipments</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {shipments.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {activeShipments.length}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Delivered</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {deliveredShipments.length}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Cancelled</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {cancelledShipments.length}
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 p-3">
              <Package className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          TRACKING TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Shipment Tracking
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current status and latest tracking information for every shipment.
            </p>
          </div>
        </div>

        {shipments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No shipments to track
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Shipment tracking information will appear here once shipments are
              created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-300 w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Shipment
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Driver
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Vehicle
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last Event
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ETA
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {shipments.map((shipment) => {
                  const latestEvent = shipment.latest_event;

                  const hasDriverLocation =
                    shipment.driver?.current_lat != null &&
                    shipment.driver?.current_lng != null;

                  return (
                    <tr
                      key={shipment.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      {/* Shipment */}
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/admin/shipments/${shipment.id}`}
                            className="font-semibold text-brand-600 hover:text-brand-700"
                          >
                            {shipment.tracking_number}
                          </Link>

                          <p className="mt-1 max-w-55 truncate text-xs text-slate-500">
                            {shipment.pickup_address}
                          </p>

                          <p className="mt-0.5 max-w-55 truncate text-xs text-slate-400">
                            → {shipment.delivery_address}
                          </p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        {shipment.customer ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {shipment.customer.name}
                              </p>

                              <p className="text-xs text-slate-400">Customer</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Unknown
                          </span>
                        )}
                      </td>

                      {/* Driver */}
                      <td className="px-6 py-4">
                        {shipment.driver ? (
                          <Link
                            href={`/admin/drivers/${shipment.driver.id}`}
                            className="group flex items-center gap-2"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                              <Truck className="h-4 w-4 text-blue-600" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-800 group-hover:text-brand-600">
                                {shipment.driver.name}
                              </p>

                              {shipment.driver.phone && (
                                <p className="text-xs text-slate-400">
                                  {shipment.driver.phone}
                                </p>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        {shipment.vehicle ? (
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {shipment.vehicle.vehicle_number}
                            </p>

                            <p className="text-xs text-slate-400">
                              {shipment.vehicle.registration_number}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No vehicle
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            shipment.status,
                          )}`}
                        >
                          {formatStatus(shipment.status)}
                        </span>
                      </td>

                      {/* Last Event */}
                      <td className="px-6 py-4">
                        {latestEvent ? (
                          <div className="max-w-55">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                              <span className="text-xs font-medium text-slate-700">
                                {formatStatus(latestEvent.status)}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatLocalizedDateTime(
                                latestEvent.created_at,
                                settings,
                              )}
                            </p>

                            {latestEvent.note && (
                              <p className="mt-1 truncate text-xs text-slate-400">
                                {latestEvent.note}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No events yet
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        {hasDriverLocation ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <MapPin className="h-4 w-4" />

                              <span className="text-xs font-semibold">
                                Location available
                              </span>
                            </div>

                            {shipment.driver?.last_location_update && (
                              <p className="mt-1 text-xs text-slate-400">
                                {formatLocalizedDateTime(
                                  shipment.driver.last_location_update,
                                  settings,
                                )}
                              </p>
                            )}
                          </div>
                        ) : latestEvent?.lat != null &&
                          latestEvent?.lng != null ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-blue-600">
                              <MapPin className="h-4 w-4" />

                              <span className="text-xs font-semibold">
                                Last event location
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {latestEvent.lat.toFixed(5)},{" "}
                              {latestEvent.lng.toFixed(5)}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MapPin className="h-4 w-4" />

                            <span className="text-xs">No location</span>
                          </div>
                        )}
                      </td>

                      {/* ETA */}
                      <td className="px-6 py-4">
                        {shipment.estimated_delivery ? (
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                            <span className="text-xs text-slate-600">
                              {formatLocalizedDateTime(
                                shipment.estimated_delivery,
                                settings,
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not available
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          // href={`/admin/shipments/${shipment.id}`}
                          href={`/admin/tracking/${shipment.id}`}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
