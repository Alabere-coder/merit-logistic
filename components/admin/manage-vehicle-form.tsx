"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

import {
  deleteVehicle,
  updateVehicle,
  type VehicleActionState,
  type VehicleStatus,
  type VehicleType,
} from "@/lib/actions/vehicles";

type DriverOption = {
  id: string;
  name: string;
};

type Vehicle = {
  id: string;
  vehicle_number: string;
  registration_number: string;
  vehicle_type: VehicleType;
  make: string | null;
  model: string | null;
  year: number | null;
  capacity_kg: number | null;
  assigned_driver_id: string | null;
  status: VehicleStatus;
  notes: string | null;
};

type ManageVehicleFormProps = {
  vehicle: Vehicle;
  drivers: DriverOption[];
};

const initialState: VehicleActionState = {};

const vehicleTypes: {
  value: VehicleType;
  label: string;
}[] = [
  { value: "motorcycle", label: "Motorcycle" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "pickup", label: "Pickup" },
  { value: "truck", label: "Truck" },
  { value: "trailer", label: "Trailer" },
  { value: "other", label: "Other" },
];

const vehicleStatuses: {
  value: VehicleStatus;
  label: string;
}[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
];

export function ManageVehicleForm({
  vehicle,
  drivers,
}: ManageVehicleFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    updateVehicle,
    initialState,
  );

  const [deleteError, setDeleteError] = useState("");
  const [deletePending, startDeleteTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete vehicle "${vehicle.vehicle_number}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");

    startDeleteTransition(async () => {
      const result = await deleteVehicle(vehicle.id);

      if ("error" in result) {
        setDeleteError(result.error ?? "Unable to delete vehicle.");
        return;
      }

      router.push("/admin/vehicles");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Edit form */}
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="vehicle_id" value={vehicle.id} />

        {/* Vehicle details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">
              Vehicle details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the vehicle's identification and specifications.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Vehicle number */}
            <div>
              <label
                htmlFor="vehicle_number"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Vehicle number
              </label>

              <input
                id="vehicle_number"
                name="vehicle_number"
                type="text"
                defaultValue={vehicle.vehicle_number}
                required
                maxLength={50}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Registration number */}
            <div>
              <label
                htmlFor="registration_number"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Registration number
              </label>

              <input
                id="registration_number"
                name="registration_number"
                type="text"
                defaultValue={vehicle.registration_number}
                required
                maxLength={50}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Vehicle type */}
            <div>
              <label
                htmlFor="vehicle_type"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Vehicle type
              </label>

              <select
                id="vehicle_type"
                name="vehicle_type"
                defaultValue={vehicle.vehicle_type}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue={vehicle.status}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {vehicleStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Make */}
            <div>
              <label
                htmlFor="make"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Make
              </label>

              <input
                id="make"
                name="make"
                type="text"
                defaultValue={vehicle.make ?? ""}
                maxLength={100}
                placeholder="e.g. Toyota"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Model */}
            <div>
              <label
                htmlFor="model"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Model
              </label>

              <input
                id="model"
                name="model"
                type="text"
                defaultValue={vehicle.model ?? ""}
                maxLength={100}
                placeholder="e.g. Hiace"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Year */}
            <div>
              <label
                htmlFor="year"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Year
              </label>

              <input
                id="year"
                name="year"
                type="number"
                min={1900}
                max={2100}
                defaultValue={vehicle.year ?? ""}
                placeholder="e.g. 2024"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Capacity */}
            <div>
              <label
                htmlFor="capacity_kg"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Capacity (kg)
              </label>

              <input
                id="capacity_kg"
                name="capacity_kg"
                type="number"
                min="0"
                step="0.01"
                defaultValue={vehicle.capacity_kg ?? ""}
                placeholder="e.g. 1500"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Driver */}
            <div className="md:col-span-2">
              <label
                htmlFor="assigned_driver_id"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Assigned driver
              </label>

              <select
                id="assigned_driver_id"
                name="assigned_driver_id"
                defaultValue={vehicle.assigned_driver_id ?? ""}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">No driver assigned</option>

                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                rows={5}
                defaultValue={vehicle.notes ?? ""}
                maxLength={5000}
                placeholder="Add any additional information about this vehicle..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Form feedback */}
        {state.error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {state.error}
          </div>
        )}

        {state.success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            {state.success}
          </div>
        )}

        {/* Form actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/vehicles"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-2xl border border-rose-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-rose-100 p-2.5 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">Danger zone</h2>

            <p className="mt-1 text-sm text-slate-500">
              Permanently remove this vehicle from your fleet. This action
              cannot be undone.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
              >
                {deleteError}
              </div>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePending}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletePending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete vehicle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
