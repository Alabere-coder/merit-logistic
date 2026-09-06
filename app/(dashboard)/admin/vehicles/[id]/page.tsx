import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";
import {
  getAdminVehicle,
  getVehicleDrivers,
  type VehicleStatus,
  type VehicleType,
} from "@/lib/actions/vehicles";

import { ManageVehicleForm } from "@/components/admin/manage-vehicle-form";

export default async function ManageVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);

  const { id } = await params;

  const [vehicleResult, driversResult] = await Promise.all([
    getAdminVehicle(id),
    getVehicleDrivers(),
  ]);

  if ("error" in vehicleResult) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/vehicles"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to vehicles
        </Link>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-semibold text-rose-900">
            Unable to load vehicle
          </h2>

          <p className="mt-1 text-sm text-rose-700">{vehicleResult.error}</p>
        </div>
      </div>
    );
  }

  const drivers =
    "success" in driversResult ? (driversResult.drivers ?? []) : [];

  const vehicle = vehicleResult.vehicle;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/vehicles"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to vehicles
        </Link>

        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
            <Truck className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-medium text-blue-600">
              {vehicle.vehicle_number}
            </p>

            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
              Manage vehicle
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update vehicle information, assignment, and status.
            </p>
          </div>
        </div>
      </div>

      {/* Driver loading warning */}
      {"error" in driversResult && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            Driver list could not be loaded.
          </p>

          <p className="mt-1 text-sm text-amber-700">
            You can still update the vehicle details. Driver assignment can be
            completed later.
          </p>
        </div>
      )}

      <ManageVehicleForm
        vehicle={{
          id: vehicle.id,
          vehicle_number: vehicle.vehicle_number,
          registration_number: vehicle.registration_number,

          vehicle_type: vehicle.vehicle_type as VehicleType,

          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          capacity_kg: vehicle.capacity_kg,
          assigned_driver_id: vehicle.assigned_driver_id,

          status: vehicle.status as VehicleStatus,

          notes: vehicle.notes,
        }}
        drivers={drivers}
      />
    </div>
  );
}
