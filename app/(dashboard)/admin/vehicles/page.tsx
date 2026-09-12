import Link from "next/link";

import {
  CarFront,
  CheckCircle2,
  Clock3,
  Plus,
  Settings2,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";
import { getAdminVehicles } from "@/lib/actions/vehicles";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function formatVehicleType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClasses(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "maintenance":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "inactive":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getDriverName(
  driver: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null,
) {
  if (!driver) {
    return "Unassigned";
  }

  const name = `${driver.first_name ?? ""} ${driver.last_name ?? ""}`.trim();

  return name || driver.email || "Driver";
}

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  await requireRole(["admin"]);

  const { created } = await searchParams;

  const result = await getAdminVehicles();

  if ("error" in result) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-semibold text-rose-900">
            Unable to load vehicles
          </h2>

          <p className="mt-1 text-sm text-rose-700">{result.error}</p>
        </div>
      </div>
    );
  }

  const vehicles = result.vehicles;

  const totalVehicles = vehicles.length;

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "active",
  ).length;

  const maintenanceVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "maintenance",
  ).length;

  const unassignedVehicles = vehicles.filter(
    (vehicle) => !vehicle.assigned_driver_id,
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-md shadow-blue-500/20">
              <Truck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Vehicles
              </h1>

              <p className="text-sm text-slate-500">
                Manage your delivery fleet and driver assignments.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/vehicles/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-70"
        >
          <Plus className="h-4 w-4" />
          Add vehicle
        </Link>
      </div>

      {/* Success message */}
      {created === "1" && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />

          <span>Vehicle created successfully.</span>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total vehicles
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalVehicles}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <CarFront className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {activeVehicles}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Maintenance
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {maintenanceVehicles}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Unassigned
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-700">
                  {unassignedVehicles}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <UserRound className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Table */}
      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-linear-to-r from-cyan-50/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-cyan-600">
              <Truck className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Vehicle fleet
              </h2>

              <p className="text-xs text-slate-500">
                View and manage all registered vehicles.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Truck className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No vehicles yet
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Add your first vehicle to start managing your delivery fleet.
              </p>

              <Link
                href="/admin/vehicles/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add vehicle
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Vehicle
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Driver
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Capacity
                    </th>

                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((vehicle) => {
                    const driver = Array.isArray(vehicle.assigned_driver)
                      ? (vehicle.assigned_driver[0] ?? null)
                      : vehicle.assigned_driver;

                    return (
                      <tr
                        key={vehicle.id}
                        className="transition hover:bg-slate-50/60"
                      >
                        {/* Vehicle */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {vehicle.vehicle_number}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {vehicle.registration_number}
                            </p>

                            {(vehicle.make || vehicle.model) && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {[vehicle.make, vehicle.model]
                                  .filter(Boolean)
                                  .join(" ")}

                                {vehicle.year ? ` · ${vehicle.year}` : ""}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {formatVehicleType(vehicle.vehicle_type)}
                          </span>
                        </td>

                        {/* Driver */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <UserRound className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {getDriverName(driver)}
                              </p>

                              {driver?.email && (
                                <p className="text-xs text-slate-400">
                                  {driver.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Capacity */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-700">
                            {vehicle.capacity_kg
                              ? `${vehicle.capacity_kg} kg`
                              : "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              vehicle.status,
                            )}`}
                          >
                            {vehicle.status === "maintenance" && (
                              <Wrench className="h-3 w-3" />
                            )}

                            {vehicle.status === "active" && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}

                            {vehicle.status === "inactive" && (
                              <Clock3 className="h-3 w-3" />
                            )}

                            {formatStatus(vehicle.status)}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/vehicles/${vehicle.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
