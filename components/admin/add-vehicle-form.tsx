"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";

import { createVehicle, type VehicleActionState } from "@/lib/actions/vehicles";

type DriverOption = {
  id: string;
  name: string;
};

type AddVehicleFormProps = {
  drivers: DriverOption[];
};

const initialState: VehicleActionState = {};

export function AddVehicleForm({ drivers }: AddVehicleFormProps) {
  const [state, formAction, pending] = useActionState(
    createVehicle,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Vehicle Information */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent px-6 py-5">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Vehicle information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the basic details for this vehicle.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          {/* Vehicle Number */}
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
              placeholder="e.g. SW-VAN-001"
              required
              maxLength={50}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Internal fleet identification number.
            </p>
          </div>

          {/* Registration */}
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
              placeholder="e.g. ABC-123XY"
              required
              maxLength={50}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 uppercase outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            />
          </div>

          {/* Vehicle Type */}
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
              defaultValue="van"
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            >
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="pickup">Pickup</option>
              <option value="truck">Truck</option>
              <option value="trailer">Trailer</option>
              <option value="other">Other</option>
            </select>
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
              min="0.01"
              step="0.01"
              placeholder="e.g. 1500"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            />
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
              placeholder="e.g. Toyota"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
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
              placeholder="e.g. Hiace"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
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
              min="1900"
              max="2100"
              placeholder="e.g. 2024"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            />
          </div>

          {/* Driver */}
          <div>
            <label
              htmlFor="assigned_driver_id"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Assign driver
            </label>

            <select
              id="assigned_driver_id"
              name="assigned_driver_id"
              defaultValue=""
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            >
              <option value="">No driver assigned</option>

              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>

            <p className="mt-1.5 text-xs text-slate-400">
              Only active drivers are available.
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-transparent px-6 py-5">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Additional information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add any notes that may be useful for fleet management.
          </p>
        </div>

        <div className="p-6">
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
            placeholder="Optional notes about this vehicle..."
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          />
        </div>
      </div>

      {/* Server response */}
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {state.success}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/vehicles"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </Link>

        {/* <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating vehicle...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create vehicle
            </>
          )}
        </button> */}
        <button
          type="submit"
          disabled={pending || !!state.success}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating vehicle...
            </>
          ) : state.success ? (
            <>
              <Save className="h-4 w-4" />
              Vehicle created
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Create vehicle
            </>
          )}
        </button>
      </div>
    </form>
  );
}
