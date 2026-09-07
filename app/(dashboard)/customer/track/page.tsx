import { Package, Search, Truck } from "lucide-react";

import { TrackingSearchForm } from "@/components/customer/tracking-search-form";

export default function CustomerTrackPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
          <Package className="h-7 w-7 text-brand-600" />
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
          Track Your Shipment
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Enter your tracking number to view the current shipment status,
          estimated delivery time, driver information, and tracking history.
        </p>
      </div>

      {/* =================================================
          SEARCH CARD
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <TrackingSearchForm />
      </div>

      {/* =================================================
          INFORMATION CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Search className="h-5 w-5 text-blue-600" />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-900">
            Enter your number
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Use the tracking number provided when your shipment was created.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
            <Truck className="h-5 w-5 text-purple-600" />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-900">
            Follow the journey
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            See each major stage of your shipment as it moves through the
            delivery process.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Package className="h-5 w-5 text-emerald-600" />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-900">
            Know when it arrives
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            View the estimated delivery time and final delivery confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
