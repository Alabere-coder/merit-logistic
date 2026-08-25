import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Package,
  User,
  Phone,
  Truck,
  CreditCard,
  CalendarDays,
} from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/stat-card";
import { AssignDriverSelect } from "@/components/dashboard/assign-driver-select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShipmentStatus } from "@/types/app";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminShipmentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { supabase } = await requireRole(["admin"]);

  const [{ data: shipment, error: shipmentError }, { data: activeDrivers }] =
    await Promise.all([
      supabase
        .from("shipments")
        .select(
          `
          id,
          tracking_number,
          status,
          price,
          driver_id,
          customer_id,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          pickup_address,
          delivery_address,
          package_type,
          weight_kg,
          proof_of_delivery_url,
          created_at,
          customer:customer_id (
            first_name,
            last_name,
            email,
            phone_number
          ),
          driver:driver_id (
            id,
            user_id,
            users:user_id (
              first_name,
              last_name
            )
          )
        `,
        )
        .eq("id", id)
        .single(),

      supabase
        .from("drivers")
        .select(
          `
          id,
          users:user_id (
            first_name,
            last_name
          )
        `,
        )
        .eq("status", "active"),
    ]);

  if (shipmentError || !shipment) {
    notFound();
  }

  const driverOptions = (activeDrivers ?? []).map((driver: any) => ({
    id: driver.id,
    name:
      `${driver.users?.first_name ?? ""} ${
        driver.users?.last_name ?? ""
      }`.trim() || "Unnamed driver",
  }));

  const customerName =
    `${shipment.customer?.first_name ?? ""} ${
      shipment.customer?.last_name ?? ""
    }`.trim() || "Unknown customer";

  const driverName =
    `${shipment.driver?.users?.first_name ?? ""} ${
      shipment.driver?.users?.last_name ?? ""
    }`.trim() || null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/shipments"
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </Link>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Shipment Details
              </h1>
              <StatusBadge status={shipment.status as ShipmentStatus} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tracking ID:
              </span>
              <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
                {shipment.tracking_number}
              </p>
            </div>
          </div>
        </div>

        {/* Driver assignment */}
        {["pending", "approved"].includes(shipment.status) && (
          <div className="flex items-center gap-2 sm:pt-0">
            <AssignDriverSelect
              shipmentId={shipment.id}
              currentDriverId={shipment.driver_id}
              drivers={driverOptions}
            />
          </div>
        )}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Package Type */}
        <Card className="border-slate-200/80 bg-white shadow-xs transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Package Type
                </p>
                <p className="mt-0.5 text-base font-bold capitalize text-slate-900 dark:text-white">
                  {shipment.package_type}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Cost */}
        <Card className="border-slate-200/80 bg-white shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Shipping Cost
                </p>
                <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(Number(shipment.price))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver */}
        <Card className="border-slate-200/80 bg-white shadow-xs transition-all hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Assigned Driver
                </p>
                <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                  {driverName ?? (
                    <span className="font-normal italic text-slate-400">
                      Not assigned
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Created */}
        <Card className="border-slate-200/80 bg-white shadow-xs transition-all hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Created Date
                </p>
                <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                  {formatDate(shipment.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Info Card */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <User className="h-4 w-4 text-slate-500" />
            Customer Details
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {customerName}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                {shipment.customer?.email ?? (
                  <span className="text-slate-400">—</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Phone Number
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {shipment.customer?.phone_number ?? (
                  <span className="text-slate-400">—</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sender / Receiver Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pickup Card */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Pickup Location
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sender Details
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {shipment.sender_name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {shipment.sender_phone}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pickup Address
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {shipment.pickup_address}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Card */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Delivery Location
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Receiver Details
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {shipment.receiver_name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {shipment.receiver_phone}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Delivery Address
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {shipment.delivery_address}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Details Section */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Package Specifications
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tracking Number
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
                {shipment.tracking_number}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Package Type
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-slate-900 dark:text-white">
                {shipment.package_type}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Weight
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {shipment.weight_kg} kg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proof of Delivery */}
      {shipment.proof_of_delivery_url && (
        <Card className="overflow-hidden border-slate-200 bg-slate-50/50 shadow-xs dark:border-slate-800 dark:bg-slate-900/50">
          <CardHeader className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Proof of Delivery
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Proof of delivery document has been verified and uploaded for this
              shipment.
            </p>

            <a
              href={shipment.proof_of_delivery_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block break-all font-mono text-xs font-medium text-blue-600 underline underline-offset-4 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {shipment.proof_of_delivery_url}
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
