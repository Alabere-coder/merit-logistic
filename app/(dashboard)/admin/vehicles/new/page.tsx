import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";
import { getVehicleDrivers } from "@/lib/actions/vehicles";
import { AddVehicleForm } from "@/components/admin/add-vehicle-form";

export default async function AddVehiclePage() {
  await requireRole(["admin"]);

  const driversResult = await getVehicleDrivers();

  const drivers = "success" in driversResult ? driversResult.drivers ?? [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/vehicles"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to vehicles
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <Truck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Add vehicle
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Add a vehicle to your delivery fleet.
              </p>
            </div>
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
            You can create the vehicle without assigning a driver and assign one
            later.
          </p>
        </div>
      )}

      {/* Form */}
      <AddVehicleForm drivers={drivers} />
    </div>
  );
}
