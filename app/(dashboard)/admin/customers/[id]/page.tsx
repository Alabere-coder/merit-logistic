import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Package,
  CheckCircle2,
  Clock3,
  CreditCard,
  Truck,
  UserRound,
} from "lucide-react";

import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getStatusClasses(status: string) {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";

    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";

    case "approved":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";

    case "picked_up":
    case "in_transit":
      return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";

    case "arrived_at_warehouse":
    case "out_for_delivery":
    case "arrived_at_delivery_destination":
      return "bg-cyan-50 text-cyan-700 ring-cyan-600/20";

    default:
      return "bg-slate-50 text-slate-600 ring-slate-500/20";
  }
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPaymentStatusClasses(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "failed":
      return "bg-rose-50 text-rose-700 ring-rose-600/20";

    case "refunded":
      return "bg-violet-50 text-violet-700 ring-violet-600/20";

    case "pending":
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
}

function formatPaymentStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminCustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  await requireRole(["admin"]);

  const { id } = await params;

  const supabase = await createClient();

  /* ========================================================
     CUSTOMER
  ======================================================== */

  const { data: customer, error: customerError } = await supabase
    .from("users")
    .select(
      `
          id,
          first_name,
          last_name,
          email,
          phone_number,
          avatar_url,
          role,
          is_active,
          created_at,
          updated_at
        `,
    )
    .eq("id", id)
    .eq("role", "customer")
    .single();

  if (customerError || !customer) {
    notFound();
  }

  /* ========================================================
     CUSTOMER SHIPMENTS
  ======================================================== */

  const { data: shipments, error: shipmentsError } = await supabase
    .from("shipments")
    .select(
      `
          id,
          tracking_number,
          sender_name,
          receiver_name,
          pickup_address,
          delivery_address,
          package_type,
          weight_kg,
          price,
          status,
          estimated_delivery,
          created_at,
          updated_at
        `,
    )
    .eq("customer_id", id)
    .order("created_at", {
      ascending: false,
    });

  if (shipmentsError) {
    console.error("ADMIN CUSTOMER SHIPMENTS ERROR:", shipmentsError);
  }

  /* ========================================================
     CUSTOMER PAYMENTS
  ======================================================== */

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(
      `
          id,
          amount,
          payment_method,
          payment_status,
          transaction_reference,
          shipment_id,
          created_at
        `,
    )
    .eq("customer_id", id)
    .order("created_at", {
      ascending: false,
    });

  if (paymentsError) {
    console.error("ADMIN CUSTOMER PAYMENTS ERROR:", paymentsError);
  }

  const customerShipments = shipments ?? [];
  const customerPayments = payments ?? [];

  /* ========================================================
     STATS
  ======================================================== */

  const totalShipments = customerShipments.length;

  const deliveredShipments = customerShipments.filter(
    (shipment) => shipment.status === "delivered",
  ).length;

  const activeShipments = customerShipments.filter(
    (shipment) => !["delivered", "cancelled"].includes(shipment.status),
  ).length;

  const totalSpent = customerPayments
    .filter((payment) => payment.payment_status === "paid")
    .reduce((total, payment) => total + Number(payment.amount), 0);

  const fullName = `${customer.first_name} ${customer.last_name}`.trim();

  const initials =
    `${customer.first_name?.charAt(0) ?? ""}${customer.last_name?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/customers"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-sm font-bold text-white shadow-sm">
              {initials || <UserRound className="h-5 w-5" />}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {fullName || "Customer"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Customer profile and activity
              </p>
            </div>
          </div>
        </div>

        <span
          className={
            customer.is_active
              ? "inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20"
              : "inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20"
          }
        >
          <span
            className={
              customer.is_active
                ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                : "h-1.5 w-1.5 rounded-full bg-rose-500"
            }
          />
          {customer.is_active ? "Active account" : "Inactive account"}
        </span>
      </div>

      {/* ==================================================
          CUSTOMER INFORMATION
      ================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <UserRound className="h-5 w-5 text-cyan-600" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer information
              </h2>

              <p className="text-xs text-slate-500">
                Account and contact details
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Full name
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {fullName || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </p>

              <a
                href={`mailto:${customer.email}`}
                className="mt-1 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Mail className="h-4 w-4" />
                {customer.email}
              </a>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>

              {customer.phone_number ? (
                <a
                  href={`tel:${customer.phone_number}`}
                  className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  <Phone className="h-4 w-4 text-slate-400" />
                  {customer.phone_number}
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-400">No phone number</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Customer since
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                {formatDate(customer.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">
            Account summary
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm text-slate-500">Account status</span>

              <span
                className={
                  customer.is_active
                    ? "text-sm font-semibold text-emerald-600"
                    : "text-sm font-semibold text-rose-600"
                }
              >
                {customer.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm text-slate-500">Customer ID</span>

              <span
                title={customer.id}
                className="max-w-37.5 truncate font-mono text-xs text-slate-400"
              >
                {customer.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Last updated</span>

              <span className="text-xs font-medium text-slate-600">
                {formatDate(customer.updated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          STAT CARDS
      ================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total shipments */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total shipments
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalShipments}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Package className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Active shipments
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {activeShipments}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Clock3 className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Delivered
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {deliveredShipments}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <CheckCircle2 className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
        </div>

        {/* Total spent */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total spent
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalSpent)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <CreditCard className="h-5 w-5 text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SHIPMENTS
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Shipment history
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Shipments created by this customer
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {totalShipments} shipment
            {totalShipments === 1 ? "" : "s"}
          </span>
        </div>

        {customerShipments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Package className="h-6 w-6 text-slate-400" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              No shipments yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              This customer has not created any shipments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Shipment
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Route
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Package
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Price
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {customerShipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/shipments/${shipment.id}`}
                        className="group"
                      >
                        <span className="block font-mono text-xs font-bold text-blue-600 group-hover:text-blue-700">
                          {shipment.tracking_number}
                        </span>

                        <span className="mt-1 block text-xs text-slate-400">
                          {formatDate(shipment.created_at)}
                        </span>
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex max-w-70 items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-700">
                            {shipment.pickup_address}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            → {shipment.delivery_address}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold capitalize text-slate-700">
                        {shipment.package_type}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {shipment.weight_kg} kg
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${getStatusClasses(
                          shipment.status,
                        )}`}
                      >
                        {formatStatus(shipment.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-800">
                        {formatCurrency(Number(shipment.price))}
                      </p>

                      {shipment.estimated_delivery && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          ETA {formatDate(shipment.estimated_delivery)}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================
          PAYMENTS
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Payment history
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Payments associated with this customer
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {customerPayments.length} payment
            {customerPayments.length === 1 ? "" : "s"}
          </span>
        </div>

        {customerPayments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <CreditCard className="h-6 w-6 text-slate-400" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              No payments yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              This customer has no recorded payments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Reference
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Shipment
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Method
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {customerPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-semibold text-slate-700">
                        {payment.transaction_reference ?? "—"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDate(payment.created_at)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      {payment.shipment_id ? (
                        <Link
                          href={`/admin/shipments/${payment.shipment_id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          View shipment
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-medium capitalize text-slate-700">
                        {payment.payment_method?.replace(/_/g, " ") ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${getPaymentStatusClasses(
                          payment.payment_status,
                        )}`}
                      >
                        {formatPaymentStatus(payment.payment_status)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(Number(payment.amount))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
