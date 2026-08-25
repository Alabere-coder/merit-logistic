import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateDriverForm } from "@/components/dashboard/create-driver-form";
import { DriverRowActions } from "@/components/dashboard/driver-row-actions";
import { initials, formatDate } from "@/lib/utils";
import { Truck } from "lucide-react";
import type { DriverStatus } from "@/types/app";

export default async function AdminDriversPage() {
  const { supabase } = await requireRole(["admin"]);

  const { data: drivers, error: driversError } = await supabase
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
        first_name,
        last_name,
        email,
        phone_number
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (driversError) {
    console.error("ADMIN DRIVERS ERROR:", driversError);
  }

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
            Drivers
          </h1>
          <p className="mt-0.5 text-sm font-medium text-navy-500">
            Only admins can create driver accounts. Credentials are issued upon
            creation.
          </p>
        </div>
        <div className="shrink-0">
          <CreateDriverForm />
        </div>
      </div>

      {/* Main Table Container */}
      <Card className="overflow-hidden border border-navy-100/80 bg-white shadow-xs rounded-xl">
        <CardContent className="p-0">
          {driversError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-red-50 p-3 text-red-600 ring-1 ring-inset ring-red-100">
                <Truck className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-red-900">
                Unable to load drivers
              </p>
              <p className="mt-1 text-xs text-red-600/90 max-w-sm">
                {driversError.message}
              </p>
            </div>
          ) : (drivers ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-navy-50 p-3 text-navy-400 ring-1 ring-inset ring-navy-100">
                <Truck className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-navy-900">
                No drivers found
              </p>
              <p className="mt-1 text-xs text-navy-500 max-w-sm">
                Add your first driver to start assigning deliveries.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-700">
                <thead>
                  <tr className="border-b border-navy-100/80 bg-navy-50/40 text-[11px] font-bold uppercase tracking-wider text-navy-500">
                    <th scope="col" className="px-6 py-3.5">
                      Driver
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Vehicle
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      License
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Last Location
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-navy-100/60">
                  {(drivers ?? []).map((d) => (
                    <tr
                      key={d.id}
                      className="group transition-colors hover:bg-navy-50/50"
                    >
                      {/* Driver Profile */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100/80 text-xs font-bold text-navy-800 ring-1 ring-inset ring-navy-200/50 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                            {initials(
                              d.users?.first_name ?? "",
                              d.users?.last_name ?? "",
                            )}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold text-navy-900 group-hover:text-brand-600 transition-colors">
                              {d.users?.first_name} {d.users?.last_name}
                            </span>
                            <span className="text-xs font-normal text-navy-400">
                              {d.users?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-navy-800 capitalize">
                            {d.vehicle_type || "—"}
                          </span>
                          {d.vehicle_plate && (
                            <span className="font-mono text-xs text-navy-400 uppercase">
                              {d.vehicle_plate}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* License */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-medium text-navy-600">
                        {d.license_number || (
                          <span className="text-navy-300">—</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-navy-500">
                        {formatDate(d.created_at)}
                      </td>

                      {/* Location & Pulse */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {d.current_lat && d.current_lng ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-navy-700">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                              </span>
                              {Number(d.current_lat).toFixed(3)},{" "}
                              {Number(d.current_lng).toFixed(3)}
                            </div>
                            {d.last_location_update && (
                              <span className="text-[11px] text-navy-400 pl-3.5">
                                {formatDate(d.last_location_update)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-navy-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-navy-300" />
                            Not reporting
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={
                            d.status === "active"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
                              : d.status === "suspended"
                                ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 hover:bg-rose-100"
                                : "bg-navy-100/80 text-navy-600 ring-1 ring-inset ring-navy-200 hover:bg-navy-200/60"
                          }
                        >
                          <span className="capitalize">{d.status}</span>
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DriverRowActions
                          driverId={d.id}
                          userId={d.user_id}
                          status={d.status as DriverStatus}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
