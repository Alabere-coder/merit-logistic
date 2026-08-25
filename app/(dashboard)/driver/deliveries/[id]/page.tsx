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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-navy-400">
            Tracking number
          </p>

          <h1 className="font-mono text-2xl font-700 text-navy-900">
            {shipment.tracking_number}
          </h1>
        </div>

        <StatusBadge status={shipment.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-navy-400" />

              <h2 className="font-display text-base font-600 text-navy-900">
                Route
              </h2>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-navy-400">Pickup</p>
                <p className="text-navy-800">{shipment.pickup_address}</p>
              </div>

              <div>
                <p className="text-xs text-navy-400">Delivery</p>
                <p className="text-navy-800">{shipment.delivery_address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-600 text-navy-900">
                Update status
              </h2>
            </CardHeader>

            <CardContent>
              <DeliveryActions
                shipmentId={shipment.id}
                currentStatus={shipment.status as ShipmentStatus}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-base font-600 text-navy-900">
                Tracking history
              </h2>
            </CardHeader>

            <CardContent>
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

        <div className="space-y-6">
          {/* Sender */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <User className="h-4 w-4 text-navy-400" />

              <h2 className="font-display text-sm font-600 text-navy-900">
                Sender
              </h2>
            </CardHeader>

            <CardContent className="space-y-1.5 text-sm">
              <p className="font-medium text-navy-800">
                {shipment.sender_name}
              </p>

              <p className="flex items-center gap-1.5 text-navy-500">
                <Phone className="h-3.5 w-3.5" />
                {shipment.sender_phone}
              </p>
            </CardContent>
          </Card>

          {/* Receiver */}
          <Card>
            <CardHeader className="flex items-center gap-2">
              <User className="h-4 w-4 text-navy-400" />

              <h2 className="font-display text-sm font-600 text-navy-900">
                Receiver
              </h2>
            </CardHeader>

            <CardContent className="space-y-1.5 text-sm">
              <p className="font-medium text-navy-800">
                {shipment.receiver_name}
              </p>

              <p className="flex items-center gap-1.5 text-navy-500">
                <Phone className="h-3.5 w-3.5" />
                {shipment.receiver_phone}
              </p>
            </CardContent>
          </Card>

          {/* Package */}
          <Card>
            <CardHeader>
              <h2 className="font-display text-sm font-600 text-navy-900">
                Package
              </h2>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Type</span>

                <span className="font-medium capitalize text-navy-800">
                  {shipment.package_type}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-navy-500">Weight</span>

                <span className="font-medium text-navy-800">
                  {shipment.weight_kg} kg
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-navy-500">Your payout</span>

                <span className="font-medium text-navy-800">
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
