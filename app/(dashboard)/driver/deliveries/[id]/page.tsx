import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/stat-card";
import { TrackingTimeline } from "@/components/shared/tracking-timeline";
import { formatCurrency } from "@/lib/utils";
import { DeliveryActions } from "./delivery-actions";
import { MapPin, Phone, User } from "lucide-react";
import { ShipmentStatus } from "@/types/app";

export default async function DriverDeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, supabase } = await requireRole(["driver"]);

  // Get the driver's database ID
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (driverError || !driver) {
    console.error("DRIVER ERROR:", driverError);
    notFound();
  }

  // Next.js 15/16: unwrap params
  const { id } = await params;

  // Only allow this driver to access their assigned shipment
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", id)
    .eq("driver_id", driver.id)
    .single();

  if (shipmentError || !shipment) {
    console.error("SHIPMENT ERROR:", shipmentError);
    notFound();
  }

  const { data: events, error: eventsError } = await supabase
    .from("shipment_events")
    .select("status, created_at, note")
    .eq("shipment_id", shipment.id)
    .order("created_at", { ascending: true });

  if (eventsError) {
    console.error("TRACKING EVENTS ERROR:", eventsError);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header Section with Blue Accent Ring */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600"></span>
            </span>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-blue-600">
              Tracking number
            </p>
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-tight text-slate-900">
            {shipment.tracking_number}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge status={shipment.status as ShipmentStatus} />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (Primary Info & Actions) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Route Details Card */}
          <Card className="overflow-hidden border-indigo-100/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-2.5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-slate-50/30 px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <MapPin className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Route Details
              </h2>
            </CardHeader>

            <CardContent className="p-6">
              <div className="relative space-y-6 pl-6 before:absolute before:bottom-3 before:left-2 before:top-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-emerald-500">
                {/* Pickup Node */}
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-4 ring-blue-100"></span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Pickup Address
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {shipment.pickup_address}
                  </p>
                </div>

                {/* Delivery Node */}
                <div className="relative space-y-1">
                  <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-600 ring-4 ring-emerald-100"></span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Delivery Destination
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {shipment.delivery_address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Status Card */}
          <Card className="overflow-hidden border-slate-200/80 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Update Status
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <DeliveryActions
                shipmentId={shipment.id}
                currentStatus={shipment.status as ShipmentStatus}
              />
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="overflow-hidden border-slate-200/80 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Tracking History
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <TrackingTimeline
                status={shipment.status as ShipmentStatus}
                events={(events ?? []).map((event) => ({
                  ...event,
                  status: event.status as ShipmentStatus,
                }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar (Metadata) */}
        <div className="space-y-6">
          {/* Sender Info Card */}
          <Card className="overflow-hidden border-blue-100/80 bg-gradient-to-b from-blue-50/30 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-blue-100/60 bg-blue-50/50 px-5 py-3.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <User className="h-3.5 w-3.5" />
              </div>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-blue-700">
                Sender Information
              </h2>
            </CardHeader>

            <CardContent className="p-5 space-y-2 text-sm">
              <p className="font-semibold text-slate-900">
                {shipment.sender_name}
              </p>
              <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Phone className="h-3.5 w-3.5 text-blue-500" />
                {shipment.sender_phone}
              </p>
            </CardContent>
          </Card>

          {/* Receiver Info Card */}
          <Card className="overflow-hidden border-purple-100/80 bg-gradient-to-b from-purple-50/30 to-white shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-purple-100/60 bg-purple-50/50 px-5 py-3.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                <User className="h-3.5 w-3.5" />
              </div>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-purple-700">
                Receiver Information
              </h2>
            </CardHeader>

            <CardContent className="p-5 space-y-2 text-sm">
              <p className="font-semibold text-slate-900">
                {shipment.receiver_name}
              </p>
              <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Phone className="h-3.5 w-3.5 text-purple-500" />
                {shipment.receiver_phone}
              </p>
            </CardContent>
          </Card>

          {/* Package Specs Card */}
          <Card className="overflow-hidden border-slate-200/80 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-600">
                Package Specifications
              </h2>
            </CardHeader>

            <CardContent className="divide-y divide-slate-100 p-0 text-xs">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="font-medium text-slate-500">Package Type</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold capitalize text-slate-700">
                  {shipment.package_type}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-3">
                <span className="font-medium text-slate-500">Weight</span>
                <span className="font-mono font-semibold text-slate-800">
                  {shipment.weight_kg} kg
                </span>
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50/80 to-teal-50/40 px-5 py-4">
                <span className="font-semibold text-emerald-800">
                  Your Payout
                </span>
                <span className="font-mono text-base font-bold text-emerald-600">
                  {formatCurrency(Number(shipment.price) * 0.75)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
