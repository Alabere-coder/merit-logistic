import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Phone,
  User,
  Wallet,
} from "lucide-react";
import { CancelShipmentButton } from "./cancel-button";
import { PaymentMethodSelector } from "@/components/customer/payment-method-selector";

type ShipmentPageProps = {
  params: Promise<{
    trackingNumber: string;
  }>;
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function ShipmentDetailPage({
  params,
  searchParams,
}: ShipmentPageProps) {
  const { trackingNumber } = await params;
  const { created } = await searchParams;

  const { user, supabase } = await requireRole(["customer"]);

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select(
      `
    *,
    payments (
      id,
      amount,
      payment_status,
      payment_method,
      transaction_reference,
      created_at
    )
  `,
    )
    .eq("tracking_number", trackingNumber)
    .eq("customer_id", user.id)
    .single();

  if (error || !shipment) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Back Button */}
      <Link
        href="/customer"
        className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to shipments
      </Link>

      {/* Success banner */}
      {created === "true" && (
        <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800 shadow-sm backdrop-blur-xs">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="space-y-0.5">
            <p className="font-semibold text-emerald-900">
              Shipment created successfully!
            </p>
            <p className="text-emerald-700">
              Your shipment has been registered and is queued up for processing.
            </p>
          </div>
        </div>
      )}

      {/* Header with Styled Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tracking number
          </p>
          <h1 className="font-mono text-3xl font-extrabold tracking-tight text-slate-900">
            {shipment.tracking_number}
          </h1>
        </div>

        <StatusBadge
          status={
            shipment.status as Parameters<typeof StatusBadge>[0]["status"]
          }
        />
      </div>

      {/* Shipment details grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sender / Receiver Card (Blue Theme) */}
        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-linear-to-r from-blue-50/60 to-transparent pb-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 shadow-2xs">
                <User className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Shipment contacts
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Sender */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                Sender
              </p>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-white p-1.5 text-slate-400 border border-slate-200/60 shadow-2xs">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">
                    {shipment.sender_name}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {shipment.sender_phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Receiver */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                Receiver
              </p>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-white p-1.5 text-slate-400 border border-slate-200/60 shadow-2xs">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">
                    {shipment.receiver_name}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {shipment.receiver_phone}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Card (Emerald Theme) */}
        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-linear-to-r from-emerald-50/60 to-transparent pb-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600 shadow-2xs">
                <MapPin className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Delivery route
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="relative pl-6 before:absolute before:left-2 before:top-3 before:h-[calc(100%-12px)] before:w-0.5 before:bg-slate-200">
              {/* Pickup */}
              <div className="relative mb-6">
                <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Pickup Location
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {shipment.pickup_address}
                </p>
              </div>

              {/* Delivery */}
              <div className="relative">
                <span className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 ring-4 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Destination Address
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {shipment.delivery_address}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Specs Card (Purple Theme) */}
        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-linear-to-r from-purple-50/60 to-transparent pb-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-purple-100 p-2.5 text-purple-600 shadow-2xs">
                <Package className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Package information
              </h2>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-4 pt-6">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Package type
              </p>
              <p className="mt-1 text-base font-bold capitalize text-slate-900">
                {shipment.package_type}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Weight
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">
                {shipment.weight_kg} kg
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary Card (Amber Theme) */}
        <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-linear-to-r from-amber-50/60 to-transparent pb-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600 shadow-2xs">
                <Wallet className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Shipment cost
              </h2>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Total Charged
                </p>

                <p className="mt-1 font-display text-3xl font-extrabold text-slate-900">
                  {formatCurrency(Number(shipment.price))}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">Date Logged</p>

                <p className="mt-1 text-xs font-medium text-slate-600">
                  {formatDate(shipment.created_at)}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <PaymentMethodSelector
                shipmentId={shipment.id}
                amount={Number(shipment.price)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link href="/customer">
          <Button variant="outline" className="border-slate-300">
            Back to dashboard
          </Button>
        </Link>

        <Link href="/customer/shipments/new">
          <Button className="bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700">
            Create another shipment
          </Button>
        </Link>

        {["pending", "approved"].includes(shipment.status) && (
          <CancelShipmentButton shipmentId={shipment.id} />
        )}
      </div>
    </div>
  );
}
