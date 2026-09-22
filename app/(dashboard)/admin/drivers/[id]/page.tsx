import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";
import { getDriverAssignedVehicle } from "@/lib/actions/vehicles";

import { DriverRowActions } from "@/components/dashboard/driver-row-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, initials } from "@/lib/utils";
import { getLocalizationSettings } from "@/lib/localization/get-localization-settings";
import {
  formatLocalizedCurrency,
  formatLocalizedDateTime,
} from "@/lib/localization/format-localized";

import type { DriverStatus } from "@/types/app";

export const instant = false;

export default async function AdminDriverDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireRole(["admin"]);

  const { id } = await params;

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select(
      `
        id,
        vehicle_type,
        vehicle_plate,
        license_number,
        status,
        created_at,
        user_id,
        current_lat,
        current_lng,
        last_location_update,
        users:user_id (
          id,
          first_name,
          last_name,
          email,
          phone_number,
          is_active
        )
      `,
    )
    .eq("id", id)
    .single();

  const vehicleResult = await getDriverAssignedVehicle(driver?.user_id ?? "");
  const localization = await getLocalizationSettings();

  const { data: driverEarnings, error: earningsError } = await supabase
    .from("driver_earnings")
    .select(
      `
    id,
    shipment_id,
    amount,
    status,
    payment_reference,
    paid_at,
    created_at,
    drivers (
      user_id,
      users!drivers_user_id_fkey (
        first_name,
        last_name,
        email
      )
    ),
    shipments (
      tracking_number
    )
  `,
    )
    .eq("driver_id", id)
    .order("created_at", { ascending: false });

  const earnings = driverEarnings ?? [];

  const totalEarnings = earnings.reduce(
    (total, earning) => total + Number(earning.amount || 0),
    0,
  );

  const pendingEarnings = earnings
    .filter((earning) => earning.status === "pending")
    .reduce((total, earning) => total + Number(earning.amount || 0), 0);

  const paidEarnings = earnings
    .filter((earning) => earning.status === "paid")
    .reduce((total, earning) => total + Number(earning.amount || 0), 0);

  if (driverError || !driver) {
    console.error("ADMIN DRIVER DETAILS ERROR:", driverError);

    return (
      <div className="space-y-6">
        <Link
          href="/admin/drivers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to drivers
        </Link>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-semibold text-rose-900">Unable to load driver</h2>

          <p className="mt-1 text-sm text-rose-700">
            The driver could not be found.
          </p>
        </div>
      </div>
    );
  }

  const user = Array.isArray(driver.users)
    ? (driver.users[0] ?? null)
    : driver.users;

  const vehicle = "success" in vehicleResult ? vehicleResult.vehicle : null;

  const driverName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    "Unnamed driver";

  const driverInitials = initials(
    user?.first_name ?? "",
    user?.last_name ?? "",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/drivers"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to drivers
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-bold text-navy-800 ring-1 ring-inset ring-navy-200">
              {driverInitials}
            </div>

            <div>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900">
                {driverName}
              </h1>

              <p className="mt-1 text-sm text-cyan-600">
                Driver since{" "}
                {formatLocalizedDateTime(driver.created_at, localization)}
              </p>
            </div>
          </div>

          <DriverRowActions
            driverId={driver.id}
            userId={driver.user_id}
            status={driver.status as DriverStatus}
          />
        </div>
      </div>

      {/* Profile and status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact information */}
        <Card className="border border-slate-300/80 bg-white shadow-xs rounded-xl lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-5">
              <h2 className="text-base font-bold text-navy-900">
                Driver information
              </h2>

              <p className="mt-1 text-sm text-cyan-600">
                Contact and identification details.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-navy-50 p-2 text-cyan-600">
                  <Mail className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-medium text-navy-400">Email</p>

                  <p className="mt-1 text-sm font-medium text-navy-800">
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-navy-50 p-2 text-cyan-600">
                  <Phone className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-medium text-navy-400">Phone</p>

                  <p className="mt-1 text-sm font-medium text-navy-800">
                    {user?.phone_number || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-navy-50 p-2 text-cyan-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-medium text-navy-400">
                    License number
                  </p>

                  <p className="mt-1 font-mono text-sm font-medium text-navy-800">
                    {driver.license_number || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-navy-400">
                  Driver status
                </p>

                <div className="mt-2">
                  <Badge
                    variant="secondary"
                    className={
                      driver.status === "active"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        : driver.status === "suspended"
                          ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20"
                          : "bg-navy-100/80 text-navy-600 ring-1 ring-inset ring-navy-200"
                    }
                  >
                    <span className="capitalize">{driver.status}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border border-slate-300/80 bg-white shadow-xs rounded-xl">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-navy-50 p-2 text-cyan-600">
                <MapPin className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-base font-bold text-navy-900">
                  Current location
                </h2>

                <p className="text-xs text-navy-400">
                  Driver location reporting
                </p>
              </div>
            </div>

            {driver.current_lat != null && driver.current_lng != null ? (
              <div>
                <p className="font-mono text-lg font-semibold text-navy-800">
                  {Number(driver.current_lat).toFixed(5)},{" "}
                  {Number(driver.current_lng).toFixed(5)}
                </p>

                {driver.last_location_update && (
                  <p className="mt-2 text-xs text-navy-400">
                    Last updated {formatDate(driver.last_location_update)}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-600">
                  <span className="h-2 w-2 rounded-full bg-navy-300" />
                  Not reporting
                </div>

                <p className="mt-2 text-xs text-navy-400">
                  No current location has been reported by this driver.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assigned vehicle */}
      <Card className="border border-slate-300/80 bg-white shadow-xs rounded-xl">
        <CardContent className="p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Assigned vehicle
              </h2>

              <p className="mt-1 text-sm text-cyan-600">
                Vehicle currently assigned to this driver.
              </p>
            </div>

            {vehicle && (
              <Link
                href={`/admin/vehicles/${vehicle.id}`}
                className="inline-flex items-center justify-center rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
              >
                Manage vehicle
              </Link>
            )}
          </div>

          {vehicle ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-navy-400">
                  Vehicle number
                </p>

                <p className="mt-1 font-semibold text-navy-800">
                  {vehicle.vehicle_number}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-navy-400">
                  Registration
                </p>

                <p className="mt-1 font-mono text-sm font-medium uppercase text-navy-700">
                  {vehicle.registration_number}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-navy-400">Vehicle</p>

                <p className="mt-1 text-sm font-medium capitalize text-navy-800">
                  {vehicle.make && vehicle.model
                    ? `${vehicle.make} ${vehicle.model}`
                    : vehicle.vehicle_type}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-navy-400">Status</p>

                <div className="mt-1">
                  <Badge
                    variant="secondary"
                    className={
                      vehicle.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : vehicle.status === "maintenance"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-navy-100 text-navy-600"
                    }
                  >
                    <span className="capitalize">{vehicle.status}</span>
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-400 bg-navy-50/40 px-6 py-10 text-center">
              <div className="rounded-full bg-white p-3 text-navy-400 ring-1 ring-inset ring-navy-200">
                <Truck className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-semibold text-navy-800">
                No vehicle assigned
              </p>

              <p className="mt-1 max-w-sm text-xs text-cyan-600">
                This driver does not currently have a vehicle assigned. Assign
                one from the Vehicles section.
              </p>

              <Link
                href="/admin/vehicles"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-80"
              >
                View vehicles
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-300/80 bg-white shadow-xs rounded-xl">
        <CardContent className="p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Driver earnings
              </h2>

              <p className="mt-1 text-sm text-cyan-600">
                Earnings and payout history for this driver.
              </p>
            </div>

            <Link
              href={`/admin/earnings/${id}`}
              className="inline-flex items-center justify-center rounded-lg border border-navy-200 bg-cyan-500 text-white px-3 py-2 text-xs font-semibold text-navy-700 transition hover:bg-navy-50"
            >
              View all earnings
            </Link>
          </div>

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-300 bg-navy-50/40 p-4">
              <p className="text-xs font-medium text-navy-400">
                Total earnings
              </p>

              <p className="mt-1 text-xl font-bold text-navy-900">
                {formatLocalizedCurrency(totalEarnings, localization)}
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="text-xs font-medium text-amber-700">
                Pending payout
              </p>

              <p className="mt-1 text-xl font-bold text-amber-800">
                {formatLocalizedCurrency(pendingEarnings, localization)}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-xs font-medium text-emerald-700">Paid</p>

              <p className="mt-1 text-xl font-bold text-emerald-800">
                {formatLocalizedCurrency(paidEarnings, localization)}
              </p>
            </div>
          </div>

          {/* Earnings history */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy-900">
                Recent earnings
              </h3>

              {/* {earnings.length > 0 && (
                <Link
                  href={`/admin/earnings/${id}`}
                  className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                >
                  View all
                </Link>
              )} */}
            </div>

            {earnings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/30 px-6 py-8 text-center">
                <p className="text-sm font-semibold text-navy-700">
                  No earnings yet
                </p>

                <p className="mt-1 text-xs text-navy-400">
                  Earnings will appear here after this driver completes
                  deliveries.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-300">
                <div className="divide-y divide-slate-300">
                  {earnings.slice(0, 5).map((earning) => {
                    const shipment = Array.isArray(earning.shipments)
                      ? earning.shipments[0]
                      : earning.shipments;

                    return (
                      <div
                        key={earning.id}
                        className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          {shipment?.tracking_number ? (
                            <Link
                              href={`/admin/shipments/${earning.shipment_id}`}
                              className="text-sm font-semibold text-navy-800 hover:text-cyan-600"
                            >
                              {shipment.tracking_number}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-navy-800">
                              Shipment
                            </p>
                          )}

                          <p className="mt-1 text-xs text-navy-400">
                            {formatDate(earning.created_at)}
                          </p>

                          {earning.payment_reference && (
                            <p className="mt-1 text-xs text-navy-400">
                              Ref: {earning.payment_reference}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <p className="text-sm font-bold text-navy-900">
                            {formatLocalizedCurrency(
                              Number(earning.amount || 0),
                              localization,
                            )}
                          </p>

                          <Badge
                            variant="secondary"
                            className={
                              earning.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                            }
                          >
                            {earning.status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legacy vehicle information */}
      {(driver.vehicle_type || driver.vehicle_plate) && (
        <Card className="border border-amber-200 bg-amber-50/50 shadow-none rounded-xl">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Legacy driver vehicle data
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              This driver record still contains vehicle information from the
              previous vehicle system. The Vehicles table is now the source of
              truth for vehicle assignments.
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-amber-900">
              {driver.vehicle_type && (
                <span>
                  Type:{" "}
                  <strong className="capitalize">{driver.vehicle_type}</strong>
                </span>
              )}

              {driver.vehicle_plate && (
                <span>
                  Plate:{" "}
                  <strong className="font-mono uppercase">
                    {driver.vehicle_plate}
                  </strong>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
