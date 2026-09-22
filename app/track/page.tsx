import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicShipment } from "@/lib/shipments/get-public-shipment";

export const instant = false;

type ShipmentStatus =
  | "pending"
  | "approved"
  | "picked_up"
  | "in_transit"
  | "arrived_at_warehouse"
  | "out_for_delivery"
  | "arrived_at_delivery_destination"
  | "delivered"
  | "cancelled";

const statusSteps: {
  status: ShipmentStatus;
  label: string;
  description: string;
}[] = [
  {
    status: "pending",
    label: "Shipment created",
    description: "Your shipment has been created and is awaiting processing.",
  },
  {
    status: "approved",
    label: "Shipment approved",
    description: "Your shipment has been reviewed and approved for processing.",
  },
  {
    status: "picked_up",
    label: "Picked up",
    description: "Your shipment has been collected and is on its way.",
  },
  {
    status: "in_transit",
    label: "In transit",
    description: "Your shipment is currently moving toward its destination.",
  },
  {
    status: "arrived_at_warehouse",
    label: "Arrived at warehouse",
    description: "Your shipment has arrived at a processing facility.",
  },
  {
    status: "out_for_delivery",
    label: "Out for delivery",
    description:
      "Your shipment is with the delivery team and is on its final journey.",
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Your shipment has been successfully delivered.",
  },
];

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusIndex(status: ShipmentStatus) {
  return statusSteps.findIndex((step) => step.status === status);
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ tracking?: string }>;
}) {
  const params = await searchParams;
  const trackingNumber = params.tracking?.trim() ?? "";

  {
    /* Shipment lookup */
  }

  const shipment = trackingNumber
    ? await getPublicShipment(trackingNumber)
    : null;

  const currentIndex = shipment ? getStatusIndex(shipment.status) : -1;

  const isCancelled = shipment?.status === "cancelled";
  const isDelivered = shipment?.status === "delivered";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-lg mx-auto px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </section>

      {/* Hero */}
      <section className="bg-slate-950 px-4 py-14 sm:px-6">
        <div className="container-lg mx-auto text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
            <Search className="h-7 w-7 text-cyan-400" />
          </div>

          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Track your shipment
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-400">
            Enter your tracking number to see the latest available information
            about your shipment.
          </p>

          <form
            action="/track"
            method="get"
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <input
              name="tracking"
              defaultValue={trackingNumber}
              placeholder="Enter your tracking number"
              className="h-12 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />

            <Button
              type="submit"
              size="lg"
              className="h-12 bg-cyan-500 px-7 text-slate-950 hover:bg-cyan-400"
            >
              <Search className="mr-2 h-4 w-4" />
              Track shipment
            </Button>
          </form>
        </div>
      </section>

      {/* Empty state */}
      {!trackingNumber && (
        <section className="container-lg mx-auto px-4 py-16 sm:px-6">
          <Card className="mx-auto max-w-2xl border-slate-200">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50">
                <Package className="h-7 w-7 text-cyan-700" />
              </div>

              <h2 className="mt-5 font-display text-xl font-semibold text-slate-900">
                Enter your tracking number
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your tracking number can be found in your shipment information
                and delivery notifications.
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Shipment not found */}
      {trackingNumber && !shipment && (
        <section className="container-lg mx-auto px-4 py-16 sm:px-6">
          <Card className="mx-auto max-w-2xl border-slate-200">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <Search className="h-7 w-7 text-red-600" />
              </div>

              <h2 className="mt-5 font-display text-xl font-semibold text-slate-900">
                Shipment not found
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                We couldn't find a shipment matching{" "}
                <span className="font-mono font-medium text-slate-700">
                  {trackingNumber}
                </span>
                .
              </p>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Please check your tracking number and try again. If you believe
                the tracking number is correct, contact our support team.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/track">
                  <Button variant="outline">Try another number</Button>
                </Link>

                <Link href="/contact">
                  <Button>Contact support</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Shipment result */}
      {shipment && (
        <section className="container-lg mx-auto px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Main tracking card */}
            <Card className="border-slate-200">
              <CardContent className="p-6 sm:p-8">
                {/* Tracking heading */}
                <div className="flex flex-col justify-between gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tracking number
                    </p>

                    <h2 className="mt-1 font-mono text-xl font-semibold text-slate-900">
                      {shipment.tracking_number}
                    </h2>
                  </div>

                  <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                      isCancelled
                        ? "bg-red-50 text-red-700"
                        : isDelivered
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-cyan-50 text-cyan-700"
                    }`}
                  >
                    {isCancelled ? (
                      <XCircle className="h-4 w-4" />
                    ) : isDelivered ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock3 className="h-4 w-4" />
                    )}

                    {formatStatus(shipment.status)}
                  </div>
                </div>

                {/* Route */}
                <div className="grid gap-6 border-b border-slate-100 py-7 sm:grid-cols-2">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <MapPin className="h-5 w-5 text-slate-600" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        From
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {shipment.pickup_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                      <MapPin className="h-5 w-5 text-cyan-700" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        To
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {shipment.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {!isCancelled && (
                  <div className="py-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-slate-900">
                          Shipment progress
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {statusSteps[currentIndex]?.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      {statusSteps.map((step, index) => {
                        const completed = index <= currentIndex;
                        const current = index === currentIndex;

                        return (
                          <div
                            key={step.status}
                            className="relative flex gap-4 pb-8 last:pb-0"
                          >
                            {index < statusSteps.length - 1 && (
                              <div
                                className={`absolute left-3.75 top-8 h-[calc(100%-8px)] w-px ${
                                  index < currentIndex
                                    ? "bg-cyan-500"
                                    : "bg-slate-200"
                                }`}
                              />
                            )}

                            <div
                              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                                completed
                                  ? "border-cyan-500 bg-cyan-500 text-white"
                                  : "border-slate-200 bg-white text-slate-300"
                              }`}
                            >
                              {completed ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-current" />
                              )}
                            </div>

                            <div className="pt-1">
                              <p
                                className={`text-sm font-semibold ${
                                  current
                                    ? "text-cyan-700"
                                    : completed
                                      ? "text-slate-900"
                                      : "text-slate-400"
                                }`}
                              >
                                {step.label}
                                {current && (
                                  <span className="ml-2 rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                                    Current
                                  </span>
                                )}
                              </p>

                              <p
                                className={`mt-1 text-sm leading-6 ${
                                  completed
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled */}
                {isCancelled && (
                  <div className="my-7 rounded-xl border border-red-100 bg-red-50 p-5">
                    <div className="flex gap-3">
                      <XCircle className="h-5 w-5 shrink-0 text-red-600" />

                      <div>
                        <h3 className="font-semibold text-red-900">
                          Shipment cancelled
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-red-700">
                          This shipment has been cancelled. Please contact
                          support if you need additional information.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last update */}
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Last update
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {new Date(shipment.updated_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    Shipment details
                  </h3>

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Package type
                      </span>

                      <span className="text-sm font-medium capitalize text-slate-900">
                        {shipment.package_type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">Delivery</span>

                      <span className="text-sm font-medium text-slate-900">
                        {shipment.is_express ? "Express" : "Standard"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">Created</span>

                      <span className="text-right text-sm font-medium text-slate-900">
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <ShieldCheck className="h-5 w-5 text-slate-700" />
                  </div>

                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
                    Looking for more details?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to your customer account to access your complete
                    shipment information and account features.
                  </p>

                  <Link href="/login" className="mt-5 block">
                    <Button variant="outline" className="w-full">
                      Sign in to your account
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-slate-950">
                <CardContent className="p-6">
                  <Truck className="h-6 w-6 text-cyan-400" />

                  <h3 className="mt-4 font-display text-lg font-semibold text-white">
                    Need help?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    If you have a question about this shipment, our support team
                    can help.
                  </p>

                  <Link href="/contact" className="mt-5 block">
                    <Button className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                      Contact support
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer note */}
      <section className="border-t border-slate-200 bg-white">
        <div className="container-lg mx-auto px-4 py-8 text-center sm:px-6">
          <p className="text-xs leading-5 text-slate-500">
            Public tracking displays limited shipment information for security
            and privacy. Additional shipment information is available to
            authorized account holders.
          </p>
        </div>
      </section>
    </main>
  );
}
